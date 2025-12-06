import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Like from '@/app/lib/models/Like';
import { verifyAuth } from '@/app/lib/auth';

// GET: Get like count and user's like status
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const contentType = searchParams.get('contentType');
        const contentId = searchParams.get('contentId');

        if (!contentType || !contentId) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Get total like count
        const count = await Like.countDocuments({ contentType, contentId });

        // Check if current user has liked
        let hasLiked = false;
        const auth = await verifyAuth(request);
        if (auth) {
            const existingLike = await Like.findOne({
                userId: auth.userId,
                contentType,
                contentId,
            });
            hasLiked = !!existingLike;
        }

        return NextResponse.json({ count, hasLiked });
    } catch (error) {
        console.error('Like GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST: Toggle like (add if not exists, remove if exists)
export async function POST(request: NextRequest) {
    try {
        const auth = await verifyAuth(request);
        if (!auth) {
            return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 });
        }

        await connectDB();

        const { contentType, contentId } = await request.json();

        if (!contentType || !contentId) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Check if like exists
        const existingLike = await Like.findOne({
            userId: auth.userId,
            contentType,
            contentId,
        });

        let action: 'liked' | 'unliked';

        if (existingLike) {
            // Unlike - remove the like
            await Like.deleteOne({ _id: existingLike._id });
            action = 'unliked';
        } else {
            // Like - add new like
            await Like.create({
                userId: auth.userId,
                contentType,
                contentId,
            });
            action = 'liked';
        }

        // Get updated count
        const count = await Like.countDocuments({ contentType, contentId });

        return NextResponse.json({
            action,
            count,
            hasLiked: action === 'liked'
        });
    } catch (error) {
        console.error('Like POST error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
