"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import GlobalLoading from '@/app/_components/GlobalLoading';

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
  galleryDescription?: string;
  galleryDescriptionEn?: string;
}

function isImage(url: string) {
  return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || url.includes("image/upload");
}

function isVideo(url: string) {
  return url.match(/\.(mp4|webm|mov)$/i) || url.includes("video/upload");
}

export default function GalleryEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [galleryLinks, setGalleryLinks] = useState<string[]>([]);
  const [galleryCover, setGalleryCover] = useState<string>("");
  const [galleryDescription, setGalleryDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  useEffect(() => {
    async function fetchAnnouncement() {
      const res = await fetch(`/api/announcements/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setAnnouncement(data);
        setGalleryLinks(data.galleryLinks || []);
        setGalleryCover(data.galleryCover || data.image || "");
        setGalleryDescription(data.galleryDescription || "");
      }
    }
    fetchAnnouncement();
  }, [slug]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'gallery');
    formData.append('gallerySlug', slug);

    setUploadingCover(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Yükleme başarısız');
      }

      const data = await res.json();
      setGalleryCover(data.path);
    } catch (error) {
      console.error('Kapak görseli yükleme hatası:', error);
      alert(error instanceof Error ? error.message : 'Görsel yüklenirken bir hata oluştu.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const files = Array.from(e.target.files);
    setUploadingMedia(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'gallery');
        formData.append('gallerySlug', slug);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Yükleme başarısız');
        }

        const data = await res.json();
        return data.path;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setGalleryLinks(prev => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error('Medya yükleme hatası:', error);
      alert(error instanceof Error ? error.message : 'Dosya yüklenirken bir hata oluştu.');
    } finally {
      setUploadingMedia(false);
      // Reset input
      e.target.value = '';
    }
  };

  const removeGalleryLink = (index: number) => {
    setGalleryLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/announcements/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...announcement,
          galleryLinks: galleryLinks.filter((l) => l.trim() !== ""),
          galleryCover,
          isInGallery: true,
          galleryDescription,
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
    return (
      <div className="flex justify-center items-center p-8">
        <GlobalLoading />
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg max-w-2xl mx-auto mt-8">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">
          Galeriye Ekle/Düzenle
        </h1>
        <Link href="/admin" className="text-gray-600 hover:text-gray-800">
          Geri Dön
        </Link>
      </div>
      <div className="border-t border-gray-200">
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Kapak Görseli */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kapak Görseli
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleCoverUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploadingCover && <span className="text-sm text-blue-500">Yükleniyor...</span>}
            </div>
            {galleryCover && (
              <div className="mt-3 relative inline-block">
                <Image
                  src={galleryCover}
                  alt="Kapak Görseli"
                  width={300}
                  height={200}
                  className="rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setGalleryCover("")}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Galeri Açıklaması */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Galeriye Özel Açıklama
            </label>
            <textarea
              value={galleryDescription}
              onChange={(e) => setGalleryDescription(e.target.value)}
              placeholder="Bu açıklama sadece galeri sayfasında görünür. İngilizce çeviri otomatik yapılacaktır."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-400"
              rows={3}
            />
            <p className="mt-1 text-xs text-gray-500">İngilizce çeviri otomatik olarak DeepL ile yapılacaktır.</p>
          </div>

          {/* Galeri Medyaları */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Galeri Görselleri ve Videoları
            </label>
            <div className="mb-4">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                multiple
                onChange={handleMediaUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                Resim (JPEG, PNG, WEBP, GIF) veya Video (MP4, WEBM, MOV) yükleyebilirsiniz. Birden fazla dosya seçebilirsiniz.
              </p>
              {uploadingMedia && (
                <span className="text-sm text-blue-500 mt-2 block">Dosyalar yükleniyor...</span>
              )}
            </div>

            {/* Yüklenen Medyalar */}
            {galleryLinks.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {galleryLinks.map((link, idx) => (
                  <div key={idx} className="relative group">
                    {isImage(link) ? (
                      <Image
                        src={link}
                        alt={`Galeri görseli ${idx + 1}`}
                        width={200}
                        height={150}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                    ) : isVideo(link) ? (
                      <video
                        src={link}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300 bg-black"
                      />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300">
                        <span className="text-xs text-gray-500 p-2 text-center break-all">{link}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeGalleryLink(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    {isVideo(link) && (
                      <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                        Video
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {galleryLinks.length === 0 && (
              <p className="text-sm text-gray-500 italic">Henüz medya eklenmedi.</p>
            )}
          </div>

          {/* Butonlar */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Link
              href="/admin"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              İptal
            </Link>
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
