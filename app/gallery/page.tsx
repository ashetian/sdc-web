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

export default function GalleryPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  const labels = {
    tr: {
      title: 'Galeri / Arşiv',
      noContent: 'Henüz galeriye eklenmiş etkinlik yok.',
      view: 'İncele',
      event: 'Etkinlik',
      news: 'Duyuru',
      workshop: 'Workshop'
    },
    en: {
      title: 'Gallery / Archive',
      noContent: 'No events have been added to the gallery yet.',
      view: 'View',
      event: 'Event',
      news: 'News',
      workshop: 'Workshop'
    }
  };

  const l = labels[language];

  useEffect(() => {
    async function loadGallery() {
      try {
        const res = await fetch("/api/announcements");
        if (!res.ok) throw new Error("Galeri yüklenemedi");
        const data: Announcement[] = await res.json();
        setAnnouncements(data.filter((a) => a.isInGallery));
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

  const getTypeLabel = (type: "event" | "news" | "workshop") => {
    return l[type];
  };

  const getDate = (a: Announcement) => {
    if (language === 'en' && a.dateEn) return a.dateEn;
    return a.date;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neo-purple">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
      </div>
    );
  }

  return (
    <section className="py-20 pt-40 bg-neo-purple min-h-screen border-b-4 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="inline-block text-4xl sm:text-6xl font-black text-black mb-6 bg-white border-4 border-black shadow-neo px-8 py-4 transform -rotate-1" lang={language}>
            {l.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {announcements.length === 0 && (
            <div className="col-span-full text-center">
              <div className="inline-block bg-white border-4 border-black shadow-neo p-8 transform rotate-1">
                <p className="text-2xl font-black text-black">{l.noContent}</p>
              </div>
            </div>
          )}
          {announcements.map((a, index) => (
            <Link
              key={a.slug}
              href={`/gallery/${a.slug}`}
              className={`bg-white border-4 border-black shadow-neo flex flex-col transform transition-all duration-200 hover:-translate-y-2 hover:shadow-neo-lg
                ${index % 3 === 0 ? 'rotate-1' : index % 3 === 1 ? '-rotate-1' : 'rotate-0'}
              `}
            >
              {a.galleryCover && (
                <div className="mb-4 overflow-hidden border-b-4 border-black">
                  <Image src={a.galleryCover} alt={getTitle(a)} width={400} height={250} className="w-full h-56 object-cover" />
                </div>
              )}
              <div className="p-6 pt-2 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 text-sm font-bold border-2 border-black shadow-neo-sm
                      ${a.type === "event" ? "bg-neo-purple text-white" :
                        a.type === "news" ? "bg-neo-blue text-black" :
                          "bg-neo-green text-black"}
                    `}
                  >
                    {getTypeLabel(a.type)}
                  </span>
                  <time className="text-sm font-bold text-black bg-gray-100 px-2 py-1 border-2 border-black shadow-neo-sm">{getDate(a)}</time>
                </div>
                <h3 className="text-2xl font-black text-black mb-3 uppercase leading-tight" lang={language}>{getTitle(a)}</h3>
                <p className="text-black font-medium mb-4 line-clamp-3 border-l-4 border-black pl-3">{getDescription(a)}</p>
                <div className="mt-auto pt-4 border-t-4 border-black">
                  <span className="inline-block w-full text-center py-2 bg-black text-white font-bold uppercase hover:bg-white hover:text-black hover:border-2 hover:border-black transition-all" lang={language}>
                    {l.view}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}