"use client";
import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "../_context/LanguageContext";
import ImageLightbox from "./ImageLightbox";
import { useAnnouncements } from "../lib/swr";
import { NavButton } from "./ui";
import type { Announcement } from "../lib/types/api";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";

export default function Announcements({ initialData }: { initialData?: Announcement[] }) {
  const { data, isLoading } = useAnnouncements({ fallbackData: initialData });
  const [activeTab, setActiveTab] = useState<'announcements' | 'opportunities'>('announcements');
  const [activeIndex, setActiveIndex] = useState(0);
  const { language, t } = useLanguage();
  const swiperRef = useRef<SwiperType | null>(null);

  // Filter active announcements from API data
  const allAnnouncements = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return (data as Announcement[]).filter((a) => !a.isDraft && !a.isArchived);
  }, [data]);

  // Filter announcements based on active tab
  const filteredAnnouncements = allAnnouncements.filter(item => {
    if (activeTab === 'announcements') {
      // Include 'workshop' here as it was in original code, plus standard types
      return ['event', 'news', 'article', 'workshop'].includes(item.type);
    } else {
      return item.type === 'opportunity';
    }
  }).slice(0, 10); // Still limit to 10 most recent of that type

  // Manual autoplay timer removed in favor of Swiper's native data-swiper-autoplay

  const getTypeStyles = (type: string) => {
    const normalizedType = type?.toLowerCase().trim() || 'news';
    switch (normalizedType) {
      case "event": return "bg-neo-purple text-white";
      case "news": return "bg-neo-blue text-black";
      case "workshop": return "bg-neo-green text-black";
      case "article": return "bg-neo-peach text-black";
      case "opportunity": return "bg-neo-lime text-black";
      default: return "bg-neo-blue text-black";
    }
  };

  const getTypeText = (type: string) => {
    const normalizedType = type?.toLowerCase().trim() || 'news';
    // Use i18n keys for types
    // Using explicit mapping because dictionary might not have all or exact match might be needed
    // Assuming announcements.types.[type] exists
    return t(`announcements.types.${normalizedType}` as any) || normalizedType;
  };

  const getText = (tr: string | undefined, en: string | undefined, fallback: string) => {
    if (language === 'en' && en) return en;
    return tr || fallback;
  };

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

  return (
    <section
      id="announcements"
      className="relative min-h-[80vh] bg-neo-blue border-b-4 border-black overflow-hidden flex flex-col items-center"
    >
      {/* Tab Toggle - Placed prominently at the top */}
      <div className="z-20 flex items-center justify-center gap-4 mt-8 w-full max-w-md px-4 absolute top-0">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex-1 px-4 py-2 font-black uppercase transition-all border-4 text-xs sm:text-sm ${activeTab === 'announcements'
            ? 'bg-neo-purple text-black border-black shadow-neo transform -translate-y-1'
            : 'bg-white text-gray-500 border-gray-300 hover:border-black hover:text-black'
            }`}
        >
          {t('announcements.tabs.announcements')}
        </button>
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`flex-1 px-4 py-2 font-black uppercase transition-all border-4 text-xs sm:text-sm ${activeTab === 'opportunities'
            ? 'bg-neo-lime text-black border-black shadow-neo transform -translate-y-1'
            : 'bg-white text-gray-500 border-gray-300 hover:border-black hover:text-black'
            }`}
        >
          {t('announcements.tabs.opportunities')}
        </button>
      </div>

      {filteredAnnouncements.length === 0 ? (
        <div className="flex-1 flex items-center justify-center w-full">
          <p className="text-2xl font-bold text-black bg-white p-6 border-4 border-black shadow-neo">{t('announcements.noAnnouncements')}</p>
        </div>
      ) : (
        /* Main Content Container */
        <div className="flex-1 relative w-full mt-20">

          {/* ANNOUNCEMENTS: SWIPER VIEW */}
          {activeTab === 'announcements' && (
            <Swiper
              modules={[Autoplay, Navigation, Keyboard]}
              onSwiper={(swiper) => { swiperRef.current = swiper; swiper.autoplay.start(); }}
              onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
              slidesPerView={1}
              spaceBetween={0}
              autoplay={{
                delay: 15000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              keyboard={{ enabled: true }}
              loop={filteredAnnouncements.length > 1}
              speed={600}
              className="h-full min-h-[60vh]"
            >
              {filteredAnnouncements.map((current, idx) => (
                <SwiperSlide key={current.slug || idx} data-swiper-autoplay={idx === 0 ? "15000" : "7000"}>
                  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center py-4 sm:py-8 min-h-[50vh] sm:min-h-[60vh]">
                    <div className={`flex flex-col md:flex-row items-center gap-6 sm:gap-12 ${current.image ? 'w-full' : 'max-w-4xl'}`}>
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
                            {t('announcements.viewDetails')}
                          </Link>
                          {current.eventId && (
                            <Link
                              href={`/events/${current.eventId}/register`}
                              className="px-8 py-4 bg-neo-green text-black font-black uppercase border-4 border-black hover:shadow-neo transition-all"
                              lang={language}
                            >
                              {t('events.register')}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          {/* OPPORTUNITIES: GRID VIEW */}
          {activeTab === 'opportunities' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAnnouncements.map((current) => (
                  <Link
                    key={current.slug}
                    href={`/announcements/${current.slug}`}
                    className="group bg-white border-4 border-black shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all flex flex-col h-full"
                  >
                    {current.image && (
                      <div className="relative aspect-video border-b-4 border-black overflow-hidden flex-shrink-0">
                        <ImageLightbox
                          src={current.image}
                          alt={getText(current.title, current.titleEn, '')}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 text-xs font-bold uppercase border-2 border-black ${getTypeStyles(current.type)}`}>
                          {getTypeText(current.type)}
                        </span>
                        <time className="text-xs font-bold text-gray-600">
                          {getText(current.date, current.dateEn, '')}
                        </time>
                      </div>
                      <h3 className="text-xl font-black text-black uppercase mb-3 line-clamp-2 group-hover:text-neo-purple transition-colors" lang={language}>
                        {getText(current.title, current.titleEn, '')}
                      </h3>
                      <p className="text-sm text-gray-700 line-clamp-3 mb-4 flex-1">
                        {getText(current.description, current.descriptionEn, '')}
                      </p>
                      <div className="mt-auto pt-2">
                        <span className="inline-block text-xs font-black text-neo-purple hover:underline">
                          {t('announcements.details')}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}


          {/* Navigation Buttons - Only for Announcements Swiper */}
          {activeTab === 'announcements' && filteredAnnouncements.length > 1 && (
            <>
              <NavButton
                direction="left"
                onClick={goToPrev}
                aria-label="Previous announcement"
                className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2"
              />
              <NavButton
                direction="right"
                onClick={goToNext}
                aria-label="Next announcement"
                className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2"
              />
            </>
          )}
        </div>
      )}

      {/* Bottom Controls Container */}
      <div className="relative py-2 flex flex-col items-center gap-4 z-10">
        {/* Dot Indicators - Only for Announcements Swiper */}
        {activeTab === 'announcements' && filteredAnnouncements.length > 1 && (
          <div className="flex gap-3">
            {filteredAnnouncements.map((_, idx) => (
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
          {t('announcements.viewAll')} →
        </Link>
      </div>

      {/* Progress Bar - Full Width Positioned Absolute to Section */}
      {filteredAnnouncements.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 z-0">
          <div
            key={activeIndex}
            className="h-full bg-black"
            style={{
              animation: `progress ${activeIndex === 0 ? '15s' : '7s'} linear forwards`,
              width: '0%'
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
