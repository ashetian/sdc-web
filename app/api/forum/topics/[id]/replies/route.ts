import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import ForumReply from '@/app/lib/models/ForumReply';
import ForumTopic from '@/app/lib/models/ForumTopic';
import Member from '@/app/lib/models/Member';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');
const SPAM_COOLDOWN_MS = 30000; // 30 seconds between replies

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST - Add reply to topic
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();
        const { id: topicId } = await params;

        // Check auth
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

        const member = await Member.findById(memberId);
        if (!member) {
            return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 });
        }

        // Check if topic exists and is not locked
        const topic = await ForumTopic.findById(topicId);
        if (!topic || topic.isDeleted) {
            return NextResponse.json({ error: 'Konu bulunamadı' }, { status: 404 });
        }

        if (topic.isLocked) {
            return NextResponse.json({ error: 'Bu konu kilitli, yanıt eklenemez' }, { status: 403 });
        }

        // Spam protection
        const lastReply = await ForumReply.findOne({ authorId: memberId }).sort({ createdAt: -1 });
        if (lastReply) {
            const timeSinceLast = Date.now() - new Date(lastReply.createdAt).getTime();
            if (timeSinceLast < SPAM_COOLDOWN_MS) {
                const remainingSeconds = Math.ceil((SPAM_COOLDOWN_MS - timeSinceLast) / 1000);
                return NextResponse.json({
                    error: `Lütfen ${remainingSeconds} saniye bekleyin`
                }, { status: 429 });
            }
        }

        const body = await request.json();
        const { content, parentId } = body;

        if (!content || content.trim().length === 0) {
            return NextResponse.json({ error: 'Yanıt içeriği boş olamaz' }, { status: 400 });
        }

        if (content.length > 5000) {
            return NextResponse.json({ error: 'Yanıt en fazla 5000 karakter olabilir' }, { status: 400 });
        }

        // If parentId provided, verify it exists
        if (parentId) {
            const parentReply = await ForumReply.findById(parentId);
            if (!parentReply || parentReply.isDeleted) {
                return NextResponse.json({ error: 'Üst yanıt bulunamadı' }, { status: 404 });
            }
        }

        const reply = await ForumReply.create({
            topicId,
            authorId: member._id,
            parentId: parentId || undefined,
            content: content.trim(),
        });

        // Update topic reply count and last reply info
        await ForumTopic.findByIdAndUpdate(topicId, {
            $inc: { replyCount: 1 },
            lastReplyAt: new Date(),
            lastReplyById: member._id,
        });

        const populatedReply = await ForumReply.findById(reply._id)
            .populate('authorId', 'fullName nickname avatar department');

        return NextResponse.json(populatedReply, { status: 201 });
    } catch (error) {
        console.error('Forum reply create error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
