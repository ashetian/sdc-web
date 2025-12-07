import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Comment from '@/app/lib/models/Comment';
import Member from '@/app/lib/models/Member';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');
const SPAM_COOLDOWN_MS = 60000; // 1 minute between comments

// GET - List comments for content
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const contentType = searchParams.get('type');
        const contentId = searchParams.get('id');

        if (!contentType || !contentId) {
            return NextResponse.json({ error: 'type ve id parametreleri gerekli' }, { status: 400 });
        }

        if (!['project', 'gallery', 'announcement'].includes(contentType)) {
            return NextResponse.json({ error: 'Geçersiz içerik türü' }, { status: 400 });
        }

        // Only show non-deleted comments
        // Fetch all comments (both parents and replies)
        const comments = await Comment.find({ contentType, contentId, isDeleted: { $ne: true } })
            .populate('memberId', 'fullName nickname department avatar profileVisibility')
            .sort({ createdAt: -1 }); // Newest first

        const sanitizedComments = comments.map(comment => {
            const member = comment.memberId as unknown as {
                _id: string;
                fullName: string;
                nickname?: string;
                department?: string;
                avatar?: string;
                profileVisibility?: { showFullName: boolean; showDepartment: boolean };
            };
            const visibility = member?.profileVisibility || { showFullName: false, showDepartment: true };

            return {
                _id: comment._id,
                content: comment.content,
                isEdited: comment.isEdited,
                createdAt: comment.createdAt,
                parentId: comment.parentId ? comment.parentId.toString() : null, // Ensure string format
                author: {
                    _id: member?._id,
                    nickname: member?.nickname || 'Anonim',
                    avatar: member?.avatar,
                    fullName: visibility.showFullName ? member?.fullName : undefined,
                    department: visibility.showDepartment ? member?.department : undefined,
                },
            };
        });

        // Backend doesn't nest them, frontend will handle the tree structure
        return NextResponse.json(sanitizedComments);
    } catch (error) {
        console.error('Comments fetch error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// POST - Add comment with spam protection
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const contentType = searchParams.get('type');
        const contentId = searchParams.get('id');

        if (!contentType || !contentId) {
            return NextResponse.json({ error: 'type ve id parametreleri gerekli' }, { status: 400 });
        }

        if (!['project', 'gallery', 'announcement'].includes(contentType)) {
            return NextResponse.json({ error: 'Geçersiz içerik türü' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Yorum yapmak için giriş yapmalısınız' }, { status: 401 });
        }

        let memberId: string;
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            memberId = payload.memberId as string;
        } catch {
            return NextResponse.json({ error: 'Oturum geçersiz' }, { status: 401 });
        }

        const member = await Member.findById(memberId);
        if (!member) {
            return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 });
        }

        // Spam protection: Check last comment time
        const lastComment = await Comment.findOne({ memberId }).sort({ createdAt: -1 });
        if (lastComment) {
            const timeSinceLastComment = Date.now() - new Date(lastComment.createdAt).getTime();
            if (timeSinceLastComment < SPAM_COOLDOWN_MS) {
                const remainingSeconds = Math.ceil((SPAM_COOLDOWN_MS - timeSinceLastComment) / 1000);
                return NextResponse.json({
                    error: `Spam koruması: ${remainingSeconds} saniye bekleyin`
                }, { status: 429 });
            }
        }

        const body = await request.json();
        const { content, parentId } = body; // ParentId from body

        if (!content || content.trim().length === 0) {
            return NextResponse.json({ error: 'Yorum içeriği boş olamaz' }, { status: 400 });
        }

        if (content.length > 500) {
            return NextResponse.json({ error: 'Yorum en fazla 500 karakter olabilir' }, { status: 400 });
        }

        const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
        if (urlPattern.test(content)) {
            return NextResponse.json({ error: 'Yorumlara link eklenemez' }, { status: 400 });
        }

        // Verify parent comment exists if parentId is provided
        if (parentId) {
            const parentComment = await Comment.findById(parentId);
            if (!parentComment) {
                return NextResponse.json({ error: 'Yanıtlanacak yorum bulunamadı' }, { status: 404 });
            }
            if (parentComment.contentType !== contentType || parentComment.contentId.toString() !== contentId) {
                return NextResponse.json({ error: 'Yorum bağlamı uyuşmuyor' }, { status: 400 });
            }
        }

        const comment = await Comment.create({
            contentType,
            contentId,
            memberId: member._id,
            content: content.trim(),
            parentId: parentId || null,
        });

        // --- Notification Triggers ---
        try {
            const { createNotification, createAdminNotification } = await import('@/app/lib/notifications');

            // 1. If this is a reply, notify the parent comment author
            if (parentId) {
                const parentComment = await Comment.findById(parentId).populate('memberId', '_id');
                if (parentComment && parentComment.memberId._id.toString() !== memberId) {
                    await createNotification({
                        recipientId: parentComment.memberId._id,
                        type: 'comment_reply',
                        title: 'Yorumunuza yanıt geldi',
                        titleEn: 'New reply to your comment',
                        message: `${member.nickname || 'Bir kullanıcı'}: "${content.trim().slice(0, 50)}..."`,
                        messageEn: `${member.nickname || 'A user'}: "${content.trim().slice(0, 50)}..."`,
                        link: `/${contentType}s/${contentId}`,
                        relatedContentType: 'comment',
                        relatedContentId: comment._id,
                        actorId: memberId,
                    });
                }
            }

            // 2. If comment is on a project, notify project owner
            if (contentType === 'project') {
                const Project = (await import('@/app/lib/models/Project')).default;
                const project = await Project.findById(contentId);
                if (project && project.memberId && project.memberId.toString() !== memberId) {
                    await createNotification({
                        recipientId: project.memberId,
                        type: 'project_comment',
                        title: 'Projenize yorum yapıldı',
                        titleEn: 'New comment on your project',
                        message: `${member.nickname || 'Bir kullanıcı'} "${project.title}" projenize yorum yaptı`,
                        messageEn: `${member.nickname || 'A user'} commented on your project "${project.title}"`,
                        link: `/projects/${contentId}`,
                        relatedContentType: 'comment',
                        relatedContentId: comment._id,
                        actorId: memberId,
                    });
                }
            }

            // 3. Notify admins about new comment
            await createAdminNotification({
                type: 'admin_new_comment',
                title: 'Yeni yorum',
                titleEn: 'New comment',
                message: `${member.nickname || 'Bir kullanıcı'} yeni bir yorum yaptı`,
                messageEn: `${member.nickname || 'A user'} posted a new comment`,
                link: '/admin/comments',
                relatedContentType: 'comment',
                relatedContentId: comment._id,
                actorId: memberId,
            });
        } catch (notifError) {
            console.error('Notification error:', notifError);
            // Don't fail the request if notification fails
        }
        // --- End Notification Triggers ---

        return NextResponse.json({
            message: 'Yorum eklendi',
            comment: {
                _id: comment._id,
                content: comment.content,
                createdAt: comment.createdAt,
                parentId: comment.parentId,
                author: { _id: member._id, nickname: member.nickname || 'Anonim' },
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Comment create error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// DELETE - Delete comment (owner or admin)
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const commentId = searchParams.get('id');

        if (!commentId) {
            return NextResponse.json({ error: 'id parametresi gerekli' }, { status: 400 });
        }

        // Check if admin request
        const adminPassword = request.headers.get('x-admin-password');
        if (adminPassword === process.env.ADMIN_PASSWORD) {
            // Admin soft delete
            const comment = await Comment.findByIdAndUpdate(
                commentId,
                { isDeleted: true, deletedAt: new Date() },
                { new: true }
            );
            if (!comment) {
                return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 });
            }

            // Log the action
            const { logAdminAction, AUDIT_ACTIONS } = await import('@/app/lib/utils/logAdminAction');
            await logAdminAction({
                adminId: 'system',
                adminName: 'Admin',
                action: AUDIT_ACTIONS.DELETE_COMMENT,
                targetType: 'Comment',
                targetId: commentId,
                targetName: comment.content.substring(0, 50),
                details: `Yorum soft-delete: ${comment.contentType}`,
            });

            return NextResponse.json({ message: 'Yorum silindi (30 gün boyunca geri alınabilir)' });
        }

        // Regular user - check auth
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
        }

        let memberId: string;
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            memberId = payload.memberId as string;
        } catch {
            return NextResponse.json({ error: 'Oturum geçersiz' }, { status: 401 });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 });
        }

        // Check if user is admin
        const { default: TeamMember } = await import('@/app/lib/models/TeamMember');
        const { default: AdminAccess } = await import('@/app/lib/models/AdminAccess');

        const teamMember = await TeamMember.findOne({ memberId, isActive: true });
        const adminAccess = await AdminAccess.findOne({ memberId });
        const isAdmin = (teamMember && ['president', 'vice_president'].includes(teamMember.role)) || adminAccess;

        // Allow if owner OR admin
        if (comment.memberId.toString() !== memberId && !isAdmin) {
            return NextResponse.json({ error: 'Bu yorumu silme yetkiniz yok' }, { status: 403 });
        }

        // Soft delete logic (same for owner or admin)
        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );

        // If it was an admin action (and not their own comment), log it
        if (isAdmin && comment.memberId.toString() !== memberId) {
            const { logAdminAction, AUDIT_ACTIONS } = await import('@/app/lib/utils/logAdminAction');
            await logAdminAction({
                adminId: memberId,
                adminName: 'Admin (Session)',
                action: AUDIT_ACTIONS.DELETE_COMMENT,
                targetType: 'Comment',
                targetId: commentId,
                targetName: comment.content.substring(0, 50),
                details: `Yorum soft-delete: ${comment.contentType}`,
            });
        }

        return NextResponse.json({ message: 'Yorum silindi' });
    } catch (error) {
        console.error('Comment delete error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
