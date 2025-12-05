"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LoadingSpinner from "@/app/_components/LoadingSpinner";

interface Announcement {
  slug: string;
  title: string;
  date: string;
  description: string;
  type: "event" | "news" | "workshop";
  content: string;
  image?: string;
  imageOrientation?: "horizontal" | "vertical";
  isDraft: boolean;
  eventId?: string;
}

interface Event {
  _id: string;
  title: string;
}

export default function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [formData, setFormData] = useState<Announcement>({
    slug: "",
    title: "",
    date: "",
    description: "",
    type: "event",
    content: "",
    image: "",
    isDraft: false,
    eventId: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events?mode=admin');
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (error) {
        console.error('Etkinlikler yüklenirken hata:', error);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    async function loadAnnouncement() {
      try {
        const res = await fetch(`/api/announcements/${slug}`);
        if (!res.ok) throw new Error("Duyuru yüklenemedi");
        const data = await res.json();
        setFormData(data);
      } catch (error) {
        console.error("Duyuru yüklenirken hata:", error);
        alert("Duyuru yüklenirken bir hata oluştu");
        router.push("/admin");
      } finally {
        setIsLoading(false);
      }
    }

    loadAnnouncement();
  }, [slug, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Türkçe karakterleri İngilizce karakterlere dönüştür
      const turkishToEnglish: { [key: string]: string } = {
        ğ: "g",
        Ğ: "G",
        ü: "u",
        Ü: "U",
        ş: "s",
        Ş: "S",
        ı: "i",
        İ: "I",
        ö: "o",
        Ö: "O",
        ç: "c",
        Ç: "C",
      };

      // Başlıktan yeni slug oluştur
      const newSlug = formData.title
        .toLowerCase()
        .split("")
        .map((char) => turkishToEnglish[char] || char)
        .join("")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      // Yeni slug'ı formData'ya ekle
      const updatedData = { ...formData, slug: newSlug };

      const res = await fetch(`/api/announcements/${slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        throw new Error("Duyuru güncellenirken bir hata oluştu");
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error("Duyuru güncellenirken hata:", error);
      alert("Duyuru güncellenirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Yükleme başarısız');

      const data = await res.json();
      setFormData(prev => ({ ...prev, image: data.path }));
    } catch (error) {
      console.error('Görsel yükleme hatası:', error);
      alert('Görsel yüklenirken bir hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">Duyuru Düzenle</h1>
        <Link href="/admin" className="text-gray-600 hover:text-gray-800">
          Geri Dön
        </Link>
      </div>

      <div className="border-t border-gray-200">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Başlık
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700"
            >
              Tarih
            </label>
            <input
              type="text"
              name="date"
              id="date"
              required
              value={formData.date}
              onChange={handleChange}
              placeholder="örn: 1 Nisan 2024"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-400"
            />
          </div>

          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700"
            >
              Tür
            </label>
            <select
              name="type"
              id="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="event">Etkinlik</option>
              <option value="news">Haber</option>
              <option value="workshop">Atölye</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="eventId"
              className="block text-sm font-medium text-gray-700"
            >
              Etkinlik Seçimi (İsteğe Bağlı)
            </label>
            <select
              name="eventId"
              id="eventId"
              value={formData.eventId || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="">İlgili etkinlik seçiniz</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Kısa Açıklama
            </label>
            <input
              type="text"
              name="description"
              id="description"
              required
              maxLength={500}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
            />
            <div className={`text-xs text-right mt-1 ${formData.description.length >= 500 ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
              {formData.description.length} / 500
            </div>
          </div>

          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700"
            >
              Görsel Yükle (İsteğe Bağlı)
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {uploading && <span className="text-sm text-blue-500">Yükleniyor...</span>}
            </div>
            {formData.image && (
              <div className="mt-2">
                <p className="text-sm text-green-600 mb-1">Görsel yüklendi:</p>
                <Image src={formData.image} alt="Önizleme" width={300} height={200} className="h-32 w-auto object-cover rounded border border-gray-300" unoptimized />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                  className="mt-1 text-xs text-red-600 hover:text-red-800"
                >
                  Görseli Kaldır
                </button>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Görsel Yönü
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        id="orientation-horizontal"
                        name="imageOrientation"
                        type="radio"
                        value="horizontal"
                        checked={formData.imageOrientation === 'horizontal' || !formData.imageOrientation}
                        onChange={handleChange}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="orientation-horizontal" className="ml-2 block text-sm text-gray-700">
                        Yatay (5:4)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="orientation-vertical"
                        name="imageOrientation"
                        type="radio"
                        value="vertical"
                        checked={formData.imageOrientation === 'vertical'}
                        onChange={handleChange}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="orientation-vertical" className="ml-2 block text-sm text-gray-700">
                        Dikey (4:5)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
              İçerik
            </label>
            <textarea
              name="content"
              id="content"
              rows={10}
              required
              maxLength={10000}
              value={formData.content}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
            />
            <div className={`text-xs text-right mt-1 ${formData.content.length >= 10000 ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
              {formData.content.length} / 10000
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isDraft"
              id="isDraft"
              checked={formData.isDraft}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isDraft"
              className="ml-2 block text-sm text-gray-900"
            >
              Taslak olarak kaydet
            </label>
          </div>

          <div className="flex justify-end space-x-3">
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
