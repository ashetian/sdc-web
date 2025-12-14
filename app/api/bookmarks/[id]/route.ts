import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import connectDB from '@/app/lib/db';
import Bookmark from '@/app/lib/models/Bookmark';

import { JWT_SECRET } from '@/app/lib/auth';

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

// DELETE - Remove bookmark by ID
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { id } = await params;

        // Find and delete bookmark (only if belongs to user)
        const bookmark = await Bookmark.findOneAndDelete({
            _id: id,
            memberId: user.id,
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
