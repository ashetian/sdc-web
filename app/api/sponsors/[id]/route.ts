import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Sponsor from '@/app/lib/models/Sponsor';
import { verifyAuth } from '@/app/lib/auth';
import AdminAccess from '@/app/lib/models/AdminAccess';
import { deleteFromCloudinary } from '@/app/lib/cloudinaryHelper';

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

        const updatedSponsor = await Sponsor.findByIdAndUpdate(
            id,
            { name, nameEn, description, descriptionEn, logo, order, isActive },
            { new: true }
        );

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

        // Delete logo from Cloudinary
        if (sponsor.logo) {
            await deleteFromCloudinary(sponsor.logo);
        }

        await Sponsor.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Sponsor silindi' });
    } catch (error) {
        console.error('Sponsor delete error:', error);
        return NextResponse.json({ error: 'Sponsor silinemedi' }, { status: 500 });
    }
}
