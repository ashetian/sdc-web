'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getAnnouncement } from '@/app/_data/announcements';
import type { Announcement } from '@/app/_data/announcements';

export default function AnnouncementPage() {
  const { slug } = useParams();
  const announcement = getAnnouncement(slug as string);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-secondary-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Duyuru Bulunamadı</h1>
          <Link href="/" className="text-primary-400 hover:text-primary-300">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const getTypeStyles = (type: Announcement['type']) => {
    switch (type) {
      case 'event':
        return 'bg-purple-500/10 text-purple-400 ring-purple-500/30';
      case 'news':
        return 'bg-blue-500/10 text-blue-400 ring-blue-500/30';
      case 'workshop':
        return 'bg-green-500/10 text-green-400 ring-green-500/30';
    }
  };

  const getTypeText = (type: Announcement['type']) => {
    switch (type) {
      case 'event':
        return 'Etkinlik';
      case 'news':
        return 'Duyuru';
      case 'workshop':
        return 'Workshop';
    }
  };

  return (
    <div className="min-h-screen bg-secondary-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-secondary-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium ring-1 ring-inset ${getTypeStyles(announcement.type)}`}>
              {getTypeText(announcement.type)}
            </span>
            <time className="text-gray-400">{announcement.date}</time>
          </div>

          <h1 className="text-4xl font-bold text-white mb-6">{announcement.title}</h1>
          
          <div className="prose prose-invert prose-primary max-w-none">
            <div dangerouslySetInnerHTML={{ 
              __html: announcement.content.split('\n').map(line => {
                if (line.startsWith('# ')) {
                  return `<h1 class="text-3xl font-bold mb-6">${line.slice(2)}</h1>`;
                }
                if (line.startsWith('## ')) {
                  return `<h2 class="text-2xl font-semibold mt-8 mb-4">${line.slice(3)}</h2>`;
                }
                if (line.startsWith('- ')) {
                  return `<li class="ml-4">${line.slice(2)}</li>`;
                }
                return line ? `<p class="mb-4">${line}</p>` : '';
              }).join('') 
            }} />
          </div>

          <div className="mt-12 pt-8 border-t border-gray-700">
            <Link 
              href="/" 
              className="inline-flex items-center text-primary-400 hover:text-primary-300 transition-colors"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 19l-7-7 7-7" 
                />
              </svg>
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 