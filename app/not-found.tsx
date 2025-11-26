"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neo-yellow flex items-center justify-center pt-40 relative overflow-hidden py-20">
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <div className="bg-white border-4 border-black shadow-neo-lg p-12 transform rotate-1">
          <h1 className="text-9xl font-black text-black mb-4 select-none">
            404
          </h1>
          <h2 className="text-4xl sm:text-5xl font-black text-black mb-6 uppercase bg-neo-purple text-white inline-block px-4 py-2 border-2 border-black shadow-neo-sm transform -rotate-2">
            Sayfa Bulunamadı
          </h2>

          <p className="mt-6 text-xl font-bold text-black mb-10">
            Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
          </p>

          <Link
            href="/"
            className="inline-block px-8 py-4 bg-black text-white text-xl font-black uppercase border-4 border-transparent hover:bg-white hover:text-black hover:border-black hover:shadow-neo transition-all transform hover:-translate-y-1"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
