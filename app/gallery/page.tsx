import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

interface Announcement {
  slug: string;
  title: string;
  date: string;
  description: string;
  type: "event" | "news" | "workshop";
  galleryLinks?: string[];
  galleryCover?: string;
}

async function getGalleryAnnouncements(): Promise<Announcement[]> {
  const headersList = headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;
  const res = await fetch(`${baseUrl}/api/announcements`, { cache: "no-store" });
  if (!res.ok) return [];
  const data: Announcement[] = await res.json();
  return data.filter((a) => a.isInGallery);
}

export default async function GalleryPage() {
  const announcements = await getGalleryAnnouncements();

  return (
    <section className="py-16 bg-gradient-to-b from-secondary-900 to-secondary-800 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8 text-center">Galeri / Arşiv</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {announcements.length === 0 && (
            <div className="col-span-full text-center text-gray-400">Henüz galeriye eklenmiş etkinlik yok.</div>
          )}
          {announcements.map((a) => (
            <Link key={a.slug} href={`/gallery/${a.slug}`} className="bg-secondary-800/50 rounded-xl shadow p-6 flex flex-col hover:ring-2 hover:ring-primary-400 transition-all">
              {a.galleryCover && (
                <div className="mb-4 overflow-hidden rounded-lg">
                  <Image src={a.galleryCover} alt={a.title} width={400} height={250} className="w-full h-48 object-cover" />
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400 ring-1 ring-inset ring-primary-500/30">
                  {a.type === "event" ? "Etkinlik" : a.type === "news" ? "Duyuru" : "Workshop"}
                </span>
                <time className="text-xs text-gray-400">{a.date}</time>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{a.title}</h3>
              <p className="text-gray-300 mb-4 line-clamp-3">{a.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 