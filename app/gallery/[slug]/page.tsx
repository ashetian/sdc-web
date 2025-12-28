import { Metadata } from "next";
import { notFound } from "next/navigation";
import connectDB from "../../lib/db";
import { Announcement, IAnnouncement } from "../../lib/models/Announcement";
import GalleryContent from "./GalleryContent";
import { cookies } from "next/headers";

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate metadata with canonical URL for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  await connectDB();
  const announcement = await Announcement.findOne({ slug, isInGallery: true }).lean() as (IAnnouncement & { _id: string }) | null;

  if (!announcement) {
    return {
      title: 'Galeri Bulunamadi',
    };
  }

  const title = announcement.title;
  const description = announcement.galleryDescription || announcement.description || '';

  return {
    title: title,
    description: description.substring(0, 160),
    alternates: {
      canonical: `https://ktusdc.com/gallery/${slug}`,
    },
    openGraph: {
      title: title,
      description: description.substring(0, 160),
      url: `https://ktusdc.com/gallery/${slug}`,
      type: 'article',
      images: announcement.galleryCover ? [announcement.galleryCover] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description.substring(0, 160),
      images: announcement.galleryCover ? [announcement.galleryCover] : [],
    },
  };
}

export default async function GalleryDetailPage({ params }: Props) {
  const { slug } = await params;

  await connectDB();
  const announcement = await Announcement.findOne({ slug, isInGallery: true }).lean() as (IAnnouncement & { _id: string }) | null;

  if (!announcement) {
    notFound();
  }

  // Get language from cookie
  const cookieStore = await cookies();
  const language = cookieStore.get('language')?.value || 'tr';

  // Prepare translations for client component
  const translations = {
    backToGallery: language === 'en' ? '< Back to Gallery' : '< Galeriye Don',
    notFound: language === 'en' ? 'Gallery item not found' : 'Galeri ogesi bulunamadi',
    galleryImage: language === 'en' ? 'Gallery Image' : 'Galeri Gorseli',
    viewFile: language === 'en' ? 'View File' : 'Dosyayi Gor',
    types: {
      event: language === 'en' ? 'Event' : 'Etkinlik',
      news: language === 'en' ? 'News' : 'Haber',
      workshop: language === 'en' ? 'Workshop' : 'Atolye',
    },
  };

  // Serialize the announcement data for client component
  const announcementData = {
    _id: announcement._id.toString(),
    slug: announcement.slug,
    title: announcement.title,
    titleEn: announcement.titleEn,
    date: announcement.date,
    dateEn: announcement.dateEn,
    description: announcement.description,
    descriptionEn: announcement.descriptionEn,
    type: announcement.type,
    galleryCover: announcement.galleryCover,
    galleryDescription: announcement.galleryDescription,
    galleryDescriptionEn: announcement.galleryDescriptionEn,
    galleryLinks: announcement.galleryLinks,
  };

  return (
    <GalleryContent
      announcement={announcementData}
      language={language}
      translations={translations}
    />
  );
}