import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Setting } from '@/app/lib/models/Setting';
import { verifyAuth } from '@/app/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';
import TeamMember from '@/app/lib/models/TeamMember';
import AdminAccess from '@/app/lib/models/AdminAccess';

// Shared verifyAdmin helper (same as calendar routes)
async function verifyAdmin() {
    const auth = await verifyAuth();
    if (!auth?.userId) return null;

    await connectDB();

    // Check TeamMember role first (president/VP are auto-admins)
    const teamMember = await TeamMember.findOne({ memberId: auth.userId, isActive: true });
    if (teamMember && ['president', 'vice_president'].includes(teamMember.role)) {
        return { userId: auth.userId, nickname: auth.nickname };
    }

    // Then check AdminAccess table
    const access = await AdminAccess.findOne({ memberId: auth.userId });
    return access ? { userId: auth.userId, nickname: auth.nickname } : null;
}

export async function GET() {
    try {
        await connectDB();
        const settings = await Setting.find({});
        // Convert array to object for easier consumption { key: value }
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(settingsMap);
    } catch (error) {
        console.error('Ayarlar getirilirken hata:', error);
        return NextResponse.json({ error: 'Ayarlar yüklenemedi.' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Auth check - STRICT ADMIN ONLY
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli (Admin)' }, { status: 401 });
        }

        const body = await request.json();
        const { key, value } = body;

        if (!key || value === undefined) {
            return NextResponse.json({ error: 'Key ve value zorunludur.' }, { status: 400 });
        }

        const setting = await Setting.findOneAndUpdate(
            { key },
            { value },
            { upsert: true, new: true }
        );

        // Audit log
        await logAdminAction({
            adminId: admin.userId,
            adminName: admin.nickname || admin.userId,
            action: AUDIT_ACTIONS.UPDATE_SETTINGS,
            targetType: 'Setting',
            targetId: key,
            targetName: key,
            details: `Değer: ${value}`,
        });

        return NextResponse.json(setting);
    } catch (error) {
        console.error('Ayar güncellenirken hata:', error);
        return NextResponse.json({ error: 'Ayar güncellenemedi.' }, { status: 500 });
    }
}

