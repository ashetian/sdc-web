"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    date: "",
    description: "",
    type: "event",
    content: "",
    image: "",
    isDraft: false,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Resim yüklenemedi");

      const data = await res.json();
      setSelectedImage(data.path);
      setFormData((prev) => ({ ...prev, image: data.path }));
    } catch (error) {
      console.error("Resim yüklenirken hata:", error);
      alert("Resim yüklenirken bir hata oluştu");
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const generateSlug = (text: string) => {
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
    return text
      .toLowerCase()
      .split("")
      .map((char) => turkishToEnglish[char] || char)
      .join("")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // slug'ı otomatik oluştur veya kullanıcıdan al
      const slug = formData.slug
        ? generateSlug(formData.slug)
        : generateSlug(formData.title);

      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, slug }),
      });

      if (!res.ok) {
        throw new Error("Duyuru eklenirken bir hata oluştu");
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error("Duyuru eklenirken hata:", error);
      alert("Duyuru eklenirken bir hata oluştu");
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

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">Yeni Duyuru</h1>
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
              htmlFor="slug"
              className="block text-sm font-medium text-gray-700"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white placeholder:text-gray-400"
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
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
            />
          </div>

          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700"
            >
              Görsel
            </label>
            <input
              type="file"
              name="image"
              id="image"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-1 block w-full text-gray-900"
            />
            {selectedImage && (
              <div className="mt-2">
                <Image
                  src={selectedImage}
                  alt="Seçilen görsel"
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="mt-2 inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Resmi Kaldır
                </button>
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
              value={formData.content}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
            />
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
