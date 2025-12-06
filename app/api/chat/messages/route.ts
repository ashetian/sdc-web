import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import ChatMessage from '@/app/lib/models/ChatMessage';
import ChatPosition from '@/app/lib/models/ChatPosition';
import { verifyAuth } from '@/app/lib/auth';

// Rate limit tracking (in-memory for simplicity)
const lastMessageTime: Map<string, number> = new Map();
const SPAM_COOLDOWN_MS = 3000; // 3 seconds

// GET: Fetch recent messages
export async function GET() {
    try {
        await connectDB();

        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

        const messages = await ChatMessage.find({
            createdAt: { $gte: tenMinutesAgo }
        })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Chat messages fetch error:', error);
        return NextResponse.json({ error: 'Mesajlar alınamadı' }, { status: 500 });
    }
}

// POST: Send a new message
export async function POST(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
        }

        const memberId = user.userId;

        // Spam protection
        const lastTime = lastMessageTime.get(memberId);
        const now = Date.now();
        if (lastTime && (now - lastTime) < SPAM_COOLDOWN_MS) {
            const remainingMs = SPAM_COOLDOWN_MS - (now - lastTime);
            return NextResponse.json({
                error: `Çok hızlı! ${Math.ceil(remainingMs / 1000)} saniye bekleyin.`
            }, { status: 429 });
        }

        const body = await request.json();
        const { message } = body;

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Mesaj gerekli' }, { status: 400 });
        }

        const trimmedMessage = message.trim().substring(0, 120);
        if (trimmedMessage.length === 0) {
            return NextResponse.json({ error: 'Boş mesaj gönderilemez' }, { status: 400 });
        }

        await connectDB();

        // Get user's current position
        const position = await ChatPosition.findOne({ memberId }).lean();
        const userPosition = position ? { x: position.x, y: position.y } : { x: 400, y: 300 };

        // Create message
        const chatMessage = await ChatMessage.create({
            memberId,
            memberName: user.nickname || 'Anonim',
            memberColor: (position as any)?.color || '#3B82F6',
            message: trimmedMessage,
            position: userPosition,
        });

        // Update rate limit
        lastMessageTime.set(memberId, now);

        return NextResponse.json(chatMessage, { status: 201 });
    } catch (error) {
        console.error('Chat message send error:', error);
        return NextResponse.json({ error: 'Mesaj gönderilemedi' }, { status: 500 });
    }
}
