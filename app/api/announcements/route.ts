import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Announcement } from '@/app/lib/models/Announcement';

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
    
    // Gerekli alanların kontrolü
    const requiredFields = ['slug', 'title', 'date', 'description', 'type', 'content'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} alanı gereklidir` },
          { status: 400 }
        );
      }
    }

    // Tür kontrolü
    if (!['event', 'news', 'workshop'].includes(data.type)) {
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