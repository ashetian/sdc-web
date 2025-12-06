"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "../_context/LanguageContext";
import ImageLightbox from "./ImageLightbox";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";

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
  type: string;
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
  const [activeIndex, setActiveIndex] = useState(0);
  const { language } = useLanguage();
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const res = await fetch("/api/announcements?active=true");
        if (!res.ok) throw new Error("Duyurular alınamadı");

        const data = await res.json();

        if (Array.isArray(data)) {
          const activeAnnouncements = data
            .filter((a: Announcement) => !a.isDraft && !a.isArchived)
            .slice(0, 10);
          setAnnouncements(activeAnnouncements);
        } else {
          console.error("API response is not an array:", data);
        }
      } catch (error) {
        console.error("Duyurular yüklenirken hata:", error);
      }
    }
    loadAnnouncements();
  }, []);

  // Manual autoplay timer
  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(() => {
      if (swiperRef.current) {
        swiperRef.current.slideNext();
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  const getTypeStyles = (type: string) => {
    const normalizedType = type?.toLowerCase().trim() || 'news';
    switch (normalizedType) {
      case "event": return "bg-neo-purple text-white";
      case "news": return "bg-neo-blue text-black";
      case "workshop": return "bg-neo-green text-black";
      case "article": return "bg-neo-peach text-black";
      default: return "bg-neo-blue text-black";
    }
  };

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

  const goToSlide = (index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideToLoop(index);
    }
  };

  const goToPrev = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const goToNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  if (announcements.length === 0) {
    return (
      <section id="announcements" className="min-h-[60vh] bg-neo-green flex items-center justify-center border-b-4 border-black">
        <p className="text-2xl font-bold text-black">{l.noAnnouncements}</p>
      </section>
    );
  }

  return (
    <section
      id="announcements"
      className="relative min-h-[80vh] bg-neo-blue border-b-4 border-black overflow-hidden flex flex-col"
    >
      {/* Main Content Container */}
      <div className="flex-1 relative">
        <Swiper
          modules={[Autoplay, Navigation, Keyboard]}
          onSwiper={(swiper) => { swiperRef.current = swiper; swiper.autoplay.start(); }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          slidesPerView={1}
          spaceBetween={0}
          autoplay={{
            delay: 7000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          keyboard={{ enabled: true }}
          loop={announcements.length > 1}
          speed={600}
          className="h-full min-h-[60vh]"
        >
          {announcements.map((current, idx) => (
            <SwiperSlide key={current.slug || idx}>
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center py-8 min-h-[60vh]">
                <div className={`flex flex-col md:flex-row items-center gap-12 ${current.image ? 'w-full' : 'max-w-4xl'}`}>
                  {current.image && (
                    <div className="flex-shrink-0 w-full md:w-auto">
                      <div className="relative aspect-[4/5] max-h-[65vh] w-auto md:w-[55vh] border-4 border-black shadow-neo overflow-hidden mx-auto md:mx-0">
                        <ImageLightbox
                          src={current.image}
                          alt={getText(current.title, current.titleEn, '')}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex-1 flex flex-col items-start text-left">
                    <span className={`inline-block px-4 py-1 mb-4 text-sm font-black uppercase border-2 border-black ${getTypeStyles(current.type)}`}>
                      {getTypeText(current.type)}
                    </span>
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
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Buttons */}
        {announcements.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 w-12 h-12 bg-white border-4 border-black shadow-neo items-center justify-center hover:bg-black hover:text-white transition-colors z-10 hidden sm:flex"
              style={{ transform: 'translateY(-50%)' }}
              aria-label="Previous announcement"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 w-12 h-12 bg-white border-4 border-black shadow-neo items-center justify-center hover:bg-black hover:text-white transition-colors z-10 hidden sm:flex"
              style={{ transform: 'translateY(-50%)' }}
              aria-label="Next announcement"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Bottom Controls Container */}
      <div className="relative py-2 flex flex-col items-center gap-4 z-10">
        {/* Dot Indicators */}
        {announcements.length > 1 && (
          <div className="flex gap-3">
            {announcements.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`w-3 h-3 border-2 border-black transition-all ${idx === activeIndex ? 'bg-neo-green scale-125' : 'bg-white hover:bg-gray-300'
                  }`}
                aria-label={`Go to announcement ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* View All Button */}
        <Link
          href="/announcements"
          className="px-6 py-2 bg-white border-2 border-black font-bold text-sm hover:bg-black hover:text-white transition-all shadow-neo-sm"
        >
          {l.viewAll} →
        </Link>

        {/* Progress Bar */}
        {announcements.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div
              key={activeIndex}
              className="h-full bg-black"
              style={{
                animation: `progress 7s linear forwards`,
                width: '0%'
              }}
            />
          </div>
        )}
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
