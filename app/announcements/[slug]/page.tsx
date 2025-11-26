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
      <div className="min-h-screen bg-neo-yellow py-20 flex items-center justify-center">
        <div className="bg-white border-4 border-black shadow-neo p-8 transform rotate-1 text-center">
          <h1 className="text-4xl font-black text-black mb-4">Duyuru Bulunamadı</h1>
          <p className="text-xl font-bold text-black mb-8">
            Aradığınız duyuru bulunamadı veya kaldırılmış olabilir.
          </p>
          <Link
            href="/"
            className="inline-block bg-black text-white px-6 py-3 border-4 border-transparent hover:bg-white hover:text-black hover:border-black hover:shadow-neo transition-all font-bold uppercase"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neo-blue py-20 border-b-4 border-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border-4 border-black shadow-neo-lg p-8 transform -rotate-1">
          {announcement.image && (
            <div className="mb-8 border-4 border-black shadow-neo">
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
              className={`px-4 py-1 text-sm font-black uppercase border-2 border-black shadow-neo-sm ${announcement.type === "event"
                ? "bg-neo-purple text-white"
                : announcement.type === "news"
                  ? "bg-neo-blue text-black"
                  : "bg-neo-green text-black"
                }`}
            >
              {announcement.type === "event"
                ? "Etkinlik"
                : announcement.type === "news"
                  ? "Duyuru"
                  : "Workshop"}
            </span>
            <time className="text-sm font-bold text-black bg-gray-100 px-2 py-1 border-2 border-black shadow-neo-sm">{announcement.date}</time>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-black mb-6 uppercase leading-tight">
            {announcement.title}
          </h1>

          <div className="prose prose-lg max-w-none mb-12">
            {announcement.content
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
                Etkinliğe Kayıt Ol
              </Link>
            </div>
          )}

          <div className="mt-12 border-t-4 border-black pt-8 flex justify-center">
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
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
