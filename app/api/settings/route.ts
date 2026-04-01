import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Setting } from '@/app/lib/models/Setting';
import { verifyAuth, verifyAdmin } from '@/app/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';


export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const settings = await Setting.find({});

        // Check if requester is admin
        const admin = await verifyAdmin(request);
        const isAdmin = !!admin;

        // Convert array to object for easier consumption { key: value }
        const SENSITIVE_KEYS = ['gmailUser', 'gmailAppPassword', 'smtpUser', 'smtpPassword', 'emailPassword'];
        const settingsMap = settings.reduce((acc: Record<string, string>, curr: any) => {
            // If admin, include sensitive keys, otherwise filter them
            if (isAdmin || !SENSITIVE_KEYS.includes(curr.key)) {
                acc[curr.key] = curr.value;
            }
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
        const admin = await verifyAdmin(request);
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

