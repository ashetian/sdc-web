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
  return data.filter((a) => a.isInGallery).slice(0, 6); // Son 6 galeri etkinliği
}

export default async function GalleryPreview() {
  const announcements = await getGalleryAnnouncements();

  if (announcements.length === 0) return null;

  return (
    <section className="py-12 bg-secondary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Galeri</h2>
          <Link href="/gallery" className="text-blue-400 hover:underline text-sm font-medium">Tümünü Gör</Link>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-2">
          {announcements.map((a) => (
            <Link key={a.slug} href={`/gallery/${a.slug}`} className="min-w-[320px] max-w-xs bg-secondary-800/50 rounded-xl shadow p-4 flex flex-col hover:ring-2 hover:ring-primary-400 transition-all">
              {a.galleryCover && (
                <div className="mb-3 overflow-hidden rounded-lg">
                  <Image src={a.galleryCover} alt={a.title} width={320} height={180} className="w-full h-40 object-cover" />
                </div>
              )}
              <div className="flex items-center justify-between mb-1">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400 ring-1 ring-inset ring-primary-500/30">
                  {a.type === "event" ? "Etkinlik" : a.type === "news" ? "Duyuru" : "Workshop"}
                </span>
                <time className="text-xs text-gray-400">{a.date}</time>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">{a.title}</h3>
              <p className="text-gray-300 text-sm mb-2 line-clamp-2">{a.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 