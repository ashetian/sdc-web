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
        const comments = await Comment.find({ contentType, contentId, isDeleted: { $ne: true } })
            .populate('memberId', 'fullName nickname department avatar profileVisibility')
            .sort({ createdAt: -1 });

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
                author: {
                    _id: member?._id,
                    nickname: member?.nickname || 'Anonim',
                    avatar: member?.avatar,
                    fullName: visibility.showFullName ? member?.fullName : undefined,
                    department: visibility.showDepartment ? member?.department : undefined,
                },
            };
        });

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
        const { content } = body;

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

        const comment = await Comment.create({
            contentType,
            contentId,
            memberId: member._id,
            content: content.trim(),
        });

        return NextResponse.json({
            message: 'Yorum eklendi',
            comment: {
                _id: comment._id,
                content: comment.content,
                createdAt: comment.createdAt,
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

        if (comment.memberId.toString() !== memberId) {
            return NextResponse.json({ error: 'Bu yorumu silme yetkiniz yok' }, { status: 403 });
        }

        // User soft delete
        await Comment.findByIdAndUpdate(commentId, {
            isDeleted: true,
            deletedAt: new Date()
        });
        return NextResponse.json({ message: 'Yorum silindi' });
    } catch (error) {
        console.error('Comment delete error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
