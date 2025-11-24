import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Announcement } from '@/app/lib/models/Announcement';
import { z } from 'zod';

//validasyon şeması
const schema = z.object({
  slug: z.string().min(1).max(100),
  title: z.string().min(1).max(100),
  date: z.string().min(1).max(100),
  description: z.string().min(1).max(100),
  type: z.string().min(1).max(100),
  content: z.string().min(1).max(100),
  eventId: z.string().optional(),
});

export async function GET() {
  try {
    await connectDB();
    const announcements = await Announcement.find({}).sort({ createdAt: -1 });
    return NextResponse.json(announcements);
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

    const announcement = await Announcement.create(data);
    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Duyuru eklenirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Duyuru eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 