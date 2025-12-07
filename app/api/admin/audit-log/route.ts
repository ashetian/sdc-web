import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import AuditLog from '@/app/lib/models/AuditLog';
import AdminAccess from '@/app/lib/models/AdminAccess';
import TeamMember from '@/app/lib/models/TeamMember';
import { verifyAuth } from '@/app/lib/auth';

// Shared verifyAdmin helper
async function verifyAdmin() {
    const auth = await verifyAuth();
    if (!auth?.userId) return null;

    await connectDB();

    // Check TeamMember role (President/VP)
    const teamMember = await TeamMember.findOne({ memberId: auth.userId, isActive: true });
    if (teamMember && ['president', 'vice_president'].includes(teamMember.role)) {
        return { memberId: auth.userId };
    }

    // Check AdminAccess
    const access = await AdminAccess.findOne({ memberId: auth.userId });
    return access ? { memberId: auth.userId } : null;
}

export async function GET(request: NextRequest) {
    try {
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            AuditLog.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            AuditLog.countDocuments(),
        ]);

        return NextResponse.json({
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Audit log fetch error:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
