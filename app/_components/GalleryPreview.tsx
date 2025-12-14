"use client";
import { useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "../_context/LanguageContext";
import { useAnnouncements } from "../lib/swr";
import type { Announcement } from "../lib/types/api";

export default function GalleryPreview({ initialData }: { initialData?: Announcement[] }) {
  const { data, isLoading } = useAnnouncements({ fallbackData: initialData });
  const { language, t } = useLanguage();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter gallery items from announcements
  const announcements = useMemo(() => {
    if (!data) return [];
    return (data as Announcement[]).filter((a) => a.isInGallery).slice(0, 15);
  }, [data]);

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

  if (isLoading) {
    return (
      <section className="py-20 bg-neo-cyan border-b-4 border-black scroll-mt-20" id="gallery-preview">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="h-12 w-48 bg-gray-200 animate-pulse mx-auto rounded"></div>
          </div>
          <div className="flex gap-8 overflow-x-auto py-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[320px] max-w-xs bg-white border-4 border-black shadow-neo p-4 animate-pulse">
                <div className="h-40 bg-gray-200 mb-3 border-2 border-black"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350; // roughly one card width + gap
      const newScrollLeft = scrollContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section
      className="py-20 bg-neo-cyan border-b-4 border-black scroll-mt-20 relative"
      id="gallery-preview"
    >
      {/* Left navigation button - screen edge, hidden on mobile */}
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center bg-white border-4 border-black shadow-neo hover:shadow-neo-sm hover:translate-y-[calc(-50%+2px)] active:shadow-none active:translate-y-[calc(-50%+4px)] transition-all font-black"
        aria-label={t('gallery.previous')}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Right navigation button - screen edge, hidden on mobile */}
      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center bg-white border-4 border-black shadow-neo hover:shadow-neo-sm hover:translate-y-[calc(-50%+2px)] active:shadow-none active:translate-y-[calc(-50%+4px)] transition-all font-black"
        aria-label={t('gallery.next')}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

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
              {t('gallery.seeAll')}
            </Link>
          </div>
        </div>

        {/* Gallery container */}
        <div className="relative">
          <div ref={scrollContainerRef} className="flex gap-8 overflow-x-auto py-4 custom-scrollbar scroll-smooth">
            {announcements.length === 0 ? (
              <div className="w-full text-center py-12 bg-white border-4 border-black shadow-neo transform rotate-1">
                <p className="text-xl font-black text-black uppercase" lang={language}>
                  {t('gallery.noContent')}
                </p>
                <p className="text-black font-medium mt-2">
                  {t('gallery.comingSoon')}
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
                  <h3 className="text-lg font-black text-black mb-1 line-clamp-1 uppercase" lang={language}>
                    {getTitle(a)}
                  </h3>
                  <p className="text-black font-medium text-sm mb-2 line-clamp-2 border-t-2 border-black pt-2">
                    {getDescription(a)}
                  </p>
                </Link>
              )))}
          </div>
        </div>
      </div>
    </section>
  );
}
