import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Announcement } from '@/app/lib/models/Announcement';
import { z } from 'zod';

//validasyon şeması
const schema = z.object({
  slug: z.string().min(1).max(100),
  title: z.string().min(1).max(100),
  date: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  type: z.string().min(1).max(100),
  content: z.string().min(1).max(10000),
  eventId: z.string().optional(),
});

// Tarih ayrıştırma yardımcı fonksiyonu
function parseDate(dateStr: string): number {
  try {
    // Türkçe ay isimleri haritası
    const turkishMonths: { [key: string]: number } = {
      'ocak': 0, 'şubat': 1, 'mart': 2, 'nisan': 3, 'mayıs': 4, 'haziran': 5,
      'temmuz': 6, 'ağustos': 7, 'eylül': 8, 'ekim': 9, 'kasım': 10, 'aralık': 11,
      'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
      'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
    };

    // Normalize string: lowercase and trim
    const normalized = dateStr.toLowerCase().trim();

    // 1. Format: "1 Nisan 2024" veya "1 April 2024"
    const parts = normalized.split(/\s+/);
    if (parts.length >= 3) {
      const day = parseInt(parts[0]);
      const monthStr = parts[1];
      const year = parseInt(parts[2]);

      if (!isNaN(day) && !isNaN(year) && turkishMonths[monthStr] !== undefined) {
        return new Date(year, turkishMonths[monthStr], day).getTime();
      }
    }

    // 2. Format: Standart tarih formatları (YYYY-MM-DD, vb.)
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.getTime();
    }

    return 0; // Ayrıştırılamayan tarihler en sona
  } catch (e) {
    return 0;
  }
}

export async function GET() {
  try {
    await connectDB();
    // Önce hepsini çekiyoruz, çünkü string tarih alanına göre veritabanı seviyesinde sıralama yapamayız
    const announcements = await Announcement.find({});

    // JavaScript tarafında sıralama yapıyoruz
    const sortedAnnouncements = announcements.sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);

      // Tarihler eşitse oluşturulma tarihine göre (yeni olan önce)
      if (dateA === dateB) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      // Tarihe göre azalan sıralama (yeni tarih önce)
      return dateB - dateA;
    });

    return NextResponse.json(sortedAnnouncements);
  } catch (error) {
    console.error('Duyurular alınırken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Duyurular alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();

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
    if (!['event', 'news', 'workshop'].includes(parsed.data.type)) {
      return NextResponse.json(
        { error: 'Geçersiz duyuru türü' },
        { status: 400 }
      );
    }

    // Auto-translate if DeepL API key is available
    let announcementData = { ...data };

    // Translate date (no API needed - simple month replacement)
    const { translateDate } = await import('@/app/lib/translate');
    const dateEn = translateDate(data.date);
    announcementData.dateEn = dateEn;

    if (process.env.DEEPL_API_KEY) {
      try {
        const { translateContent } = await import('@/app/lib/translate');

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
        console.log('Auto-translation successful');
      } catch (translateError) {
        console.error('Auto-translation failed (continuing without translation):', translateError);
        // Continue without translation - announcement will still be created
      }
    }

    const announcement = await Announcement.create(announcementData);
    console.log('Announcement created:', announcement.slug);
    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Duyuru eklenirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Duyuru eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 