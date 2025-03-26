'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Announcement {
  _id: string;
  slug: string;
  title: string;
  date: string;
  description: string;
  type: 'event' | 'news' | 'workshop';
  image?: string;
  isDraft: boolean;
}

export default function AdminPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const res = await fetch('/api/announcements');
        if (!res.ok) throw new Error('Duyurular alınamadı');
        const data = await res.json();
        setAnnouncements(data);
      } catch (error) {
        console.error('Duyurular yüklenirken hata:', error);
      }
    }

    loadAnnouncements();
  }, []);

  const handleDelete = async (slug: string) => {
    if (window.confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) {
      try {
        const res = await fetch(`/api/announcements/${slug}`, {
          method: 'DELETE',
        });
        
        if (!res.ok) throw new Error('Duyuru silinemedi');
        
        // Başarılı silme işleminden sonra listeyi güncelle
        setAnnouncements(announcements.filter(a => a.slug !== slug));
      } catch (error) {
        console.error('Duyuru silinirken hata:', error);
        alert('Duyuru silinirken bir hata oluştu');
      }
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">Duyurular</h1>
        <Link
          href="/admin/announcements/new"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Yeni Duyuru
        </Link>
      </div>
      
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {announcements.map((announcement) => (
            <li key={announcement._id} className="px-4 py-4">
              <div className="flex items-center space-x-4">
                {announcement.image && (
                  <div className="flex-shrink-0">
                    <Image
                      src={announcement.image}
                      alt={announcement.title}
                      width={100}
                      height={100}
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}
                <div className="flex-grow">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-medium text-gray-900">{announcement.title}</h2>
                    {announcement.isDraft && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Taslak
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{announcement.description}</p>
                  <div className="mt-2 flex space-x-4 text-sm text-gray-500">
                    <span>{announcement.date}</span>
                    <span>•</span>
                    <span className="capitalize">{announcement.type}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/admin/announcements/${announcement.slug}/edit`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Düzenle
                  </Link>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleDelete(announcement.slug)}
                  >
                    Sil
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 