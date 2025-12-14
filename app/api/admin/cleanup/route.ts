import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { verifyAuth } from '@/app/lib/auth';
import Notification from '@/app/lib/models/Notification';
import Comment from '@/app/lib/models/Comment';
import AuditLog from '@/app/lib/models/AuditLog';
import { logAdminAction } from '@/app/lib/utils/logAdminAction';

// POST - Run database cleanup (admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        await connectDB();

        const results = {
            readNotifications: 0,
            softDeletedComments: 0,
            oldAuditLogs: 0,
        };

        // 1. Delete read notifications older than 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const readNotifResult = await Notification.deleteMany({
            isRead: true,
            createdAt: { $lt: sevenDaysAgo }
        });
        results.readNotifications = readNotifResult.deletedCount;

        // 2. Delete soft-deleted comments older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const commentResult = await Comment.deleteMany({
            isDeleted: true,
            deletedAt: { $lt: thirtyDaysAgo }
        });
        results.softDeletedComments = commentResult.deletedCount;

        // 3. Delete audit logs older than 30 days (manual cleanup, TTL also handles this)
        const thirtyDaysAgoForLogs = new Date();
        thirtyDaysAgoForLogs.setDate(thirtyDaysAgoForLogs.getDate() - 30);

        const auditResult = await AuditLog.deleteMany({
            createdAt: { $lt: thirtyDaysAgoForLogs }
        });
        results.oldAuditLogs = auditResult.deletedCount;

        // Log the cleanup action
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: 'SYSTEM_CLEANUP',
            targetType: 'System',
            targetName: 'Database Cleanup',
            details: `Silinen: ${results.readNotifications} bildirim, ${results.softDeletedComments} yorum, ${results.oldAuditLogs} log`,
        });

        return NextResponse.json({
            message: 'Veritabanı temizliği tamamlandı',
            results,
            totalDeleted: results.readNotifications + results.softDeletedComments + results.oldAuditLogs
        });
    } catch (error) {
        console.error('Cleanup error:', error);
        return NextResponse.json({ error: 'Temizlik sırasında hata oluştu' }, { status: 500 });
    }
}

// GET - Get cleanup statistics (admin only)
export async function GET(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        await connectDB();

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const stats = {
            readNotificationsOlderThan7Days: await Notification.countDocuments({
                isRead: true,
                createdAt: { $lt: sevenDaysAgo }
            }),
            softDeletedCommentsOlderThan30Days: await Comment.countDocuments({
                isDeleted: true,
                deletedAt: { $lt: thirtyDaysAgo }
            }),
            auditLogsOlderThan30Days: await AuditLog.countDocuments({
                createdAt: { $lt: thirtyDaysAgo }
            }),
            totalNotifications: await Notification.countDocuments(),
            totalComments: await Comment.countDocuments(),
            totalAuditLogs: await AuditLog.countDocuments(),
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Cleanup stats error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
