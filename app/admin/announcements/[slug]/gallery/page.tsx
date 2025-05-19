"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Announcement {
  slug: string;
  title: string;
  date: string;
  description: string;
  type: "event" | "news" | "workshop";
  content: string;
  image?: string;
  galleryLinks?: string[];
  galleryCover?: string;
  isInGallery?: boolean;
}

export default function GalleryEditPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [galleryLinks, setGalleryLinks] = useState<string[]>([""]);
  const [galleryCover, setGalleryCover] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchAnnouncement() {
      const res = await fetch(`/api/announcements/${params.slug}`);
      if (res.ok) {
        const data = await res.json();
        setAnnouncement(data);
        setGalleryLinks(data.galleryLinks && data.galleryLinks.length > 0 ? data.galleryLinks : [""]);
        setGalleryCover(data.galleryCover || data.image || "");
      }
    }
    fetchAnnouncement();
  }, [params.slug]);

  const handleGalleryLinkChange = (index: number, value: string) => {
    setGalleryLinks((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addGalleryLink = () => {
    setGalleryLinks((prev) => [...prev, ""]);
  };

  const removeGalleryLink = (index: number) => {
    setGalleryLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/announcements/${params.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...announcement,
          galleryLinks: galleryLinks.filter((l) => l.trim() !== ""),
          galleryCover,
          isInGallery: true,
        }),
      });
      if (!res.ok) throw new Error("Galeri güncellenemedi");
      router.push("/admin");
      router.refresh();
    } catch {
      alert("Galeri güncellenirken hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!announcement) {
    return <div className="p-8">Yükleniyor...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg max-w-2xl mx-auto mt-8">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">Galeriye Ekle/Düzenle</h1>
        <Link href="/admin" className="text-gray-600 hover:text-gray-800">Geri Dön</Link>
      </div>
      <div className="border-t border-gray-200">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Kapak Görseli (URL)</label>
            <input
              type="text"
              value={galleryCover}
              onChange={(e) => setGalleryCover(e.target.value)}
              placeholder="Kapak görseli linki veya duyuru görseli"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-400"
            />
            {galleryCover && (
              <div className="mt-2">
                <Image src={galleryCover} alt="Kapak Görseli" width={300} height={200} className="rounded-lg" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cloudinary Görsel/Video Linkleri</label>
            {galleryLinks.map((link, idx) => (
              <div key={idx} className="flex items-center space-x-2 mt-1">
                <input
                  type="text"
                  value={link}
                  onChange={(e) => handleGalleryLinkChange(idx, e.target.value)}
                  placeholder="Cloudinary görsel veya video linki"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
                />
                {galleryLinks.length > 1 && (
                  <button type="button" onClick={() => removeGalleryLink(idx)} className="text-red-500">Sil</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addGalleryLink} className="mt-2 text-blue-600 hover:underline">+ Link Ekle</button>
          </div>
          <div className="flex justify-end space-x-3">
            <Link href="/admin" className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">İptal</Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 