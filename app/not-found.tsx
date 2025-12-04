"use client";
import Link from "next/link";
import { useLanguage } from "./_context/LanguageContext";

export default function NotFound() {
  const { language } = useLanguage();

  const l = {
    tr: {
      title: 'Sayfa Bulunamadı',
      description: 'Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.',
      backHome: 'Ana Sayfaya Dön'
    },
    en: {
      title: 'Page Not Found',
      description: 'The page you are looking for may have been moved, deleted, or never existed.',
      backHome: 'Back to Home'
    }
  };

  return (
    <div className="min-h-screen bg-neo-yellow flex items-center justify-center pt-40 relative overflow-hidden py-20">
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <div className="bg-white border-4 border-black shadow-neo-lg p-12 transform rotate-1">
          <h1 className="text-9xl font-black text-black mb-4 select-none">
            404
          </h1>
          <h2 className="text-4xl sm:text-5xl font-black text-black mb-6 uppercase bg-neo-purple text-white inline-block px-4 py-2 border-2 border-black shadow-neo-sm transform -rotate-2">
            {l[language].title}
          </h2>

          <p className="mt-6 text-xl font-bold text-black mb-10">
            {l[language].description}
          </p>

          <Link
            href="/"
            className="inline-block px-8 py-4 bg-black text-white text-xl font-black uppercase border-4 border-transparent hover:bg-white hover:text-black hover:border-black hover:shadow-neo transition-all transform hover:-translate-y-1"
          >
            {l[language].backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
