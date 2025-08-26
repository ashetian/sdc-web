import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Announcement } from '@/app/lib/models/Announcement';
import z from 'zod';

//validasyon şeması
const schema = z.object({
  title: z.string().min(1).max(100),
  date: z.string().min(1).max(100),
  description: z.string().min(1).max(100),
  type: z.string().min(1).max(100),
  content: z.string().min(1).max(100),
});

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const announcement = await Announcement.findOne({ slug: params.slug });
    
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
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
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

    const announcement = await Announcement.findOneAndUpdate(
      { slug: params.slug },
      { ...parsed.data },
      { new: true, runValidators: true }
    );
    
    if (!announcement) {
      return NextResponse.json(
        { error: 'Duyuru bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Duyuru güncellenirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Duyuru güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();
    const announcement = await Announcement.findOneAndDelete({ slug: params.slug });
    
    if (!announcement) {
      return NextResponse.json(
        { error: 'Duyuru bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Duyuru başarıyla silindi' });
  } catch (error) {
    console.error('Duyuru silinirken hata oluştu:', error);
    return NextResponse.json(
      { error: 'Duyuru silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 