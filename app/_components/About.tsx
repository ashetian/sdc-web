"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "Proje Departmanı",
    description: "Kulüp etkinlikleri ve yazılım projeleri için fikir üretip planlama, görev dağıtımı ve teknik gereksinimleri belirleme sürecini yürütür.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    color: "bg-neo-blue"
  },
  {
    title: "Teknik Departman",
    description: "Yazılım geliştirme, proje geliştirme, altyapı, web sitesi, otomasyon ve teknik sorun çözme gibi tüm teknik uygulamaları gerçekleştirir.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    color: "bg-neo-green"
  },
  {
    title: "Medya Departmanı",
    description: "Etkinlik duyuruları, sosyal medya yönetimi, tasarım, afiş-video içerikleri ve kulübün dış iletişim görünürlüğünü sağlar.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: "bg-neo-purple"
  },
  {
    title: "Kurumsal İletişim Departmanı",
    description: "Şirketlerle iletişim kurarak iş birlikleri, maddi-manevi destekler ve sponsorluk anlaşmalarını organize eder.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: "bg-neo-pink"
  },
];

export default function About() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(titleRef.current,
      {
        y: 50,
        rotation: -3,
        opacity: 0,
      },
      {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          toggleActions: "play none none reverse",
        },
        y: 0,
        rotation: -1, // Target rotation from className
        opacity: 1,
        duration: 1,
        ease: "elastic.out(1, 0.75)",
      }
    );

    gsap.fromTo(".feature-card",
      {
        y: 100,
        rotation: () => Math.random() * 20 - 10,
        scale: 0.5,
        opacity: 0,
      },
      {
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 60%",
          toggleActions: "play none none reverse",
        },
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)",
      }
    );
  }, { scope: sectionRef });

  const handleJoinClick = () => {
    window.location.href = "/apply";
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative py-20 bg-white border-b-4 border-black"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 ref={titleRef} className="inline-block text-4xl sm:text-5xl font-black text-black mb-6 bg-neo-yellow border-4 border-black shadow-neo px-6 py-2 transform -rotate-1">
            Hakkımızda
          </h2>
          <p className="text-xl font-bold text-black max-w-3xl mx-auto mt-4 border-2 border-black p-4 bg-gray-100 shadow-neo-sm">
            Karadeniz Teknik Üniversitesi Yazılım Geliştirme Kulübü,
            yazılım dünyasında kendini geliştirmek isteyen öğrenciler
            için yalnızca bir öğrenme alanı değil; gerçek hayat iş süreçlerini,
            ekip çalışmasını ve proje geliştirme kültürünü deneyimleyebilecekleri
            bir profesyonel simülasyon ortamıdır.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-card group ${feature.color} border-4 border-black shadow-neo p-6 
                        transform transition-all duration-200 hover:-translate-y-2 hover:shadow-neo-lg`}
            >
              <div className="mb-4 bg-white border-2 border-black w-16 h-16 flex items-center justify-center rounded-none shadow-neo-sm">
                {feature.icon}
              </div>
              <h3 className="text-xl font-black text-black mb-3 uppercase">
                {feature.title}
              </h3>
              <p className="text-black font-medium border-t-2 border-black pt-2">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-32 text-center">
          <button
            onClick={handleJoinClick}
            className="inline-flex items-center px-8 py-4 bg-black text-white border-4 border-transparent 
                     text-lg font-bold hover:bg-white hover:text-black hover:border-black hover:shadow-neo 
                     transition-all duration-200"
          >
            Ekibimize Katılın
            <svg
              className="ml-2 -mr-1 w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
