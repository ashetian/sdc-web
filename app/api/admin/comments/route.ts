import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Comment from '@/app/lib/models/Comment';
import { verifyAuth } from '@/app/lib/auth';

// GET - All comments for admin (with optional deleted filter)
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Check JWT auth (admin access controlled by frontend AdminGuard)
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const contentType = searchParams.get('type');
        const showDeleted = searchParams.get('deleted') === 'true';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '30');

        const query: { contentType?: string; isDeleted?: boolean | { $ne: boolean } } = {};

        if (contentType && ['project', 'gallery', 'announcement'].includes(contentType)) {
            query.contentType = contentType;
        }

        // Filter by deleted status
        if (showDeleted) {
            query.isDeleted = true;
        } else {
            query.isDeleted = { $ne: true };
        }

        const total = await Comment.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        const comments = await Comment.find(query)
            .populate('memberId', 'fullName nickname studentNo')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        // Get content titles
        const enrichedComments = await Promise.all(comments.map(async (comment) => {
            let contentTitle = 'Bilinmiyor';

            try {
                if (comment.contentType === 'project') {
                    const Project = (await import('@/app/lib/models/Project')).default;
                    const project = await Project.findById(comment.contentId);
                    contentTitle = project?.title || 'Silinmiş Proje';
                } else if (comment.contentType === 'announcement') {
                    const { Announcement } = await import('@/app/lib/models/Announcement');
                    const announcement = await Announcement.findById(comment.contentId);
                    contentTitle = announcement?.title || 'Silinmiş Duyuru';
                } else if (comment.contentType === 'gallery') {
                    const { Announcement } = await import('@/app/lib/models/Announcement');
                    const gallery = await Announcement.findById(comment.contentId);
                    contentTitle = gallery?.title || 'Silinmiş Galeri';
                }
            } catch {
                contentTitle = 'Hata';
            }

            const member = comment.memberId as unknown as {
                fullName: string;
                nickname?: string;
                studentNo: string;
            };

            return {
                _id: comment._id,
                contentType: comment.contentType,
                contentId: comment.contentId,
                contentTitle,
                content: comment.content,
                isDeleted: comment.isDeleted,
                deletedAt: comment.deletedAt,
                createdAt: comment.createdAt,
                author: {
                    fullName: member?.fullName || 'Bilinmiyor',
                    nickname: member?.nickname,
                    studentNo: member?.studentNo,
                },
            };
        }));

        return NextResponse.json({
            comments: enrichedComments,
            pagination: { page, limit, total, totalPages }
        });
    } catch (error) {
        console.error('Admin comments fetch error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// PUT - Restore deleted comment or permanently delete
export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        // Check JWT auth
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const body = await request.json();
        const { commentId, action } = body;

        if (!commentId || !action) {
            return NextResponse.json({ error: 'commentId ve action gerekli' }, { status: 400 });
        }

        // Import logAdminAction
        const { logAdminAction, AUDIT_ACTIONS } = await import('@/app/lib/utils/logAdminAction');

        if (action === 'restore') {
            // Restore deleted comment
            const comment = await Comment.findByIdAndUpdate(
                commentId,
                { isDeleted: false, $unset: { deletedAt: 1 } },
                { new: true }
            );
            if (!comment) {
                return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 });
            }

            // Log the action
            await logAdminAction({
                adminId: user.userId,
                adminName: user.nickname || user.studentNo,
                action: AUDIT_ACTIONS.RESTORE_COMMENT,
                targetType: 'Comment',
                targetId: commentId,
                targetName: comment.content.substring(0, 50),
                details: `Yorum geri yüklendi: ${comment.contentType}`,
            });

            return NextResponse.json({ message: 'Yorum geri yüklendi' });
        } else if (action === 'permanentDelete') {
            // Permanently delete
            const comment = await Comment.findByIdAndDelete(commentId);
            if (!comment) {
                return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 });
            }

            // Log the action
            await logAdminAction({
                adminId: user.userId,
                adminName: user.nickname || user.studentNo,
                action: AUDIT_ACTIONS.DELETE_COMMENT,
                targetType: 'Comment',
                targetId: commentId,
                targetName: comment.content.substring(0, 50),
                details: `Yorum kalıcı olarak silindi: ${comment.contentType}`,
            });

            return NextResponse.json({ message: 'Yorum kalıcı olarak silindi' });
        }

        return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
    } catch (error) {
        console.error('Admin comment action error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// DELETE - Cleanup old deleted comments (30+ days)
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();

        // Check JWT auth
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        // Delete comments that were soft-deleted more than 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await Comment.deleteMany({
            isDeleted: true,
            deletedAt: { $lt: thirtyDaysAgo }
        });

        return NextResponse.json({
            message: `${result.deletedCount} eski yorum kalıcı olarak silindi`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Cleanup error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
