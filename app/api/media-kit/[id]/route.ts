import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import MediaKitToken from '@/app/lib/models/MediaKitToken';
import { verifyAuth } from '@/app/lib/auth';
import AdminAccess from '@/app/lib/models/AdminAccess';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

// GET - Get token details (admin only)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;

        const token = await MediaKitToken.findById(id)
            .populate('createdBy', 'fullName nickname');

        if (!token) {
            return NextResponse.json({ error: 'Token bulunamadı' }, { status: 404 });
        }

        return NextResponse.json(token);
    } catch (error) {
        console.error('Media kit token fetch error:', error);
        return NextResponse.json({ error: 'Token getirilemedi' }, { status: 500 });
    }
}

// PUT - Update token (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;

        const adminAccess = await AdminAccess.findOne({ memberId: user.userId });
        if (!adminAccess) {
            return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
        }

        const body = await request.json();
        const { sponsorName, email, note, isActive, pageTitle, pageTitleEn, pages } = body;

        const token = await MediaKitToken.findByIdAndUpdate(
            id,
            { sponsorName, email, note, isActive, pageTitle, pageTitleEn, pages },
            { new: true }
        );

        if (!token) {
            return NextResponse.json({ error: 'Token bulunamadı' }, { status: 404 });
        }

        return NextResponse.json(token);
    } catch (error) {
        console.error('Media kit token update error:', error);
        return NextResponse.json({ error: 'Token güncellenemedi' }, { status: 500 });
    }
}

// DELETE - Delete token (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        await connectDB();
        const { id } = await params;

        const adminAccess = await AdminAccess.findOne({ memberId: user.userId });
        if (!adminAccess) {
            return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
        }

        const token = await MediaKitToken.findByIdAndDelete(id);

        if (!token) {
            return NextResponse.json({ error: 'Token bulunamadı' }, { status: 404 });
        }

        // Audit log
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: AUDIT_ACTIONS.DELETE_MEDIA_KIT_TOKEN || 'DELETE_MEDIA_KIT_TOKEN',
            targetType: 'MediaKitToken',
            targetId: id,
            targetName: token.sponsorName,
        });

        return NextResponse.json({ message: 'Token silindi' });
    } catch (error) {
        console.error('Media kit token delete error:', error);
        return NextResponse.json({ error: 'Token silinemedi' }, { status: 500 });
    }
}
