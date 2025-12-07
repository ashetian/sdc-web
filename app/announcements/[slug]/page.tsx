"use client";
import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../../_context/LanguageContext";
import ShareButtons from "../../_components/ShareButtons";
import ImageLightbox from "../../_components/ImageLightbox";
import CommentSection from "../../_components/CommentSection";
import BookmarkButton from "../../_components/BookmarkButton";
import LikeButton from "../../_components/LikeButton";

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
  image?: string;
  isDraft: boolean;
  eventId?: string;
}

interface Event {
  _id: string;
  title: string;
  isOpen: boolean;
}

export default function AnnouncementPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  const labels = {
    tr: {
      notFound: 'Duyuru Bulunamadı',
      notFoundDesc: 'Aradığınız duyuru bulunamadı veya kaldırılmış olabilir.',
      backHome: 'Ana Sayfaya Dön',
      event: 'Etkinlik',
      news: 'Duyuru',
      workshop: 'Workshop',
      registerEvent: 'Etkinliğe Kaydol'
    },
    en: {
      notFound: 'Announcement Not Found',
      notFoundDesc: 'The announcement you are looking for could not be found or has been removed.',
      backHome: 'Back to Home',
      event: 'Event',
      news: 'Announcement',
      workshop: 'Workshop',
      registerEvent: 'Register for Event'
    }
  };

  const l = labels[language];

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/announcements/${slug}`);
        if (!res.ok) throw new Error("Duyuru yüklenemedi");
        const data = await res.json();
        if (data.isDraft) {
          setAnnouncement(null);
        } else {
          setAnnouncement(data);
          // Load event if exists
          if (data.eventId) {
            const eventRes = await fetch(`/api/events/${data.eventId}`);
            if (eventRes.ok) {
              setEvent(await eventRes.json());
            }
          }
        }
      } catch (error) {
        console.error("Duyuru yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug]);

  const getTitle = () => {
    if (!announcement) return '';
    if (language === 'en' && announcement.titleEn) return announcement.titleEn;
    return announcement.title;
  };

  const getContent = () => {
    if (!announcement) return '';
    if (language === 'en' && announcement.contentEn) return announcement.contentEn;
    return announcement.content;
  };

  const getDescription = () => {
    if (!announcement) return '';
    if (language === 'en' && announcement.descriptionEn) return announcement.descriptionEn;
    return announcement.description;
  };

  const getTypeLabel = (type: "event" | "news" | "workshop") => {
    return l[type];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neo-yellow py-20 flex items-center justify-center">
        <div className="bg-white border-4 border-black shadow-neo px-8 py-6">
          <div className="animate-pulse text-xl font-black">...</div>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-neo-yellow py-20 flex items-center justify-center">
        <div className="bg-white border-4 border-black shadow-neo p-8 transform rotate-1 text-center">
          <h1 className="text-4xl font-black text-black mb-4">{l.notFound}</h1>
          <p className="text-xl font-bold text-black mb-8">
            {l.notFoundDesc}
          </p>
          <Link
            href="/"
            className="inline-block bg-black text-white px-6 py-3 border-4 border-transparent hover:bg-white hover:text-black hover:border-black hover:shadow-neo transition-all font-bold uppercase"
          >
            {l.backHome}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-neo-yellow py-20 pt-40 border-b-4 border-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border-4 border-black shadow-neo-lg p-8 transform -rotate-1">
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span
                className={`px-4 py-1 text-sm font-black uppercase border-2 border-black shadow-neo-sm ${announcement.type === "event"
                  ? "bg-neo-purple text-white"
                  : announcement.type === "news"
                    ? "bg-neo-blue text-black"
                    : "bg-neo-green text-black"
                  }`}
              >
                {getTypeLabel(announcement.type)}
              </span>
              <time className="text-sm font-bold text-black bg-gray-100 px-3 py-1 border-2 border-black shadow-neo-sm">{language === 'en' && announcement.dateEn ? announcement.dateEn : announcement.date}</time>
              <div className="flex items-center gap-2 ml-auto">
                <LikeButton contentType="announcement" contentId={announcement._id} />
                <BookmarkButton contentType="announcement" contentId={announcement._id} />
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-black mb-6 uppercase leading-tight">
              {getTitle()}
            </h1>
          </div>

          <div className="prose prose-lg max-w-none mb-12 clearfix">
            {announcement.image && (
              <div className="float-left mr-6 mb-4 border-4 border-black shadow-neo w-full sm:w-64">
                <ImageLightbox
                  src={announcement.image}
                  alt={getTitle()}
                  width={256}
                  height={256}
                  className="w-full object-cover"
                />
              </div>
            )}

            {getContent()
              .split("\n")
              .map((paragraph: string, index: number) => (
                <p key={index} className="text-black font-medium mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
          </div>

          {event && event.isOpen && (
            <div className="mt-8 flex justify-center">
              <Link
                href={`/events/${event._id}/register`}
                className="inline-flex items-center px-8 py-4 border-4 border-black shadow-neo text-xl font-black text-white bg-neo-green hover:bg-white hover:text-black hover:shadow-none transition-all uppercase tracking-wider transform hover:-translate-y-1"
              >
                {l.registerEvent}
              </Link>
            </div>
          )}

          {/* Share Buttons */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200">
            <ShareButtons
              url={typeof window !== 'undefined' ? window.location.href : `https://ktusdc.com/announcements/${slug}`}
              title={getTitle()}
              description={getDescription()}
            />
          </div>

          <div className="mt-8 border-t-4 border-black pt-8 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center text-black font-black uppercase hover:underline decoration-4 decoration-neo-purple underline-offset-4 transition-all"
            >
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={4}
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {l.backHome}
            </Link>
          </div>
        </div>

        {/* Comments Section - Outside main content for visual separation */}
        <CommentSection contentType="announcement" contentId={announcement._id} />
      </div>
    </article>
  );
}
