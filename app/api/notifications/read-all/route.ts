import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Notification from '@/app/lib/models/Notification';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');

// PATCH: Mark all notifications as read
export async function PATCH() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const memberId = payload.memberId as string;

        await connectDB();

        await Notification.updateMany(
            { recipientId: memberId, isRead: false, isAdminNotification: false },
            { isRead: true }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
