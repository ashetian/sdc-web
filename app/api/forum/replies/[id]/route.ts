import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import ForumReply from '@/app/lib/models/ForumReply';
import ForumTopic from '@/app/lib/models/ForumTopic';
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

// PUT - Edit reply
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();
        const { id } = await params;

        const memberId = await getMemberId();
        const admin = await isAdmin(request);

        if (!memberId && !admin) {
            return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
        }

        const reply = await ForumReply.findById(id);
        if (!reply || reply.isDeleted) {
            return NextResponse.json({ error: 'Yanıt bulunamadı' }, { status: 404 });
        }

        // Check permission
        if (!admin && reply.authorId.toString() !== memberId) {
            return NextResponse.json({ error: 'Bu yanıtı düzenleme yetkiniz yok' }, { status: 403 });
        }

        const body = await request.json();
        const { content, isBestAnswer } = body;

        const updateData: Record<string, unknown> = { isEdited: true };
        
        if (content) {
            if (content.length > 5000) {
                return NextResponse.json({ error: 'Yanıt en fazla 5000 karakter olabilir' }, { status: 400 });
            }
            updateData.content = content.trim();
        }

        // Only topic author or admin can mark best answer
        if (typeof isBestAnswer === 'boolean') {
            const topic = await ForumTopic.findById(reply.topicId);
            if (topic && (admin || topic.authorId.toString() === memberId)) {
                // Remove best answer from other replies first
                if (isBestAnswer) {
                    await ForumReply.updateMany(
                        { topicId: reply.topicId, isBestAnswer: true },
                        { isBestAnswer: false }
                    );
                }
                updateData.isBestAnswer = isBestAnswer;
            }
        }

        const updatedReply = await ForumReply.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('authorId', 'fullName nickname avatar department');

        return NextResponse.json(updatedReply);
    } catch (error) {
        console.error('Forum reply update error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// DELETE - Delete reply
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();
        const { id } = await params;

        const memberId = await getMemberId();
        const admin = await isAdmin(request);

        if (!memberId && !admin) {
            return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
        }

        const reply = await ForumReply.findById(id);
        if (!reply) {
            return NextResponse.json({ error: 'Yanıt bulunamadı' }, { status: 404 });
        }

        // Check permission
        if (!admin && reply.authorId.toString() !== memberId) {
            return NextResponse.json({ error: 'Bu yanıtı silme yetkiniz yok' }, { status: 403 });
        }

        // Soft delete
        await ForumReply.findByIdAndUpdate(id, { isDeleted: true });

        // Decrement topic reply count
        await ForumTopic.findByIdAndUpdate(reply.topicId, {
            $inc: { replyCount: -1 },
        });

        return NextResponse.json({ message: 'Yanıt silindi' });
    } catch (error) {
        console.error('Forum reply delete error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
