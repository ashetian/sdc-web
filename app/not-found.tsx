"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-secondary-900 flex items-center justify-center relative overflow-hidden">
      {/* Arkaplan efektleri */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-secondary-900 opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 via-transparent to-secondary-900/50" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* İçerik */}
      <div className="relative z-10 text-center px-4">
        {/* 404 Numarası */}
        <h1 className="text-[150px] sm:text-[200px] font-bold text-white opacity-5">
          404
        </h1>
        <h2 className="text-4xl sm:text-5xl font-bold text-white mt-4">
          Sayfa Bulunamadı
        </h2>

        {/* Açıklama */}
        <p className="mt-6 text-xl text-gray-400 max-w-md mx-auto">
          Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
        </p>

        {/* Buton */}
        <div className="mt-10">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-primary-500 text-white rounded-full font-medium 
                     hover:bg-primary-600 transform hover:scale-105 transition-all duration-300
                     shadow-lg hover:shadow-primary-500/50"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>

      {/* Dekoratif elementler */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] 
                    bg-primary-500/20 rounded-full blur-3xl opacity-20 animate-pulse"
      />
    </div>
  );
}
