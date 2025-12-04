"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "../_context/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

interface Announcement {
  slug: string;
  title: string;
  titleEn?: string;
  date: string;
  description: string;
  descriptionEn?: string;
  type: "event" | "news" | "workshop";
  content: string;
  contentEn?: string;
  image?: string;
  isDraft: boolean;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef(null);
  const cardsRef = useRef(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const res = await fetch("/api/announcements");
        if (!res.ok) throw new Error("Duyurular alınamadı");
        const data = await res.json();
        const publishedAnnouncements = data.filter(
          (a: Announcement) => !a.isDraft
        );
        setAnnouncements(publishedAnnouncements);
      } catch (error) {
        console.error("Duyurular yüklenirken hata:", error);
      }
    }

    loadAnnouncements();
  }, []);

  const getTypeStyles = (type: Announcement["type"]) => {
    switch (type) {
      case "event":
        return "bg-neo-purple text-white border-2 border-black";
      case "news":
        return "bg-neo-blue text-black border-2 border-black";
      case "workshop":
        return "bg-neo-green text-black border-2 border-black";
    }
  };

  const getTypeText = (type: Announcement["type"]) => {
    const typeLabels = {
      tr: { event: "Etkinlik", news: "Duyuru", workshop: "Workshop" },
      en: { event: "Event", news: "News", workshop: "Workshop" }
    };
    return typeLabels[language][type];
  };

  const getTitle = (a: Announcement) => {
    if (language === 'en' && a.titleEn) return a.titleEn;
    return a.title;
  };

  const getDescription = (a: Announcement) => {
    if (language === 'en' && a.descriptionEn) return a.descriptionEn;
    return a.description;
  };

  const labels = {
    tr: {
      title: 'Duyurular',
      subtitle: 'En güncel etkinlik ve duyurularımızdan haberdar olun.',
      seeDetails: 'Detayları Gör',
      eventCalendar: 'Etkinlik Takvimi'
    },
    en: {
      title: 'Announcements',
      subtitle: 'Stay updated with our latest events and announcements.',
      seeDetails: 'See Details',
      eventCalendar: 'Event Calendar'
    }
  };

  const l = labels[language];

  return (
    <section
      ref={sectionRef}
      id="announcements"
      className="relative py-20 bg-neo-yellow border-b-4 border-black"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 ref={titleRef} className="inline-block text-4xl sm:text-5xl font-black text-black mb-6 bg-white border-4 border-black shadow-neo px-6 py-2 transform rotate-1">
            {l.title}
          </h2>
          <p className="text-xl font-bold text-black max-w-3xl mx-auto mt-2">
            {l.subtitle}
          </p>
        </div>

        <div ref={cardsRef} className="flex gap-8 overflow-x-auto overflow-y-hidden py-6 custom-scrollbar">
          {announcements.map((announcement, index) => (
            <a
              href={`/announcements/${announcement.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              key={index}
              className="announcement-card min-w-[320px] max-w-xs group bg-white border-4 border-black shadow-neo  p-4 flex flex-col
                        transform transition-all duration-200 hover:-translate-y-2 hover:shadow-neo-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-3 py-1 text-sm font-bold shadow-neo-sm ${getTypeStyles(
                    announcement.type
                  )}`}
                >
                  {getTypeText(announcement.type)}
                </span>
                <time className="text-sm font-bold text-black bg-gray-200 px-2 py-1 border-2 border-black shadow-neo-sm">
                  {announcement.date}
                </time>
              </div>

              <h3 className="text-xl font-black text-black mb-3 uppercase group-hover:text-neo-purple transition-colors">
                {getTitle(announcement)}
              </h3>

              <p className="text-black font-medium mb-4 line-clamp-3 border-t-2 border-black pt-2">
                {getDescription(announcement)}
              </p>

              <button className="mt-auto w-full py-2 bg-black text-white font-bold border-2 border-transparent hover:bg-white hover:text-black hover:border-black hover:shadow-neo transition-all">
                {l.seeDetails}
              </button>
            </a>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="/events"
            className="inline-flex items-center px-8 py-4 bg-neo-green text-black border-4 border-black shadow-neo text-lg font-black hover:bg-black hover:text-white hover:shadow-none transition-all uppercase tracking-wider transform hover:-translate-y-1"
          >
            <svg
              className="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {l.eventCalendar}
          </a>
        </div>
      </div>
    </section>
  );
}
