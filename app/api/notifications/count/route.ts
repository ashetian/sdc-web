import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Notification from '@/app/lib/models/Notification';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');

// GET: Get unread notification count
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const memberId = payload.memberId as string;

        await connectDB();

        const [memberCount, adminCount] = await Promise.all([
            Notification.countDocuments({
                recipientId: memberId,
                isRead: false,
                isAdminNotification: false,
            }),
            Notification.countDocuments({
                recipientId: memberId,
                isRead: false,
                isAdminNotification: true,
            }),
        ]);

        return NextResponse.json({
            member: memberCount,
            admin: adminCount,
            total: memberCount + adminCount,
        });
    } catch (error) {
        console.error('Error fetching notification count:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
