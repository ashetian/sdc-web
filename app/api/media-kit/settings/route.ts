import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import MediaKitSettings from '@/app/lib/models/MediaKitSettings';
import { verifyAuth } from '@/app/lib/auth';
import AdminAccess from '@/app/lib/models/AdminAccess';
import { Announcement } from '@/app/lib/models/Announcement';

// GET - Get global media kit settings
export async function GET(request: NextRequest) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        await connectDB();

        // Get or create settings (singleton pattern)
        let settings = await MediaKitSettings.findOne();
        if (!settings) {
            settings = await MediaKitSettings.create({ pages: [] });
        }

        // Fetch ALL announcements that have a gallery (galleryLinks array with items)
        // Including drafts and archived so admin can see everything
        const galleryEvents = await Announcement.find({
            galleryLinks: { $exists: true, $not: { $size: 0 } }
        }).select('_id title titleEn galleryCover galleryLinks isDraft').lean();

        return NextResponse.json({
            settings,
            galleryEvents
        });
    } catch (error) {
        console.error('Media kit settings fetch error:', error);
        return NextResponse.json({ error: 'Ayarlar getirilemedi' }, { status: 500 });
    }
}

// PUT - Update global media kit settings
export async function PUT(request: NextRequest) {
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
        const { pageTitle, pageTitleEn, pages } = body;

        // Upsert settings (create if not exists)
        const settings = await MediaKitSettings.findOneAndUpdate(
            {},
            {
                pageTitle,
                pageTitleEn,
                pages,
                updatedBy: user.userId
            },
            { new: true, upsert: true }
        );

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Media kit settings update error:', error);
        return NextResponse.json({ error: 'Ayarlar güncellenemedi' }, { status: 500 });
    }
}
