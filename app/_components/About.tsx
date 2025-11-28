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
    icon: "🧩",
    color: "bg-neo-blue"
  },
  {
    title: "Teknik Departman",
    description: "Yazılım geliştirme, proje geliştirme, altyapı, web sitesi, otomasyon ve teknik sorun çözme gibi tüm teknik uygulamaları gerçekleştirir.",
    icon: "🛠️",
    color: "bg-neo-green"
  },
  {
    title: "Medya Departmanı",
    description: "Etkinlik duyuruları, sosyal medya yönetimi, tasarım, afiş-video içerikleri ve kulübün dış iletişim görünürlüğünü sağlar.",
    icon: "📸",
    color: "bg-neo-purple"
  },
  {
    title: "Sponsorluk Departmanı",
    description: "Şirketlerle iletişim kurarak iş birlikleri, maddi-manevi destekler ve sponsorluk anlaşmalarını organize eder.",
    icon: "🤝",
    color: "bg-neo-pink"
  },
];

export default function About() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef(null);

  useGSAP(() => {
    gsap.from(titleRef.current, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
      },
      y: 50,
      duration: 0.8,
      ease: "power2.out",
    });

    gsap.from(".feature-card", {
      scrollTrigger: {
        trigger: cardsRef.current,
        start: "top 80%",
      },
      y: 30,
      duration: 0.6,
      stagger: 0.2,
      ease: "back.out(1.7)",
    });
  }, { scope: sectionRef });

  const handleContactClick = () => {
    const contactSection = document.getElementById("contact");
    contactSection?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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
            KTÜ Software Development Club, yazılım dünyasında kendini
            geliştirmek isteyen öğrenciler için bir öğrenme ve gelişim
            platformudur.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`feature-card group ${feature.color} border-4 border-black shadow-neo p-6 
                        transform transition-all duration-200 hover:-translate-y-2 hover:shadow-neo-lg`}
            >
              <div className="text-5xl mb-4 bg-white border-2 border-black w-16 h-16 flex items-center justify-center rounded-none shadow-neo-sm">
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
            onClick={handleContactClick}
            className="inline-flex items-center px-8 py-4 bg-black text-white border-4 border-transparent 
                     text-lg font-bold hover:bg-white hover:text-black hover:border-black hover:shadow-neo 
                     transition-all duration-200"
          >
            Bize Katılın
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
