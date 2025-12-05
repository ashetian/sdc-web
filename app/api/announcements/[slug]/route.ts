import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Announcement } from '@/app/lib/models/Announcement';
import z from 'zod';

//validasyon şeması
const schema = z.object({
  title: z.string().min(1).max(100),
  date: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  type: z.string().min(1).max(100),
  content: z.string().min(1).max(10000),
  eventId: z.string().optional(),
  imageOrientation: z.enum(['horizontal', 'vertical']).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;
    const announcement = await Announcement.findOne({ slug });

    if (!announcement) {
      return NextResponse.json(
        { error: 'Duyuru bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Duyuru alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Duyuru alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;
    const data = await request.json();

    // Gerekli alanların kontrolü ama zodla
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 }
      );
    }

    // Tür kontrolü
    if (!['event', 'news', 'workshop'].includes(parsed.data.type)) {
      return NextResponse.json(
        { error: 'Geçersiz duyuru türü' },
        { status: 400 }
      );
    }

    // Find existing announcement to compare images
    const existingAnnouncement = await Announcement.findOne({ slug });
    if (!existingAnnouncement) {
      return NextResponse.json({ error: 'Duyuru bulunamadı' }, { status: 404 });
    }

    // Check for removed images and delete them from Cloudinary

    // 1. Main Image
    if (existingAnnouncement.image && data.image && existingAnnouncement.image !== data.image) {
      await deleteFromCloudinary(existingAnnouncement.image);
    } else if (existingAnnouncement.image && !data.image) {
      // If image is removed (set to null/empty)
      await deleteFromCloudinary(existingAnnouncement.image);
    }

    // 2. Gallery Cover
    if (existingAnnouncement.galleryCover && data.galleryCover && existingAnnouncement.galleryCover !== data.galleryCover) {
      await deleteFromCloudinary(existingAnnouncement.galleryCover);
    } else if (existingAnnouncement.galleryCover && !data.galleryCover) {
      await deleteFromCloudinary(existingAnnouncement.galleryCover);
    }

    // 3. Gallery Links
    if (existingAnnouncement.galleryLinks && existingAnnouncement.galleryLinks.length > 0) {
      const newLinks = data.galleryLinks || [];
      const removedLinks = existingAnnouncement.galleryLinks.filter((link: string) => !newLinks.includes(link));

      for (const link of removedLinks) {
        await deleteFromCloudinary(link);
      }
    }

    // Auto-translate galleryDescription if DeepL API is available
    let updateData = { ...data };
    if (data.galleryDescription && process.env.DEEPL_API_KEY) {
      try {
        const { translateContent } = await import('@/app/lib/translate');
        const galleryDescResult = await translateContent(data.galleryDescription, 'tr');
        updateData.galleryDescriptionEn = galleryDescResult.en;
        console.log('Gallery description auto-translated');
      } catch (translateError) {
        console.error('Gallery description translation failed:', translateError);
      }
    }

    const announcement = await Announcement.findOneAndUpdate(
      { slug },
      { ...updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Duyuru güncellenirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Duyuru güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

import { deleteFromCloudinary } from '@/app/lib/cloudinaryHelper';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;
    const announcement = await Announcement.findOne({ slug });

    if (!announcement) {
      return NextResponse.json(
        { error: 'Duyuru bulunamadı' },
        { status: 404 }
      );
    }

    // Delete associated images
    if (announcement.image) await deleteFromCloudinary(announcement.image);
    if (announcement.galleryCover) await deleteFromCloudinary(announcement.galleryCover);
    if (announcement.galleryLinks && announcement.galleryLinks.length > 0) {
      for (const link of announcement.galleryLinks) {
        await deleteFromCloudinary(link);
      }
    }

    await Announcement.findOneAndDelete({ slug });

    return NextResponse.json({ message: 'Duyuru başarıyla silindi' });
  } catch (error) {
    console.error('Duyuru silinirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Duyuru silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 