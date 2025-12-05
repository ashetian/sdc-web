"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../_context/LanguageContext";
import ImageLightbox from "./ImageLightbox";

interface Announcement {
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
        const activeAnnouncements = data
          .filter((a: Announcement) => !a.isDraft && !a.isArchived)
          .slice(0, 10); // Limit to 10 announcements
        setAnnouncements(activeAnnouncements);
      } catch (error) {
        console.error("Duyurular yüklenirken hata:", error);
      }
    }
    loadAnnouncements();
  }, []);

  // Auto-swipe: first slide 15s, others 7s
  // Reset timer when currentIndex changes
  useEffect(() => {
    if (announcements.length <= 1) return;

    const delay = currentIndex === 0 ? 15000 : 7000;
    const timeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, delay);

    return () => clearTimeout(timeout);
  }, [announcements.length, currentIndex]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  }, [announcements.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  }, [announcements.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  const getTypeStyles = (type: Announcement["type"]) => {
    switch (type) {
      case "event": return "bg-neo-purple text-white";
      case "news": return "bg-neo-blue text-black";
      case "workshop": return "bg-neo-green text-black";
    }
  };

  const getTypeText = (type: Announcement["type"]) => {
    const typeLabels = {
      tr: { event: "Etkinlik", news: "Duyuru", workshop: "Workshop" },
      en: { event: "Event", news: "News", workshop: "Workshop" }
    };
    return typeLabels[language][type];
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

  const l = labels[language];

  if (announcements.length === 0) {
    return (
      <section id="announcements" className="min-h-[60vh] bg-neo-mint flex items-center justify-center border-b-4 border-black">
        <p className="text-2xl font-bold text-black">{l.noAnnouncements}</p>
      </section>
    );
  }

  const current = announcements[currentIndex];
  const isVertical = current?.imageOrientation === "vertical";

  return (
    <section
      id="announcements"
      className="relative min-h-[80vh] bg-neo-mint border-b-4 border-black overflow-hidden"
    >
      {/* Announcement Content */}
      <div className={`max-w-7xl mx-auto px-12 sm:px-20 lg:px-24 pt-24 pb-24 flex items-center justify-center min-h-[80vh] ${isVertical ? 'flex-col' : 'flex-row gap-12'}`}>

        {/* Date & Type - Absolute Top Left */}
        <div className="absolute top-6 left-8 flex items-center gap-3 z-20 hidden sm:flex">
          <span className={`px-4 py-2 text-sm font-black uppercase border-2 border-black shadow-neo-sm ${getTypeStyles(current.type)}`}>
            {getTypeText(current.type)}
          </span>
          <time className="text-sm font-bold text-black bg-white px-3 py-2 border-2 border-black shadow-neo-sm">
            {getText(current.date, current.dateEn, '')}
          </time>
        </div>

        {/* Mobile Date & Type - Absolute Top Left (Smaller) */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20 sm:hidden">
          <span className={`px-3 py-1 text-xs font-black uppercase border-2 border-black shadow-neo-sm w-fit ${getTypeStyles(current.type)}`}>
            {getTypeText(current.type)}
          </span>
          <time className="text-xs font-bold text-black bg-white px-2 py-1 border-2 border-black shadow-neo-sm w-fit">
            {getText(current.date, current.dateEn, '')}
          </time>
        </div>

        {/* Vertical Image Layout - Image Left, Text Right */}
        {isVertical && current && (
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
            </div>
          </div>
        )}

        {/* Horizontal Layout */}
        {!isVertical && current && (
          <>
            {current.image && (
              <div className="flex-shrink-0 w-full md:w-1/2 flex justify-center">
                <div className="relative aspect-[5/4] w-full border-4 border-black shadow-neo overflow-hidden">
                  <ImageLightbox
                    src={current.image}
                    alt={getText(current.title, current.titleEn, '')}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
            <div className={`flex-1 py-8 flex flex-col ${current.image ? 'items-start text-left' : 'items-center text-center'}`}>
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
            </div>
          </>
        )}
      </div>

      {/* Navigation Controls */}
      {announcements.length > 1 && (
        <>
          {/* Arrow Buttons */}
          <button
            onClick={goToPrev}
            className="absolute left-4 top-[40%] -translate-y-1/2 w-12 h-12 bg-white border-4 border-black shadow-neo flex items-center justify-center hover:bg-black hover:text-white transition-all z-10"
            aria-label="Previous announcement"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-[40%] -translate-y-1/2 w-12 h-12 bg-white border-4 border-black shadow-neo flex items-center justify-center hover:bg-black hover:text-white transition-all z-10"
            aria-label="Next announcement"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {announcements.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-3 h-3 border-2 border-black transition-all ${idx === currentIndex ? 'bg-black scale-125' : 'bg-white hover:bg-gray-300'
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
            key={currentIndex}
            className="h-full bg-black"
            style={{
              animation: `progress ${currentIndex === 0 ? '15s' : '7s'} linear forwards`,
              width: '0%'
            }}
          />
        </div>
      )}
      {/* View All Announcements Button - Bottom Right */}
      <Link
        href="/announcements"
        className="absolute bottom-8 right-8 px-6 py-2 bg-white border-2 border-black font-bold text-sm hover:bg-black hover:text-white transition-all z-20 shadow-neo-sm hidden sm:block"
      >
        {l.viewAll} →
      </Link>

      {/* Mobile View All Button */}
      <Link
        href="/announcements"
        className="absolute bottom-4 right-4 px-4 py-2 bg-white border-2 border-black font-bold text-xs hover:bg-black hover:text-white transition-all z-20 shadow-neo-sm sm:hidden"
      >
        {l.viewAll} →
      </Link>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
