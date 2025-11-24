import Image from "next/image";
import Link from "next/link";
import connectDB from "@/app/lib/db";
import { Announcement } from "@/app/lib/models/Announcement";

import { Event } from "@/app/lib/models/Event";

async function getAnnouncementFromDB(slug: string) {
  try {
    await connectDB();
    const announcement = await Announcement.findOne({ slug, isDraft: false });
    if (!announcement) return null;
    return announcement;
  } catch (error) {
    console.error("Duyuru alınırken hata:", error);
    return null;
  }
}

async function getEventFromDB(eventId: string) {
  try {
    await connectDB();
    const event = await Event.findById(eventId);
    return event;
  } catch (error) {
    console.error("Etkinlik alınırken hata:", error);
    return null;
  }
}

export default async function AnnouncementPage({
  params,
}: {
  params: { slug: string };
}) {
  const announcement = await getAnnouncementFromDB(params.slug);
  let event = null;

  if (announcement?.eventId) {
    event = await getEventFromDB(announcement.eventId);
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-secondary-900 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Duyuru Bulunamadı</h1>
            <p className="mt-4 text-gray-400">
              Aradığınız duyuru bulunamadı veya kaldırılmış olabilir.
            </p>
            <Link
              href="/"
              className="mt-8 inline-block bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-900 py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-secondary-800/50 backdrop-blur-sm rounded-xl p-8">
          {announcement.image && (
            <div className="mb-8 overflow-hidden rounded-lg">
              <Image
                src={announcement.image}
                alt={announcement.title}
                width={800}
                height={400}
                className="w-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${announcement.type === "event"
                  ? "bg-purple-500/10 text-purple-400 ring-purple-500/30"
                  : announcement.type === "news"
                    ? "bg-blue-500/10 text-blue-400 ring-blue-500/30"
                    : "bg-green-500/10 text-green-400 ring-green-500/30"
                }`}
            >
              {announcement.type === "event"
                ? "Etkinlik"
                : announcement.type === "news"
                  ? "Duyuru"
                  : "Workshop"}
            </span>
            <time className="text-sm text-gray-400">{announcement.date}</time>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            {announcement.title}
          </h1>

          <div className="prose prose-invert max-w-none mb-8">
            {announcement.content
              .split("\n")
              .map((paragraph: string, index: number) => (
                <p key={index} className="text-gray-300 mb-4">
                  {paragraph}
                </p>
              ))}
          </div>

          {event && event.isOpen && (
            <div className="mt-8 flex justify-center">
              <Link
                href={`/events/${event._id}/register`}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Etkinliğe Kayıt Ol
              </Link>
            </div>
          )}

          <div className="mt-8 border-t border-gray-700 pt-8">
            <Link
              href="/"
              className="inline-flex items-center text-primary-400 hover:text-primary-300 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
