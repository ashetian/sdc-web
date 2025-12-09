import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Sponsor from '@/app/lib/models/Sponsor';
import { verifyAuth } from '@/app/lib/auth';
import AdminAccess from '@/app/lib/models/AdminAccess';
import { deleteFromCloudinary } from '@/app/lib/cloudinaryHelper';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET: Fetch single sponsor
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        await connectDB();

        const sponsor = await Sponsor.findById(id).lean();
        if (!sponsor) {
            return NextResponse.json({ error: 'Sponsor bulunamadı' }, { status: 404 });
        }

        return NextResponse.json(sponsor);
    } catch (error) {
        console.error('Sponsor fetch error:', error);
        return NextResponse.json({ error: 'Sponsor alınamadı' }, { status: 500 });
    }
}

// PUT: Update sponsor (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const { id } = await params;
        await connectDB();

        const adminAccess = await AdminAccess.findOne({ memberId: user.userId });
        if (!adminAccess) {
            return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
        }

        const body = await request.json();
        const { name, nameEn, description, descriptionEn, logo, order, isActive } = body;

        const existingSponsor = await Sponsor.findById(id);
        if (!existingSponsor) {
            return NextResponse.json({ error: 'Sponsor bulunamadı' }, { status: 404 });
        }

        // If logo changed, delete old one from Cloudinary
        if (logo && existingSponsor.logo && logo !== existingSponsor.logo) {
            await deleteFromCloudinary(existingSponsor.logo);
        }

        // Prepare update data
        let updateData = { name, nameEn, description, descriptionEn, logo, order, isActive };

        // Auto-translate if DeepL API key is available and English fields are not provided
        if (process.env.DEEPL_API_KEY && (!nameEn || !descriptionEn)) {
            try {
                const { translateContent } = await import('@/app/lib/translate');

                if (!nameEn && name) {
                    const nameResult = await translateContent(name, 'tr');
                    updateData.nameEn = nameResult.en || '';
                }

                if (!descriptionEn && description) {
                    const descResult = await translateContent(description, 'tr');
                    updateData.descriptionEn = descResult.en || '';
                }

                console.log('Sponsor update auto-translation successful');
            } catch (translateError) {
                console.error('Sponsor update translation failed:', translateError);
            }
        }

        const updatedSponsor = await Sponsor.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        // Audit log
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: AUDIT_ACTIONS.UPDATE_SPONSOR,
            targetType: 'Sponsor',
            targetId: id,
            targetName: updatedSponsor?.name || name,
        });

        return NextResponse.json(updatedSponsor);
    } catch (error) {
        console.error('Sponsor update error:', error);
        return NextResponse.json({ error: 'Sponsor güncellenemedi' }, { status: 500 });
    }
}

// DELETE: Delete sponsor (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const { id } = await params;
        await connectDB();

        const adminAccess = await AdminAccess.findOne({ memberId: user.userId });
        if (!adminAccess) {
            return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
        }

        const sponsor = await Sponsor.findById(id);
        if (!sponsor) {
            return NextResponse.json({ error: 'Sponsor bulunamadı' }, { status: 404 });
        }

        const sponsorName = sponsor.name;

        // Delete logo from Cloudinary
        if (sponsor.logo) {
            await deleteFromCloudinary(sponsor.logo);
        }

        await Sponsor.findByIdAndDelete(id);

        // Audit log
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: AUDIT_ACTIONS.DELETE_SPONSOR,
            targetType: 'Sponsor',
            targetId: id,
            targetName: sponsorName,
        });

        return NextResponse.json({ message: 'Sponsor silindi' });
    } catch (error) {
        console.error('Sponsor delete error:', error);
        return NextResponse.json({ error: 'Sponsor silinemedi' }, { status: 500 });
    }
}
