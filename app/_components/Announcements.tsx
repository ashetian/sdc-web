"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Announcement {
  slug: string;
  title: string;
  date: string;
  description: string;
  type: "event" | "news" | "workshop";
  content: string;
  image?: string;
  isDraft: boolean;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef(null);
  const cardsRef = useRef(null);

  useGSAP(() => {
    if (announcements.length > 0) {
      gsap.from(titleRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        y: 50,
        duration: 0.8,
        ease: "power2.out",
      });

      gsap.from(".announcement-card", {
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 80%",
        },
        y: 100,
        duration: 0.6,
        stagger: 0.2,
        ease: "back.out(1.7)",
      });
    }
  }, { scope: sectionRef, dependencies: [announcements] });

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
    switch (type) {
      case "event":
        return "Etkinlik";
      case "news":
        return "Duyuru";
      case "workshop":
        return "Workshop";
    }
  };

  return (
    <section
      ref={sectionRef}
      id="announcements"
      className="relative py-20 bg-neo-yellow border-b-4 border-black"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 ref={titleRef} className="inline-block text-4xl sm:text-5xl font-black text-black mb-6 bg-white border-4 border-black shadow-neo px-6 py-2 transform rotate-1">
            Duyurular
          </h2>
          <p className="text-xl font-bold text-black max-w-3xl mx-auto mt-4">
            En güncel etkinlik ve duyurularımızdan haberdar olun.
          </p>
        </div>

        <div ref={cardsRef} className="flex gap-8 overflow-x-auto pb-8 custom-scrollbar">
          {announcements.map((announcement, index) => (
            <a
              href={`/announcements/${announcement.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              key={index}
              className="announcement-card min-w-[320px] max-w-xs group bg-white border-4 border-black shadow-neo p-4 flex flex-col
                        transform transition-all duration-200 hover:-translate-y-2 hover:shadow-neo-lg"
            >
              {announcement.image && (
                <div className="mb-4 overflow-hidden border-2 border-black shadow-neo-sm">
                  <Image
                    src={announcement.image}
                    alt={announcement.title}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover transform transition-transform group-hover:scale-110"
                  />
                </div>
              )}
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
                {announcement.title}
              </h3>

              <p className="text-black font-medium mb-4 line-clamp-3 border-t-2 border-black pt-2">
                {announcement.description}
              </p>

              <button className="mt-auto w-full py-2 bg-black text-white font-bold border-2 border-transparent hover:bg-white hover:text-black hover:border-black hover:shadow-neo transition-all">
                Detayları Gör
              </button>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
