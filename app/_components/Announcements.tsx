'use client';
import { useEffect, useRef, useState } from 'react';

interface Announcement {
  title: string;
  date: string;
  description: string;
  type: 'event' | 'news' | 'workshop';
}

export default function Announcements() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const announcements: Announcement[] = [
    {
      title: "Web Geliştirme Workshop'u",
      date: "15 Mart 2024",
      description: "Modern web teknolojileri ve best practice'ler hakkında kapsamlı bir workshop düzenliyoruz.",
      type: "workshop"
    },
    {
      title: "Yeni Dönem Kayıtları",
      date: "1 Mart 2024",
      description: "2024 Bahar dönemi için yeni üye kayıtlarımız başlamıştır. Son başvuru tarihi 20 Mart 2024.",
      type: "news"
    },
    {
      title: "Yapay Zeka Semineri",
      date: "25 Mart 2024",
      description: "Yapay zeka ve makine öğrenimi alanında uzman konuşmacılarla bir seminer düzenliyoruz.",
      type: "event"
    }
  ];

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
    <section
      ref={sectionRef}
      id="announcements"
      className="relative py-20 bg-gradient-to-b from-secondary-900 to-secondary-800 overflow-hidden"
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-secondary-900 opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-bl from-primary-500/10 via-transparent to-secondary-900/50" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Duyurular
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-16">
            En güncel etkinlik ve duyurularımızdan haberdar olun.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {announcements.map((announcement, index) => (
              <div
                key={index}
                className={`group bg-secondary-800/50 backdrop-blur-sm rounded-xl p-6
                          transform transition-all duration-500 hover:scale-105 hover:bg-secondary-700/50
                          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${getTypeStyles(announcement.type)}`}>
                    {getTypeText(announcement.type)}
                  </span>
                  <time className="text-sm text-gray-400">{announcement.date}</time>
                </div>

                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-primary-400 transition-colors">
                  {announcement.title}
                </h3>

                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  {announcement.description}
                </p>

                <button className="mt-4 text-primary-400 hover:text-primary-300 transition-colors text-sm font-medium inline-flex items-center group">
                  Detayları Gör
                  <svg 
                    className="w-4 h-4 ml-1 transform transition-transform group-hover:translate-x-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}