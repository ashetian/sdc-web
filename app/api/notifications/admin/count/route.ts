import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Notification from '@/app/lib/models/Notification';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

import { JWT_SECRET } from '@/app/lib/auth';

// GET: Get admin notification counts by type
export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const memberId = payload.memberId as string;

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        await connectDB();

        if (type) {
            // Get count for specific type
            const count = await Notification.countDocuments({
                recipientId: memberId,
                isRead: false,
                isAdminNotification: true,
                type: type,
            });
            return NextResponse.json({ count });
        }

        // Get counts for all admin notification types
        const types = [
            'admin_new_comment',
            'admin_new_project',
            'admin_new_forum_topic',
            'admin_new_registration',
            'admin_new_applicant',
            'admin_spam_alert',
            'admin_milestone',
        ];

        const counts: Record<string, number> = {};

        await Promise.all(
            types.map(async (t) => {
                counts[t] = await Notification.countDocuments({
                    recipientId: memberId,
                    isRead: false,
                    isAdminNotification: true,
                    type: t,
                });
            })
        );

        return NextResponse.json({ counts });
    } catch (error) {
        console.error('Error fetching admin notification counts:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
