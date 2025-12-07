import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Announcement } from '@/app/lib/models/Announcement';
import z from 'zod';
import { deleteFromCloudinary } from '@/app/lib/cloudinaryHelper';
import { verifyAuth } from '@/app/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

//validasyon şeması
const schema = z.object({
  slug: z.string().optional(),
  title: z.string().min(1).max(100),
  date: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  type: z.string().min(1).max(100),
  content: z.string().max(10000).optional().default(''),
  eventId: z.string().optional(),
  image: z.string().optional(),
  imageOrientation: z.string().optional(),
  contentBlocks: z.array(z.any()).optional(),
  isDraft: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  isInGallery: z.boolean().optional(),
  galleryLinks: z.array(z.string()).optional(),
  galleryCover: z.string().optional(),
  galleryDescription: z.string().optional(),
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
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;

    // Auth check
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const data = await request.json();

    // Gerekli alanların kontrolü ama zodla
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const errorDetails = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
      console.error('Validation failed:', errorDetails);
      return NextResponse.json(
        { error: errorDetails },
        { status: 400 }
      );
    }

    // Tür kontrolü
    if (!['event', 'news', 'article'].includes(parsed.data.type)) {
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
    if (existingAnnouncement.image && parsed.data.image && existingAnnouncement.image !== parsed.data.image) {
      await deleteFromCloudinary(existingAnnouncement.image);
    } else if (existingAnnouncement.image && !parsed.data.image) {
      // If image is removed (set to null/empty)
      await deleteFromCloudinary(existingAnnouncement.image);
    }

    // 2. Gallery Cover
    if (existingAnnouncement.galleryCover && parsed.data.galleryCover && existingAnnouncement.galleryCover !== parsed.data.galleryCover) {
      await deleteFromCloudinary(existingAnnouncement.galleryCover);
    } else if (existingAnnouncement.galleryCover && !parsed.data.galleryCover) {
      await deleteFromCloudinary(existingAnnouncement.galleryCover);
    }

    // 3. Gallery Links
    if (existingAnnouncement.galleryLinks && existingAnnouncement.galleryLinks.length > 0) {
      const newLinks = parsed.data.galleryLinks || [];
      const removedLinks = existingAnnouncement.galleryLinks.filter((link: string) => !newLinks.includes(link));

      for (const link of removedLinks) {
        await deleteFromCloudinary(link);
      }
    }

    // Auto-translate content if DeepL API is available
    let updateData: any = { ...parsed.data };
    if (process.env.DEEPL_API_KEY) {
      try {
        const { translateContent, translateFields, translateDate } = await import('@/app/lib/translate');

        // Translate main fields: title, description, content
        const mainTranslations = await translateFields({
          title: parsed.data.title,
          description: parsed.data.description,
          content: parsed.data.content,
        }, 'tr');

        updateData.titleEn = mainTranslations.title?.en || '';
        updateData.descriptionEn = mainTranslations.description?.en || '';
        updateData.contentEn = mainTranslations.content?.en || '';

        // Translate date
        if (parsed.data.date) {
          // @ts-ignore
          updateData.dateEn = translateDate(parsed.data.date);
        }

        // Translate gallery description if present
        if (parsed.data.galleryDescription) {
          const galleryDescResult = await translateContent(parsed.data.galleryDescription, 'tr');
          updateData.galleryDescriptionEn = galleryDescResult.en;
        }

        console.log('Announcement auto-translated on update');
      } catch (translateError) {
        console.error('Auto-translation failed:', translateError);
        // Continue without translation
      }
    }

    const announcement = await Announcement.findOneAndUpdate(
      { slug },
      { ...updateData },
      { new: true, runValidators: true }
    );

    // Audit log
    await logAdminAction({
      adminId: user.userId,
      adminName: user.nickname || user.studentNo,
      action: AUDIT_ACTIONS.UPDATE_ANNOUNCEMENT,
      targetType: 'Announcement',
      targetId: announcement?._id?.toString() || slug,
      targetName: announcement?.title || slug,
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Duyuru güncellenirken hata oluştu:', error);
    return NextResponse.json(
      { error: `Duyuru güncellenirken bir hata oluştu: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    const { slug } = await params;

    // Auth check
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
    }

    const announcement = await Announcement.findOne({ slug });

    if (!announcement) {
      return NextResponse.json(
        { error: 'Duyuru bulunamadı' },
        { status: 404 }
      );
    }

    const announcementTitle = announcement.title;

    // Delete associated images
    if (announcement.image) await deleteFromCloudinary(announcement.image);
    if (announcement.galleryCover) await deleteFromCloudinary(announcement.galleryCover);
    if (announcement.galleryLinks && announcement.galleryLinks.length > 0) {
      for (const link of announcement.galleryLinks) {
        await deleteFromCloudinary(link);
      }
    }

    await Announcement.findOneAndDelete({ slug });

    // Audit log
    await logAdminAction({
      adminId: user.userId,
      adminName: user.nickname || user.studentNo,
      action: AUDIT_ACTIONS.DELETE_ANNOUNCEMENT,
      targetType: 'Announcement',
      targetId: slug,
      targetName: announcementTitle,
    });

    return NextResponse.json({ message: 'Duyuru başarıyla silindi' });
  } catch (error) {
    console.error('Duyuru silinirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Duyuru silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 