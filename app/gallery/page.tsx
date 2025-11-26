"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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

export default function GalleryPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGallery() {
      try {
        const res = await fetch("/api/announcements");
        if (!res.ok) throw new Error("Galeri yüklenemedi");
        const data: Announcement[] = await res.json();
        setAnnouncements(data.filter((a) => a.isInGallery));
      } catch (error) {
        console.error("Galeri yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    }

    loadGallery();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neo-purple">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
      </div>
    );
  }

  return (
    <section className="py-20 pt-40 bg-neo-purple min-h-screen border-b-4 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="inline-block text-4xl sm:text-6xl font-black text-black mb-6 bg-white border-4 border-black shadow-neo px-8 py-4 transform -rotate-1">
            Galeri / Arşiv
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {announcements.length === 0 && (
            <div className="col-span-full text-center">
              <div className="inline-block bg-white border-4 border-black shadow-neo p-8 transform rotate-1">
                <p className="text-2xl font-black text-black">Henüz galeriye eklenmiş etkinlik yok.</p>
              </div>
            </div>
          )}
          {announcements.map((a, index) => (
            <Link
              key={a.slug}
              href={`/gallery/${a.slug}`}
              className={`bg-white border-4 border-black shadow-neo flex flex-col transform transition-all duration-200 hover:-translate-y-2 hover:shadow-neo-lg
                ${index % 3 === 0 ? 'rotate-1' : index % 3 === 1 ? '-rotate-1' : 'rotate-0'}
              `}
            >
              {a.galleryCover && (
                <div className="mb-4 overflow-hidden border-b-4 border-black">
                  <Image src={a.galleryCover} alt={a.title} width={400} height={250} className="w-full h-56 object-cover" />
                </div>
              )}
              <div className="p-6 pt-2 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 text-sm font-bold border-2 border-black shadow-neo-sm
                      ${a.type === "event" ? "bg-neo-purple text-white" :
                        a.type === "news" ? "bg-neo-blue text-black" :
                          "bg-neo-green text-black"}
                    `}
                  >
                    {a.type === "event" ? "Etkinlik" : a.type === "news" ? "Duyuru" : "Workshop"}
                  </span>
                  <time className="text-sm font-bold text-black bg-gray-100 px-2 py-1 border-2 border-black shadow-neo-sm">{a.date}</time>
                </div>
                <h3 className="text-2xl font-black text-black mb-3 uppercase leading-tight">{a.title}</h3>
                <p className="text-black font-medium mb-4 line-clamp-3 border-l-4 border-black pl-3">{a.galleryDescription || a.description}</p>
                <div className="mt-auto pt-4 border-t-4 border-black">
                  <span className="inline-block w-full text-center py-2 bg-black text-white font-bold uppercase hover:bg-white hover:text-black hover:border-2 hover:border-black transition-all">
                    İncele
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 