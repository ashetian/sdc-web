"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "../_context/LanguageContext";
import ImageLightbox from "./ImageLightbox";

// Robust interface for Announcement
interface Announcement {
  _id?: string;
  slug: string;
  title: string;
  titleEn?: string;
  date: string;
  dateEn?: string;
  description: string;
  descriptionEn?: string;
  type: string; // Using string to handle any type safely
  content: string;
  contentEn?: string;
  image?: string;
  imageOrientation?: "horizontal" | "vertical";
  isDraft: boolean;
  isArchived?: boolean;
  eventId?: string;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { language } = useLanguage();

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const res = await fetch("/api/announcements?active=true");
        if (!res.ok) throw new Error("Duyurular alınamadı");

        const data = await res.json();

        if (Array.isArray(data)) {
          const activeAnnouncements = data
            .filter((a: Announcement) => !a.isDraft && !a.isArchived)
            .slice(0, 10); // Limit to 10 announcements
          setAnnouncements(activeAnnouncements);
          // console.log("Loaded announcements:", activeAnnouncements.length);
        } else {
          console.error("API response is not an array:", data);
        }
      } catch (error) {
        console.error("Duyurular yüklenirken hata:", error);
      }
    }
    loadAnnouncements();
  }, []);

  // Use modulo to safely access current announcement
  const safeIndex = announcements.length > 0 ? ((currentIndex % announcements.length) + announcements.length) % announcements.length : 0;

  // Auto-swipe logic
  useEffect(() => {
    if (announcements.length <= 1) return;

    const delay = safeIndex === 0 ? 15000 : 7000;
    const timeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1));
    }, delay);

    return () => clearTimeout(timeout);
  }, [announcements.length, safeIndex]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1));
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  // Safe helper for type styles
  const getTypeStyles = (type: string) => {
    const normalizedType = type?.toLowerCase().trim() || 'news';
    switch (normalizedType) {
      case "event": return "bg-neo-purple text-white";
      case "news": return "bg-neo-blue text-black";
      case "workshop": return "bg-neo-green text-black";
      case "article": return "bg-neo-peach text-black";
      default: return "bg-neo-blue text-black"; // Default fallback
    }
  };

  // Safe helper for type text
  const getTypeText = (type: string) => {
    const safeLang = (language === 'en' || language === 'tr') ? language : 'tr';
    const typeLabels: Record<string, Record<string, string>> = {
      tr: { event: "Etkinlik", news: "Duyuru", workshop: "Workshop", article: "Makale" },
      en: { event: "Event", news: "News", workshop: "Workshop", article: "Article" }
    };

    const normalizedType = type?.toLowerCase().trim() || 'news';
    return typeLabels[safeLang][normalizedType] || typeLabels[safeLang]['news'];
  };

  const getText = (tr: string | undefined, en: string | undefined, fallback: string) => {
    if (language === 'en' && en) return en;
    return tr || fallback;
  };

  const labels = {
    tr: {
      noAnnouncements: 'Henüz duyuru bulunmuyor.',
      details: 'Detayları Gör',
      register: 'Etkinliğe Kaydol',
      viewAll: 'Tüm Duyurular'
    },
    en: {
      noAnnouncements: 'No announcements yet.',
      details: 'View Details',
      register: 'Register for Event',
      viewAll: 'All Announcements'
    }
  };

  const l = labels[language] || labels.tr;

  // Swipe logic
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Reset touch end
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrev();
    }
  };

  if (announcements.length === 0) {
    return (
      <section id="announcements" className="min-h-[60vh] bg-neo-green flex items-center justify-center border-b-4 border-black">
        <p className="text-2xl font-bold text-black">{l.noAnnouncements}</p>
      </section>
    );
  }

  const current = announcements[safeIndex];

  // Safe check if current exists (should exist due to length check above)
  if (!current) return null;

  const isVertical = current?.imageOrientation === "vertical";

  return (
    <section
      id="announcements"
      className="relative min-h-[80vh] bg-neo-blue border-b-4 border-black overflow-hidden touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Announcement Content */}
      {/* Standard Vertical Layout - Image Left, Text Right (Desktop) / Stacked (Mobile) */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center py-20">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 w-full">
          {current.image && (
            <div className="flex-shrink-0 w-full md:w-2/5">
              <div className="relative aspect-[4/5] max-h-[60vh] border-4 border-black shadow-neo overflow-hidden mx-auto md:mx-0">
                <ImageLightbox
                  src={current.image}
                  alt={getText(current.title, current.titleEn, '')}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
          <div className={`flex-1 flex flex-col ${current.image ? 'items-start text-left' : 'items-center text-center'}`}>
            <h2 className="text-3xl sm:text-5xl font-black text-black mb-6 uppercase" lang={language}>
              {getText(current.title, current.titleEn, '')}
            </h2>
            <p className="text-lg sm:text-xl font-medium text-black mb-8 max-w-xl">
              {getText(current.description, current.descriptionEn, '')}
            </p>
            <div className={`flex gap-4 flex-wrap ${current.image ? '' : 'justify-center'}`}>
              <Link
                href={`/announcements/${current.slug}`}
                className="px-8 py-4 bg-black text-white font-black uppercase border-4 border-black hover:bg-white hover:text-black hover:shadow-neo transition-all"
                lang={language}
              >
                {l.details}
              </Link>
              {current.eventId && (
                <Link
                  href={`/events/${current.eventId}/register`}
                  className="px-8 py-4 bg-neo-green text-black font-black uppercase border-4 border-black hover:shadow-neo transition-all"
                  lang={language}
                >
                  {l.register}
                </Link>
              )}
            </div>
            {/* Mobile View All Button - In Flow */}
            <div className="mt-6 sm:hidden w-full flex justify-center">
              <Link
                href="/announcements"
                className="px-6 py-2 bg-white border-2 border-black font-bold text-sm hover:bg-black hover:text-white transition-all shadow-neo-sm"
              >
                {l.viewAll} →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {announcements.length > 1 && (
        <>
          {/* Arrow Buttons */}
          <button
            onClick={goToPrev}
            className="absolute left-4 top-[40%] -translate-y-1/2 w-12 h-12 bg-white border-4 border-black shadow-neo flex items-center justify-center hover:bg-black hover:text-white transition-colors z-10 hidden sm:flex !transform-none"
            aria-label="Previous announcement"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-[40%] -translate-y-1/2 w-12 h-12 bg-white border-4 border-black shadow-neo flex items-center justify-center hover:bg-black hover:text-white transition-colors z-10 hidden sm:flex !transform-none"
            aria-label="Next announcement"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {announcements.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-3 h-3 border-2 border-black transition-all ${idx === safeIndex ? 'bg-black scale-125' : 'bg-white hover:bg-gray-300'
                  }`}
                aria-label={`Go to announcement ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Progress Bar */}
      {announcements.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
          <div
            key={safeIndex}
            className="h-full bg-black"
            style={{
              animation: `progress ${safeIndex === 0 ? '15s' : '7s'} linear forwards`,
              width: '0%'
            }}
          />
        </div>
      )}

      {/* Desktop View All Button - Centered Bottom */}
      <div className="absolute bottom-4 w-full flex justify-center z-20 hidden sm:flex">
        <Link
          href="/announcements"
          className="px-6 py-2 bg-white border-2 border-black font-bold text-sm hover:bg-black hover:text-white transition-all shadow-neo-sm"
        >
          {l.viewAll} →
        </Link>
      </div>




      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
