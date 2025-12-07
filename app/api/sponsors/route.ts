import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Sponsor from '@/app/lib/models/Sponsor';
import { verifyAuth } from '@/app/lib/auth';
import AdminAccess from '@/app/lib/models/AdminAccess';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

// GET: Fetch all sponsors
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const activeOnly = request.nextUrl.searchParams.get('active') === 'true';

        const query = activeOnly ? { isActive: true } : {};
        const sponsors = await Sponsor.find(query).sort({ order: 1 }).lean();

        return NextResponse.json(sponsors);
    } catch (error) {
        console.error('Sponsors fetch error:', error);
        return NextResponse.json({ error: 'Sponsorlar alınamadı' }, { status: 500 });
    }
}

// POST: Create a new sponsor (admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        await connectDB();

        // Check admin access
        const adminAccess = await AdminAccess.findOne({ memberId: user.userId });
        if (!adminAccess) {
            return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
        }

        const body = await request.json();
        const { name, nameEn, description, descriptionEn, logo, order, isActive } = body;

        if (!name || !description || !logo) {
            return NextResponse.json({ error: 'İsim, açıklama ve logo gerekli' }, { status: 400 });
        }

        const sponsor = await Sponsor.create({
            name,
            nameEn,
            description,
            descriptionEn,
            logo,
            order: order || 0,
            isActive: isActive !== false,
        });

        // Audit log
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: AUDIT_ACTIONS.CREATE_SPONSOR,
            targetType: 'Sponsor',
            targetId: sponsor._id.toString(),
            targetName: sponsor.name,
        });

        return NextResponse.json(sponsor, { status: 201 });
    } catch (error) {
        console.error('Sponsor create error:', error);
        return NextResponse.json({ error: 'Sponsor oluşturulamadı' }, { status: 500 });
    }
}

