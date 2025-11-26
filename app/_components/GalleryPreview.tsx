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
  isInGallery?: boolean;
  galleryDescription?: string;
}

async function getGalleryAnnouncements(): Promise<Announcement[]> {
  const headersList = headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;
  const res = await fetch(`${baseUrl}/api/announcements`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data: Announcement[] = await res.json();
  return data.filter((a) => a.isInGallery).slice(0, 15); // Son 15 galeri etkinliği
}

export default async function GalleryPreview() {
  const announcements = await getGalleryAnnouncements();

  if (announcements.length === 0) return null;

  return (
    <section
      className="py-20 bg-neo-purple border-b-4 border-black scroll-mt-20"
      id="gallery-preview"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="inline-block text-4xl sm:text-5xl font-black text-black mb-4 bg-white border-4 border-black shadow-neo px-6 py-2 transform -rotate-1">
            Galeri
          </h2>
          <div className="mt-4">
            <Link
              href="/gallery"
              className="inline-block px-6 py-2 bg-black text-white font-bold border-2 border-transparent hover:bg-white hover:text-black hover:border-black hover:shadow-neo transition-all"
            >
              Tümünü Gör
            </Link>
          </div>
        </div>
        <div className="flex gap-8 overflow-x-auto pb-8 custom-scrollbar">
          {announcements.map((a) => (
            <Link
              key={a.slug}
              href={`/gallery/${a.slug}`}
              className="min-w-[320px] max-w-xs bg-white border-4 border-black shadow-neo p-4 flex flex-col hover:-translate-y-2 hover:shadow-neo-lg transition-all"
            >
              {a.galleryCover && (
                <div className="mb-3 overflow-hidden border-2 border-black shadow-neo-sm">
                  <Image
                    src={a.galleryCover}
                    alt={a.title}
                    width={320}
                    height={180}
                    className="w-full h-40 object-cover"
                  />
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`px-2 py-0.5 text-xs font-bold border-2 border-black shadow-neo-sm
                    ${a.type === "event"
                      ? "bg-neo-purple text-white"
                      : a.type === "news"
                        ? "bg-neo-blue text-black"
                        : "bg-neo-green text-black"
                    }
                  `}
                >
                  {a.type === "event"
                    ? "Etkinlik"
                    : a.type === "news"
                      ? "Duyuru"
                      : "Workshop"}
                </span>
                <time className="text-xs font-bold text-black bg-gray-100 px-2 py-0.5 border-2 border-black shadow-neo-sm">{a.date}</time>
              </div>
              <h3 className="text-lg font-black text-black mb-1 line-clamp-1 uppercase">
                {a.title}
              </h3>
              <p className="text-black font-medium text-sm mb-2 line-clamp-2 border-t-2 border-black pt-2">
                {a.galleryDescription || a.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
