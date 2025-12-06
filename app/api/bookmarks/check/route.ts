import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import connectDB from '@/app/lib/db';
import Bookmark from '@/app/lib/models/Bookmark';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');

async function getAuthUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return { id: payload.memberId as string };
    } catch {
        return null;
    }
}

// GET - Check if content is bookmarked by current user
export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            // Return not bookmarked for unauthenticated users
            return NextResponse.json({ isBookmarked: false, bookmarkId: null });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const contentType = searchParams.get('contentType');
        const contentId = searchParams.get('contentId');

        if (!contentType || !contentId) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const bookmark = await Bookmark.findOne({
            memberId: user.id,
            contentType,
            contentId,
        });

        return NextResponse.json({
            isBookmarked: !!bookmark,
            bookmarkId: bookmark?._id || null,
        });
    } catch (error) {
        console.error('Check bookmark error:', error);
        return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
    }
}

// DELETE - Remove bookmark by contentType and contentId (for toggle functionality)
export async function DELETE(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const contentType = searchParams.get('contentType');
        const contentId = searchParams.get('contentId');

        if (!contentType || !contentId) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const bookmark = await Bookmark.findOneAndDelete({
            memberId: user.id,
            contentType,
            contentId,
        });

        if (!bookmark) {
            return NextResponse.json({ error: 'Bookmark bulunamadı' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete bookmark error:', error);
        return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
    }
}
