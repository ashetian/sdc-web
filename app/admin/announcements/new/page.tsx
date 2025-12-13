"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ContentBlockEditor, { ContentBlock } from "@/app/admin/_components/ContentBlockEditor";
import { Button } from '@/app/_components/ui';

interface Event {
  _id: string;
  title: string;
}

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    date: "",
    description: "",
    type: "event",
    content: "",
    image: "",
    imageOrientation: "vertical" as "horizontal" | "vertical",
    isDraft: false,
    eventId: "",
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events?mode=admin");
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (error) {
        console.error("Etkinlikler yüklenirken hata:", error);
      }
    };

    fetchEvents();
  }, []);

  const generateSlug = (text: string) =>
    text
      .toLocaleLowerCase("tr-TR")
      .replace(/[^a-z0-9çğıöşü\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const slug = formData.slug
        ? generateSlug(formData.slug)
        : generateSlug(formData.title);

      // Generate content from blocks for search/summary purposes (all types)
      const finalContent = contentBlocks
        .filter(block => block.type === "text" && block.content)
        .map(block => block.content)
        .join("\n\n") || formData.description || "";

      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          slug,
          content: finalContent,
          contentBlocks: contentBlocks,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Duyuru eklenirken bir hata oluştu");
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error("Duyuru eklenirken hata:", error);
      alert(error instanceof Error ? error.message : "Duyuru eklenirken bir hata oluştu");
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
    const uploadForm = new FormData();
    uploadForm.append("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm,
      });

      if (!res.ok) throw new Error("Yükleme başarısız");

      const data = await res.json();
      setFormData((prev) => ({ ...prev, image: data.path }));
    } catch (error) {
      console.error("Görsel yükleme hatası:", error);
      alert("Görsel yüklenirken bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border-4 border-black shadow-neo">
      <div className="px-6 py-5 flex justify-between items-center border-b-4 border-black">
        <h1 className="text-xl font-black text-black uppercase">
          Yeni Duyuru
        </h1>
        <Link href="/admin" className="text-gray-600 hover:text-gray-800 font-bold">
          Geri Dön
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-bold text-gray-700 mb-1"
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
            className="block w-full rounded border-2 border-black p-3 text-gray-900 bg-white focus:ring-2 focus:ring-neo-blue"
          />
        </div>

        <div>
          <label
            htmlFor="slug"
            className="block text-sm font-bold text-gray-700 mb-1"
          >
            Slug (isteğe bağlı)
          </label>
          <input
            type="text"
            name="slug"
            id="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="Otomatik oluşur veya elle yazabilirsiniz"
            className="block w-full rounded border-2 border-black p-3 text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-neo-blue"
          />
        </div>

        <div>
          <label
            htmlFor="date"
            className="block text-sm font-bold text-gray-700 mb-1"
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
            className="block w-full rounded border-2 border-black p-3 text-gray-900 bg-white placeholder:text-gray-400 focus:ring-2 focus:ring-neo-blue"
          />
        </div>

        <div>
          <label
            htmlFor="type"
            className="block text-sm font-bold text-gray-700 mb-1"
          >
            Tür
          </label>
          <select
            name="type"
            id="type"
            required
            value={formData.type}
            onChange={handleChange}
            className="block w-full rounded border-2 border-black p-3 text-gray-900 bg-white focus:ring-2 focus:ring-neo-blue"
          >
            <option value="event">Etkinlik</option>
            <option value="news">Haber</option>
            <option value="article">Makale</option>
            <option value="opportunity">Fırsat</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="eventId"
            className="block text-sm font-bold text-gray-700 mb-1"
          >
            Etkinlik Seçimi (İsteğe Bağlı)
          </label>
          <select
            name="eventId"
            id="eventId"
            value={formData.eventId}
            onChange={handleChange}
            className="block w-full rounded border-2 border-black p-3 text-gray-900 bg-white focus:ring-2 focus:ring-neo-blue"
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
            className="block text-sm font-bold text-gray-700 mb-1"
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
            className="block w-full rounded border-2 border-black p-3 text-gray-900 bg-white focus:ring-2 focus:ring-neo-blue"
          />
          <div
            className={`text-xs text-right mt-1 ${formData.description.length >= 500
              ? "text-red-600 font-bold"
              : "text-gray-500"
              }`}
          >
            {formData.description.length} / 500
          </div>
        </div>

        <div>
          <label
            htmlFor="image"
            className="block text-sm font-bold text-gray-700 mb-1"
          >
            Görsel Yükle (Dikey 4:5)
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:text-sm file:font-bold file:bg-neo-yellow file:text-black hover:file:bg-yellow-300"
            />
            {uploading && (
              <span className="text-sm text-blue-500 font-bold">Yükleniyor...</span>
            )}
          </div>
          {formData.image && (
            <div className="mt-3">
              <p className="text-sm text-green-600 mb-2 font-bold">Görsel yüklendi:</p>
              <Image
                src={formData.image}
                alt="Önizleme"
                width={300}
                height={200}
                className="h-32 w-auto object-cover border-2 border-black"
                unoptimized
              />
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                className="mt-2 text-xs text-red-600 hover:text-red-800 font-bold"
              >
                Görseli Kaldır
              </button>
            </div>
          )}
        </div>




        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            İçerik Editörü
          </label>
          <p className="text-xs text-gray-500 mb-4">
            Metin, Görsel (Dosya/URL), Video ve Kod blokları ekleyerek içeriğinizi oluşturun.
          </p>
          <ContentBlockEditor blocks={contentBlocks} onChange={setContentBlocks} />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isDraft"
            id="isDraft"
            checked={formData.isDraft}
            onChange={handleChange}
            className="h-4 w-4 border-2 border-black rounded"
          />
          <label
            htmlFor="isDraft"
            className="ml-2 block text-sm text-gray-900 font-bold"
          >
            Taslak olarak kaydet
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t-2 border-gray-200">
          <Link
            href="/admin"
            className="px-6 py-3 border-2 border-black font-bold text-black bg-gray-200 hover:bg-gray-300"
          >
            İptal
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            variant="success"
          >
            Kaydet
          </Button>
        </div>
      </form>
    </div>
  );
}
