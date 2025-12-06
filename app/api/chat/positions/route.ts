import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import ChatPosition from '@/app/lib/models/ChatPosition';
import { verifyAuth } from '@/app/lib/auth';

// Random color generator for new users
function generateRandomColor(): string {
    const colors = [
        '#EF4444', '#F97316', '#F59E0B', '#EAB308',
        '#84CC16', '#22C55E', '#10B981', '#14B8A6',
        '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
        '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// GET: Fetch all active positions
export async function GET() {
    try {
        await connectDB();

        // Get positions from last 2 minutes (active users)
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

        const positions = await ChatPosition.find({
            lastSeen: { $gte: twoMinutesAgo }
        }).lean();

        return NextResponse.json(positions);
    } catch (error) {
        console.error('Chat positions fetch error:', error);
        return NextResponse.json({ error: 'Pozisyonlar alınamadı' }, { status: 500 });
    }
}

// PUT: Update own position
export async function PUT(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
        }

        const body = await request.json();
        const { x, y } = body;

        // Validate position bounds (canvas size: 800x600)
        const clampedX = Math.max(16, Math.min(784, Number(x) || 400));
        const clampedY = Math.max(16, Math.min(584, Number(y) || 300));

        await connectDB();

        const memberId = user.userId;

        // Upsert position
        const position = await ChatPosition.findOneAndUpdate(
            { memberId },
            {
                memberId,
                memberName: user.nickname || 'Anonim',
                nickname: user.nickname,
                color: undefined, // Will be set only on insert
                x: clampedX,
                y: clampedY,
                lastSeen: new Date(),
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            }
        );

        // If new user, assign random color
        if (!position.color) {
            position.color = generateRandomColor();
            await position.save();
        }

        return NextResponse.json(position);
    } catch (error) {
        console.error('Chat position update error:', error);
        return NextResponse.json({ error: 'Pozisyon güncellenemedi' }, { status: 500 });
    }
}
