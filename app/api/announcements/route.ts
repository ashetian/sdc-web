import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Announcement } from '@/app/lib/models/Announcement';
import { z } from 'zod';
import { verifyAuth } from '@/app/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

//validasyon şeması
const schema = z.object({
  slug: z.string().min(1).max(100),
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
});

import { getAnnouncements, parseDate } from '@/app/lib/services/announcementService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const type = searchParams.get('type') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '0');

    const result = await getAnnouncements({
      activeOnly,
      type,
      page,
      limit
    });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('Duyurular alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Duyurular alınırken bir hata oluştu' },
      { status: 500 }
    );
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

    const data = await request.json();

    console.log('Received data:', JSON.stringify(data, null, 2));

    // Zod validasyonu
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
    if (!['event', 'news', 'article', 'opportunity'].includes(parsed.data.type)) {
      return NextResponse.json(
        { error: 'Geçersiz duyuru türü' },
        { status: 400 }
      );
    }

    // Slug kontrolü - aynı slug varsa hata ver
    const existingAnnouncement = await Announcement.findOne({ slug: parsed.data.slug });
    if (existingAnnouncement) {
      return NextResponse.json(
        { error: `"${parsed.data.slug}" slug'ı zaten kullanılıyor. Lütfen farklı bir başlık veya slug kullanın.` },
        { status: 400 }
      );
    }

    // Auto-translate if DeepL API key is available
    let announcementData = { ...data };

    // Translate date (no API needed - simple month replacement)
    const { translateDate } = await import('@/app/lib/translate');
    const dateEn = translateDate(data.date);
    announcementData.dateEn = dateEn;

    // Populate dateObj for sorting
    const timestamp = parseDate(data.date);
    if (timestamp !== 0) {
      announcementData.dateObj = new Date(timestamp);
    } else {
      announcementData.dateObj = new Date();
    }

    if (process.env.DEEPL_API_KEY) {
      try {
        const { translateContent, translateContentBlocks } = await import('@/app/lib/translate');

        // Translate each field separately
        const titleResult = await translateContent(data.title, 'tr');
        const descResult = await translateContent(data.description, 'tr');
        const contentResult = await translateContent(data.content, 'tr');

        announcementData = {
          ...announcementData,
          titleEn: titleResult.en || '',
          descriptionEn: descResult.en || '',
          contentEn: contentResult.en || '',
        };

        // Translate content blocks if present
        if (data.contentBlocks && data.contentBlocks.length > 0) {
          const translatedBlocks = await translateContentBlocks(data.contentBlocks, 'tr');
          announcementData.contentBlocks = translatedBlocks;
        }

        console.log('Auto-translation successful');
      } catch (translateError) {
        console.error('Auto-translation failed (continuing without translation):', translateError);
        // Continue without translation - announcement will still be created
      }
    }

    const announcement = await Announcement.create(announcementData);
    console.log('Announcement created:', announcement.slug);

    // Send email logic disabled by request
    /*
    // Send email to consenting members if it's not a draft
    if (!announcement.isDraft) {
      // Run in background to not block response
      (async () => {
        try {
          const Member = (await import('@/app/lib/models/Member')).default;
          const { sendEmail, wrapEmailHtml } = await import('@/app/lib/email');

          const members = await Member.find({
            isActive: true,
            emailConsent: true
          }).select('email nativeLanguage');

          if (members.length > 0) {
            // Prepare content for both languages
            const htmlTr = wrapEmailHtml(`
                        <h2 style="margin-bottom: 20px;">${announcement.title}</h2>
                        <div style="margin-bottom: 20px;">
                            ${announcement.description}
                        </div>
                        <p>Detaylar için web sitemizi ziyaret edin.</p>
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/announcements" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Duyuruya Git</a>
                    `, 'Yeni Duyuru', 'tr');

            const htmlEn = wrapEmailHtml(`
                        <h2 style="margin-bottom: 20px;">${announcement.titleEn || announcement.title}</h2>
                        <div style="margin-bottom: 20px;">
                            ${announcement.descriptionEn || announcement.description}
                        </div>
                        <p>Visit our website for details.</p>
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/announcements" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Go to Announcement</a>
                    `, 'New Announcement', 'en');

            for (const member of members) {
              const isEn = member.nativeLanguage === 'en';
              await sendEmail({
                to: member.email,
                subject: isEn
                  ? `New Announcement: ${announcement.titleEn || announcement.title}`
                  : `Yeni Duyuru: ${announcement.title}`,
                html: isEn ? htmlEn : htmlTr
              }).catch(e => console.error(`Failed to send to ${member.email}`, e));
            }
          }
        } catch (err) {
          console.error('Announcement email trigger failed:', err);
        }
      })();
    }
    */

    // Audit log
    await logAdminAction({
      adminId: user.userId,
      adminName: user.nickname || user.studentNo,
      action: AUDIT_ACTIONS.CREATE_ANNOUNCEMENT,
      targetType: 'Announcement',
      targetId: announcement._id.toString(),
      targetName: announcement.title,
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Duyuru eklenirken hata oluştu:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json(
      { error: `Duyuru eklenirken bir hata oluştu: ${errorMessage}` },
      { status: 500 }
    );
  }
} 