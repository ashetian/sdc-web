import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Setting } from '@/app/lib/models/Setting';
import { verifyAuth } from '@/app/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

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

        // Auth check
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
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
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
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

