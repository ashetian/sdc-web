import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/app/lib/auth';
import connectDB from '@/app/lib/db';
import BugReport from '@/app/lib/models/BugReport';
import TeamMember from '@/app/lib/models/TeamMember';
import AdminAccess from '@/app/lib/models/AdminAccess';

// Check admin access
async function checkAdminAccess(payload: { userId: string }) {
    // Check for AdminAccess rule
    const accessRule = await AdminAccess.findOne({ memberId: payload.userId });
    
    // Check TeamMember for president/VP
    const teamMember = await TeamMember.findOne({ memberId: payload.userId, isActive: true });
    
    // Case 1: Is President/VP (Automatic Superadmin)
    if (teamMember && ['president', 'vice_president'].includes(teamMember.role)) {
        return { isSuperAdmin: true };
    }
    
    // Case 2: Has Explicit AdminAccess
    if (accessRule) {
        return { isSuperAdmin: accessRule.allowedKeys.includes('ALL') };
    }
    
    return null;
}

// GET - List all bug reports (admin only)
export async function GET(request: NextRequest) {
    try {
        await connectDB();
        
        const payload = await verifyAuth(request);
        if (!payload || !payload.userId) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const admin = await checkAdminAccess(payload);
        if (!admin) {
            return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Build query
        const query: Record<string, unknown> = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const [reports, total] = await Promise.all([
            BugReport.find(query)
                .populate('reporterId', 'nickname studentNo email avatar')
                .populate('reviewedById', 'nickname')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            BugReport.countDocuments(query),
        ]);

        // Count by status
        const [pendingCount, reviewedCount, resolvedCount, dismissedCount] = await Promise.all([
            BugReport.countDocuments({ status: 'pending' }),
            BugReport.countDocuments({ status: 'reviewed' }),
            BugReport.countDocuments({ status: 'resolved' }),
            BugReport.countDocuments({ status: 'dismissed' }),
        ]);

        return NextResponse.json({
            reports,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            counts: {
                pending: pendingCount,
                reviewed: reviewedCount,
                resolved: resolvedCount,
                dismissed: dismissedCount,
            },
        });
    } catch (error) {
        console.error('Bug reports fetch error:', error);
        return NextResponse.json({ error: 'Bildirimler alınamadı' }, { status: 500 });
    }
}
