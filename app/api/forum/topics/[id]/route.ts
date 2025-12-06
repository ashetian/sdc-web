import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import ForumTopic from '@/app/lib/models/ForumTopic';
import ForumReply from '@/app/lib/models/ForumReply';
import ForumVote from '@/app/lib/models/ForumVote';
import ForumCategory from '@/app/lib/models/ForumCategory';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');

interface RouteParams {
    params: Promise<{ id: string }>;
}

async function getMemberId(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload.memberId as string;
    } catch {
        return null;
    }
}

async function isAdmin(request: NextRequest): Promise<boolean> {
    const adminPassword = request.headers.get('x-admin-password');
    if (adminPassword === process.env.ADMIN_PASSWORD) {
        return true;
    }
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (token) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            return payload.isAdmin === true;
        } catch {
            return false;
        }
    }
    return false;
}

// GET - Get topic with replies
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();
        const { id } = await params;

        const topic = await ForumTopic.findById(id)
            .populate('categoryId', 'name nameEn slug icon color')
            .populate('authorId', 'fullName nickname avatar department');

        if (!topic || topic.isDeleted) {
            return NextResponse.json({ error: 'Konu bulunamadı' }, { status: 404 });
        }

        // Increment view count
        await ForumTopic.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

        // Get replies
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');

        const replies = await ForumReply.find({
            topicId: id,
            isDeleted: { $ne: true }
        })
            .populate('authorId', 'fullName nickname avatar department')
            .sort({ isBestAnswer: -1, createdAt: 1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalReplies = await ForumReply.countDocuments({
            topicId: id,
            isDeleted: { $ne: true }
        });

        // Check if current user voted
        const memberId = await getMemberId();
        let userVote = null;
        if (memberId) {
            const vote = await ForumVote.findOne({
                memberId,
                contentType: 'topic',
                contentId: id,
            });
            userVote = vote?.value || null;
        }

        return NextResponse.json({
            topic: { ...topic.toObject(), userVote },
            replies,
            pagination: {
                page,
                limit,
                total: totalReplies,
                totalPages: Math.ceil(totalReplies / limit),
            },
        });
    } catch (error) {
        console.error('Forum topic fetch error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// PUT - Update topic (author or admin)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();
        const { id } = await params;

        const memberId = await getMemberId();
        const admin = await isAdmin(request);

        if (!memberId && !admin) {
            return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
        }

        const topic = await ForumTopic.findById(id);
        if (!topic || topic.isDeleted) {
            return NextResponse.json({ error: 'Konu bulunamadı' }, { status: 404 });
        }

        // Check permission
        if (!admin && topic.authorId.toString() !== memberId) {
            return NextResponse.json({ error: 'Bu konuyu düzenleme yetkiniz yok' }, { status: 403 });
        }

        if (topic.isLocked && !admin) {
            return NextResponse.json({ error: 'Bu konu kilitli' }, { status: 403 });
        }

        const body = await request.json();
        const { title, content, tags, isPinned, isLocked } = body;

        const updateData: Record<string, unknown> = {};
        if (title) updateData.title = title.trim();
        if (content) updateData.content = content.trim();
        if (tags) updateData.tags = tags.map((t: string) => t.toLowerCase().trim());
        
        // Admin-only fields
        if (admin) {
            if (typeof isPinned === 'boolean') updateData.isPinned = isPinned;
            if (typeof isLocked === 'boolean') updateData.isLocked = isLocked;
        }

        const updatedTopic = await ForumTopic.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('categoryId', 'name nameEn slug icon color')
         .populate('authorId', 'fullName nickname avatar');

        return NextResponse.json(updatedTopic);
    } catch (error) {
        console.error('Forum topic update error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// DELETE - Delete topic (author or admin)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();
        const { id } = await params;

        const memberId = await getMemberId();
        const admin = await isAdmin(request);

        if (!memberId && !admin) {
            return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
        }

        const topic = await ForumTopic.findById(id);
        if (!topic) {
            return NextResponse.json({ error: 'Konu bulunamadı' }, { status: 404 });
        }

        // Check permission
        if (!admin && topic.authorId.toString() !== memberId) {
            return NextResponse.json({ error: 'Bu konuyu silme yetkiniz yok' }, { status: 403 });
        }

        // Soft delete
        await ForumTopic.findByIdAndUpdate(id, { isDeleted: true });

        // Decrement category topic count
        await ForumCategory.findByIdAndUpdate(topic.categoryId, {
            $inc: { topicCount: -1 },
        });

        return NextResponse.json({ message: 'Konu silindi' });
    } catch (error) {
        console.error('Forum topic delete error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
