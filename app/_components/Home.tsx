'use client';
import { useEffect, useState } from 'react';
import VideoBackground from './VideoBackground';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section id="home" className="relative h-[100dvh] w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <VideoBackground />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      
      <div className={`relative z-10 w-full text-center px-4 sm:px-6 lg:px-8 transform transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
          <span className="bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            KTÜ Yazılım Geliştirme Kulübü
          </span>
        </h1>
        
        <p className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
          Yazılım geliştirme tutkusuyla bir araya gelen öğrenciler için
          inovasyon ve öğrenme merkezi
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => {
              document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-64 sm:w-auto px-8 py-3 bg-primary-500 text-white rounded-full font-medium 
                     hover:bg-primary-600 transform hover:scale-105 transition-all duration-300
                     shadow-lg hover:shadow-primary-500/50"
          >
            Bizi Tanıyın
          </button>
          
          <button
            onClick={() => {
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-64 sm:w-auto px-8 py-3 bg-white/10 text-white rounded-full font-medium 
                     backdrop-blur-sm hover:bg-white/20 transform hover:scale-105 
                     transition-all duration-300 border border-white/30"
          >
            İletişime Geçin
          </button>
        </div>
        
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto">
          <Stat number="60+" text="Üye" />
          <Stat number="2" text="Proje" />
          <Stat number="3" text="Etkinlik" />
          <Stat number="0" text="Workshop" />
        </div>
      </div>
    </section>
  );
}

function Stat({ number, text }: { number: string; text: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-white mb-2">{number}</div>
      <div className="text-gray-300">{text}</div>
    </div>
  );
}