"use client";
import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../../_context/LanguageContext";
import ShareButtons from "../../_components/ShareButtons";
import CommentSection from "../../_components/CommentSection";

interface Announcement {
  _id: string;
  slug: string;
  title: string;
  titleEn?: string;
  date: string;
  dateEn?: string;
  description: string;
  descriptionEn?: string;
  type: "event" | "news" | "workshop";
  content: string;
  contentEn?: string;
  galleryLinks?: string[];
  galleryCover?: string;
  galleryDescription?: string;
  galleryDescriptionEn?: string;
  isInGallery?: boolean;
}

function isImage(url: string) {
  return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || url.includes("image/upload");
}

function isVideo(url: string) {
  return url.match(/\.(mp4|webm|mov)$/i) || url.includes("video/upload");
}

export default function GalleryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  const labels = {
    tr: {
      backToGallery: '← Galeriye Dön',
      notFound: 'Galeri etkinliği bulunamadı.',
      event: 'Etkinlik',
      news: 'Duyuru',
      workshop: 'Workshop',
      viewFile: 'Dosyayı Görüntüle',
      galleryImage: 'Galeri görseli'
    },
    en: {
      backToGallery: '← Back to Gallery',
      notFound: 'Gallery event not found.',
      event: 'Event',
      news: 'News',
      workshop: 'Workshop',
      viewFile: 'View File',
      galleryImage: 'Gallery image'
    }
  };

  const l = labels[language];

  useEffect(() => {
    async function loadAnnouncement() {
      try {
        const res = await fetch(`/api/announcements/${slug}`);
        if (!res.ok) throw new Error("Duyuru yüklenemedi");
        const data = await res.json();
        if (data.isInGallery) {
          setAnnouncement(data);
        }
      } catch (error) {
        console.error("Duyuru yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAnnouncement();
  }, [slug]);

  const getTitle = (a: Announcement) => {
    if (language === 'en' && a.titleEn) return a.titleEn;
    return a.title;
  };

  const getDescription = (a: Announcement) => {
    if (language === 'en') {
      if (a.galleryDescriptionEn) return a.galleryDescriptionEn;
      if (a.descriptionEn) return a.descriptionEn;
    }
    return a.galleryDescription || a.description;
  };

  const getTypeLabel = (type: "event" | "news" | "workshop") => {
    return l[type];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neo-purple">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neo-yellow">
        <div className="bg-white border-4 border-black shadow-neo p-8 text-2xl font-black text-black">
          {l.notFound}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neo-purple py-20 pt-40 border-b-4 border-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border-4 border-black shadow-neo-lg p-8 transform rotate-1">
          <Link href="/gallery" className="text-black font-black hover:underline mb-6 inline-block uppercase text-sm" lang={language}>
            {l.backToGallery}
          </Link>

          {announcement.galleryCover && (
            <div className="mb-8 border-4 border-black shadow-neo">
              <Image
                src={announcement.galleryCover}
                alt={getTitle(announcement)}
                width={800}
                height={400}
                className="w-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <span
              className={`px-4 py-1 text-sm font-black uppercase border-2 border-black shadow-neo-sm
                ${announcement.type === "event" ? "bg-neo-purple text-white" :
                  announcement.type === "news" ? "bg-neo-blue text-black" :
                    "bg-neo-green text-black"}
              `}
            >
              {getTypeLabel(announcement.type)}
            </span>
            <time className="text-sm font-bold text-black bg-gray-100 px-2 py-1 border-2 border-black shadow-neo-sm">{language === 'en' && announcement.dateEn ? announcement.dateEn : announcement.date}</time>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-black mb-6 uppercase leading-tight" lang={language}>{getTitle(announcement)}</h1>

          {(announcement.galleryDescription || announcement.galleryDescriptionEn) && (
            <p className="text-black font-medium text-lg mb-8 whitespace-pre-line border-l-4 border-black pl-4">
              {getDescription(announcement)}
            </p>
          )}

          {announcement.galleryLinks && announcement.galleryLinks.length > 0 && (
            <div className="space-y-8">
              {announcement.galleryLinks.map((link, i) => (
                <div key={i} className="w-full border-4 border-black shadow-neo bg-black p-2">
                  {isImage(link) ? (
                    <Image
                      src={link}
                      alt={`${l.galleryImage} ${i + 1}`}
                      width={800}
                      height={500}
                      className="w-full object-contain bg-black"
                    />
                  ) : isVideo(link) ? (
                    <video
                      src={link}
                      controls
                      className="w-full bg-black"
                    />
                  ) : (
                    <a href={link} className="text-white font-bold underline p-4 block text-center hover:text-neo-yellow">
                      {l.viewFile}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Share Buttons */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200">
            <ShareButtons
              url={typeof window !== 'undefined' ? window.location.href : `https://ktusdc.com/gallery/${slug}`}
              title={getTitle(announcement)}
              description={getDescription(announcement)}
            />
          </div>
        </div>

        {/* Comments Section - Outside main content for visual separation */}
        <CommentSection contentType="gallery" contentId={announcement._id} />
      </div>
    </div>
  );
}