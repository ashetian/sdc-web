'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Announcement {
  slug: string;
  title: string;
  date: string;
  description: string;
  type: 'event' | 'news' | 'workshop';
  content: string;
  image?: string;
  isDraft: boolean;
}

export default function EditAnnouncementPage({
  params,
}: {
  params: { slug: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState<Announcement>({
    slug: '',
    title: '',
    date: '',
    description: '',
    type: 'event',
    content: '',
    image: '',
    isDraft: false
  });

  useEffect(() => {
    async function loadAnnouncement() {
      try {
        const res = await fetch(`/api/announcements/${params.slug}`);
        if (!res.ok) throw new Error('Duyuru yüklenemedi');
        const data = await res.json();
        setFormData(data);
        if (data.image) {
          setSelectedImage(data.image);
        }
      } catch (error) {
        console.error('Duyuru yüklenirken hata:', error);
        alert('Duyuru yüklenirken bir hata oluştu');
        router.push('/admin');
      } finally {
        setIsLoading(false);
      }
    }

    loadAnnouncement();
  }, [params.slug, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Resim yüklenemedi');

      const data = await res.json();
      setSelectedImage(data.path);
      setFormData(prev => ({ ...prev, image: data.path }));
    } catch (error) {
      console.error('Resim yüklenirken hata:', error);
      alert('Resim yüklenirken bir hata oluştu');
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Eğer slug manuel girilmemişse otomatik oluştur
      let newSlug = formData.slug;
      
      if (!newSlug) {
        const turkishToEnglish: { [key: string]: string } = {
          'ğ': 'g', 'Ğ': 'G',
          'ü': 'u', 'Ü': 'U',
          'ş': 's', 'Ş': 'S',
          'ı': 'i', 'İ': 'I',
          'ö': 'o', 'Ö': 'O',
          'ç': 'c', 'Ç': 'C'
        };

        newSlug = formData.title
          .toLowerCase()
          .split('')
          .map(char => turkishToEnglish[char] || char)
          .join('')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }

      // Yeni slug'ı formData'ya ekle
      const updatedData = { ...formData, slug: newSlug };

      const res = await fetch(`/api/announcements/${params.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        throw new Error('Duyuru güncellenirken bir hata oluştu');
      }

      router.push('/admin');
      router.refresh();
    } catch (error) {
      console.error('Duyuru güncellenirken hata:', error);
      alert('Duyuru güncellenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">Duyuru Düzenle</h1>
        <Link
          href="/admin"
          className="text-gray-600 hover:text-gray-800"
        >
          Geri Dön
        </Link>
      </div>

      <div className="border-t border-gray-200">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
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
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
              URL Adresi (Slug)
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                /announcements/
              </span>
              <input
                type="text"
                name="slug"
                id="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="ozel-etkinlik-basligi"
                className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Boş bırakırsanız başlıktan otomatik oluşturulacaktır.
            </p>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
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
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
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
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
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
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
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
            <label htmlFor="isDraft" className="ml-2 block text-sm text-gray-900">
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
              {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 