"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../_context/LanguageContext";

interface Announcement {
  slug: string;
  title: string;
  titleEn?: string;
  date: string;
  dateEn?: string;
  description: string;
  descriptionEn?: string;
  type: "event" | "news" | "workshop";
  galleryLinks?: string[];
  galleryCover?: string;
  isInGallery?: boolean;
  galleryDescription?: string;
  galleryDescriptionEn?: string;
}

export default function GalleryPreview() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    async function loadGallery() {
      try {
        const res = await fetch("/api/announcements");
        if (!res.ok) throw new Error("Galeri yüklenemedi");
        const data: Announcement[] = await res.json();
        const galleryItems = data.filter((a) => a.isInGallery).slice(0, 15);
        setAnnouncements(galleryItems);
      } catch (error) {
        console.error("Galeri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    }

    loadGallery();
  }, []);

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

  const getTypeLabel = (type: string) => {
    if (language === 'en') {
      if (type === 'event') return 'Event';
      if (type === 'news') return 'News';
      return 'Workshop';
    }
    if (type === 'event') return 'Etkinlik';
    if (type === 'news') return 'Duyuru';
    return 'Workshop';
  };

  const getDate = (a: Announcement) => {
    if (language === 'en' && a.dateEn) return a.dateEn;
    return a.date;
  };

  if (loading) return null;

  return (
    <section
      className="py-20 bg-neo-purple border-b-4 border-black scroll-mt-20"
      id="gallery-preview"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="inline-block text-4xl sm:text-5xl font-black text-black mb-4 bg-white border-4 border-black shadow-neo px-6 py-2 transform -rotate-1">
            {t('nav.gallery')}
          </h2>
          <div className="mt-4">
            <Link
              href="/gallery"
              className="inline-block px-6 py-2 bg-black text-white font-bold border-2 border-transparent hover:bg-white hover:text-black hover:border-black hover:shadow-neo transition-all"
            >
              {language === 'tr' ? 'Tümünü Gör' : 'See All'}
            </Link>
          </div>
        </div>
        <div className="flex gap-8 overflow-x-auto py-4 custom-scrollbar">
          {announcements.length === 0 ? (
            <div className="w-full text-center py-12 bg-white border-4 border-black shadow-neo transform rotate-1">
              <p className="text-xl font-black text-black uppercase">
                {language === 'tr' ? 'Henüz galeriye eklenmiş içerik yok.' : 'No content added to gallery yet.'}
              </p>
              <p className="text-black font-medium mt-2">
                {language === 'tr' ? 'Etkinliklerimizden kareler çok yakında burada olacak!' : 'Photos from our events will be here soon!'}
              </p>
            </div>
          ) : (
            announcements.map((a) => (
              <Link
                key={a.slug}
                href={`/gallery/${a.slug}`}
                className="min-w-[320px] max-w-xs bg-white border-4 border-black shadow-neo p-4 flex flex-col hover:-translate-y-2 hover:shadow-neo-lg transition-all"
              >
                {a.galleryCover && (
                  <div className="mb-3 overflow-hidden border-2 border-black shadow-neo-sm">
                    <Image
                      src={a.galleryCover}
                      alt={getTitle(a)}
                      width={320}
                      height={180}
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 text-xs font-bold border-2 border-black shadow-neo-sm
                    ${a.type === "event"
                        ? "bg-neo-purple text-white"
                        : a.type === "news"
                          ? "bg-neo-blue text-black"
                          : "bg-neo-green text-black"
                      }
                  `}
                  >
                    {getTypeLabel(a.type)}
                  </span>
                  <time className="text-xs font-bold text-black bg-gray-100 px-2 py-0.5 border-2 border-black shadow-neo-sm">{getDate(a)}</time>
                </div>
                <h3 className="text-lg font-black text-black mb-1 line-clamp-1 uppercase">
                  {getTitle(a)}
                </h3>
                <p className="text-black font-medium text-sm mb-2 line-clamp-2 border-t-2 border-black pt-2">
                  {getDescription(a)}
                </p>
              </Link>
            )))}
        </div>
      </div>
    </section>
  );
}
