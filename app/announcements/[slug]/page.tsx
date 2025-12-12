import { Metadata } from 'next';
import connectDB from '@/app/lib/db';
import { Announcement, IAnnouncement } from '@/app/lib/models/Announcement';
import AnnouncementClient from './AnnouncementClient';

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate dynamic metadata for OG tags (WhatsApp preview, etc.)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    await connectDB();
    const announcement = await Announcement.findOne({ slug }).lean() as IAnnouncement | null;

    if (!announcement || announcement.isDraft) {
      return {
        title: 'Duyuru Bulunamadı | KTÜ Yazılım Geliştirme Kulübü',
        description: 'Aradığınız duyuru bulunamadı.',
      };
    }

    const title = announcement.title;
    const description = announcement.description || announcement.content?.substring(0, 160);
    const image = announcement.image;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ktusdc.com';

    return {
      title: `${title} | KTÜ Yazılım Geliştirme Kulübü`,
      description: description,
      openGraph: {
        title: title,
        description: description,
        url: `${baseUrl}/announcements/${slug}`,
        siteName: 'KTÜ Yazılım Geliştirme Kulübü',
        images: image ? [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: title,
          }
        ] : [
          {
            url: `${baseUrl}/og-default.png`,
            width: 1200,
            height: 630,
            alt: 'KTÜ Yazılım Geliştirme Kulübü',
          }
        ],
        locale: 'tr_TR',
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: image ? [image] : [`${baseUrl}/og-default.png`],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Duyuru | KTÜ Yazılım Geliştirme Kulübü',
    };
  }
}

export default async function AnnouncementPage({ params }: Props) {
  const { slug } = await params;
  return <AnnouncementClient slug={slug} />;
}
