'use client';

import React from "react";
import Image from "next/image";
import { useLanguage } from "../_context/LanguageContext";

import { usePathname } from "next/navigation";

export default function Footer() {
  const { t, language } = useLanguage();
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-neo-black text-white py-12 border-t-4 border-black relative z-50">
      <div className="container mx-auto px-4">
        {/* Top section with logo and info */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-8">
          {/* Logo and Name */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative w-20 h-20 bg-white border-4 border-white shadow-neo p-2">
                <Image
                  src="/logopng.png"
                  alt="KTÜ SDC Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-2xl font-black text-neo-yellow">KTÜ SDC</h3>
                <p className="text-sm font-bold opacity-80">
                  {language === 'tr' ? 'Yazılım Geliştirme Kulübü' : 'Software Development Club'}
                </p>
              </div>
            </div>
            <p className="text-sm opacity-70 max-w-xs text-center md:text-left">
              {language === 'tr'
                ? "Karadeniz Teknik Üniversitesi'nde yazılım ve teknoloji tutkusuyla bir araya gelen öğrencilerin topluluğu."
                : "A community of students united by their passion for software and technology at Karadeniz Technical University."}
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-end">
            <h4 className="text-lg font-black text-neo-green mb-3">{t('footer.quickLinks')}</h4>
            <div className="flex flex-wrap gap-2 justify-center md:justify-end">
              <a href="/events" className="text-sm font-bold bg-neo-purple text-white px-3 py-1 border-2 border-white hover:bg-white hover:text-black transition-all">
                {t('nav.events')}
              </a>
              <a href="/projects" className="text-sm font-bold bg-neo-blue text-black px-3 py-1 border-2 border-white hover:bg-white transition-all">
                {language === 'tr' ? 'Projeler' : 'Projects'}
              </a>
              <a href="/apply" className="text-sm font-bold bg-neo-pink text-black px-3 py-1 border-2 border-white hover:bg-white transition-all">
                {t('nav.apply')}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t-2 border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start">
            <p className="text-lg font-bold text-neo-yellow">
              &copy; {new Date().getFullYear()} KTUSDC
            </p>
            <p className="text-sm opacity-80">{t('footer.rights')}</p>
          </div>

          <div className="flex flex-row gap-2 items-center">
            <span className="text-sm font-bold bg-neo-pink text-black px-2 py-1 border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              Developed by
            </span>
            <span className="text-sm font-bold bg-neo-blue text-black px-2 py-1 border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              Caner
            </span>
            <span className="text-sm font-bold bg-neo-green text-black px-2 py-1 border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              Cihan
            </span>
            <span className="text-sm font-bold bg-neo-purple text-black px-2 py-1 border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              Murat
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
