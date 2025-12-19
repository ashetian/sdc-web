import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import MediaKitToken from '@/app/lib/models/MediaKitToken';
import { verifyAuth } from '@/app/lib/auth';
import AdminAccess from '@/app/lib/models/AdminAccess';
import crypto from 'crypto';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

// GET - List all media kit tokens (admin only)
export async function GET(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        await connectDB();

        const adminAccess = await AdminAccess.findOne({ memberId: user.userId });
        if (!adminAccess) {
            return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
        }

        const tokens = await MediaKitToken.find()
            .sort({ createdAt: -1 })
            .populate('createdBy', 'fullName nickname');

        return NextResponse.json(tokens);
    } catch (error) {
        console.error('Media kit tokens fetch error:', error);
        return NextResponse.json({ error: 'Tokenlar getirilemedi' }, { status: 500 });
    }
}

// POST - Create new media kit token (admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        await connectDB();

        const adminAccess = await AdminAccess.findOne({ memberId: user.userId });
        if (!adminAccess) {
            return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
        }

        const body = await request.json();
        const { sponsorName, email, note, expiresInDays = 30, defaultLanguage = 'tr' } = body;

        if (!sponsorName) {
            return NextResponse.json({ error: 'Sponsor adı zorunlu' }, { status: 400 });
        }

        // Generate unique token
        const token = crypto.randomBytes(24).toString('hex');

        // Calculate expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);

        const mediaKitToken = await MediaKitToken.create({
            token,
            sponsorName,
            email,
            note,
            expiresAt,
            defaultLanguage,
            createdBy: user.userId,
        });

        // Audit log
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: AUDIT_ACTIONS.CREATE_MEDIA_KIT_TOKEN || 'CREATE_MEDIA_KIT_TOKEN',
            targetType: 'MediaKitToken',
            targetId: mediaKitToken._id.toString(),
            targetName: sponsorName,
        });

        return NextResponse.json(mediaKitToken, { status: 201 });
    } catch (error) {
        console.error('Media kit token create error:', error);
        return NextResponse.json({ error: 'Token oluşturulamadı' }, { status: 500 });
    }
}
