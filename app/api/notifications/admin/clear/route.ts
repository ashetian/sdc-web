import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Notification from '@/app/lib/models/Notification';
import { verifyAuth } from '@/app/lib/auth';
import TeamMember from '@/app/lib/models/TeamMember';
import AdminAccess from '@/app/lib/models/AdminAccess';

async function verifyAdmin(req: NextRequest) {
    const auth = await verifyAuth(req);
    if (!auth?.userId) return null;

    await connectDB();

    // Check TeamMember role first (president/VP are auto-admins)
    const teamMember = await TeamMember.findOne({ memberId: auth.userId, isActive: true });
    if (teamMember && ['president', 'vice_president'].includes(teamMember.role)) {
        return auth;
    }

    // Then check AdminAccess table
    const access = await AdminAccess.findOne({ memberId: auth.userId });
    return access ? auth : null;
}

export async function POST(request: NextRequest) {
    try {
        const admin = await verifyAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { type } = await request.json();

        if (!type) {
            return NextResponse.json({ error: 'Notification type required' }, { status: 400 });
        }

        await connectDB();

        // Clear all unread admin notifications of this type
        // Note: Admin notifications don't usually have a single recipientId (they are broadcast), but the implementation 
        // likely stores them with a recipientId if it's targeted, or maybe query by isAdminNotification=true.
        // Let's check how they are created. Notification.ts model usually has recipientId.
        // If "admin_new_comment" is created for multiple admins, each has a record.
        // So we should only clear for THIS admin.

        await Notification.updateMany(
            {
                recipientId: admin.userId, // Only clear for the current admin
                type: type,
                isAdminNotification: true,
                isRead: false
            },
            { isRead: true }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error clearing admin notifications:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
