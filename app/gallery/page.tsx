import { Metadata } from "next";
import connectDB from "../lib/db";
import { Announcement, IAnnouncement } from "../lib/models/Announcement";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Galeri | KTU Yazilim Gelistirme Kulubu",
  description: "KTU Yazilim Gelistirme Kulubu etkinlik galerisi ve fotograflar.",
  alternates: {
    canonical: "https://ktusdc.com/gallery",
  },
  openGraph: {
    title: "Galeri | KTU Yazilim Gelistirme Kulubu",
    description: "KTU Yazilim Gelistirme Kulubu etkinlik galerisi ve fotograflar.",
    url: "https://ktusdc.com/gallery",
    type: "website",
  },
};

async function getGalleryItems() {
  await connectDB();

  const announcements = await Announcement.find({
    isDraft: false,
    isInGallery: true,
  })
    .sort({ createdAt: -1 })
    .lean() as any[];

  return announcements.map(item => ({
    slug: item.slug,
    title: item.title,
    titleEn: item.titleEn,
    date: item.date,
    dateEn: item.dateEn,
    description: item.description,
    descriptionEn: item.descriptionEn,
    type: item.type,
    galleryCover: item.galleryCover,
    galleryDescription: item.galleryDescription,
    galleryDescriptionEn: item.galleryDescriptionEn,
  }));
}

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return <GalleryClient initialItems={items as any} />;
}