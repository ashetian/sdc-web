"use client";
import { useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "../_context/LanguageContext";
import { useStats, useUser } from "../lib/swr";
import type { StatData } from "../lib/types/api";

gsap.registerPlugin(ScrollTrigger);

// Fallback stats if API fails
const fallbackStats: StatData[] = [
  { _id: '1', label: 'Üye', labelEn: 'Members', value: '220+', color: 'bg-neo-yellow', order: 0 },
  { _id: '2', label: 'Proje', labelEn: 'Projects', value: '2', color: 'bg-neo-cyan', order: 1 },
  { _id: '3', label: 'Etkinlik', labelEn: 'Events', value: '12', color: 'bg-neo-pink', order: 2 },
];

export default function Home() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const statsRef = useRef(null);

  // SWR hooks
  const { data: statsData, error: statsError } = useStats();
  const { user, isLoading: loadingUser } = useUser();
  const { t, language } = useLanguage();
  const router = useRouter();

  // Use fallback if stats fail to load
  const stats = statsData || (statsError ? fallbackStats : []);

  useGSAP(() => {
    // ... GSAP code (unchanged logic, just re-running effect)
    if (!containerRef.current || !titleRef.current || !subtitleRef.current || !buttonsRef.current || !statsRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    });

    tl.from(titleRef.current, {
      y: 100,
      rotation: -5,
      scale: 0.8,
      opacity: 0,
      duration: 1.2,
      ease: "elastic.out(1, 0.5)",
    })
      .from(subtitleRef.current, {
        x: -50,
        skewX: 10,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      }, "-=0.8")
      .from(buttonsRef.current, {
        scale: 0,
        rotation: 5,
        opacity: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)",
      }, "-=0.4")
      .from(statsRef.current, {
        y: 50,
        scale: 0.5,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.7)",
      }, "-=0.4");

  }, { scope: containerRef });

  const getStatLabel = (stat: StatData) => {
    if (language === 'en' && stat.labelEn) return stat.labelEn;
    if (language === 'en') {
      const labelMap: Record<string, string> = {
        'Üye': 'Members',
        'Proje': 'Projects',
        'Etkinlik': 'Events',
        'Yıl': 'Years',
      };
      return labelMap[stat.label] || stat.label;
    }
    return stat.label;
  };

  return (
    <section
      id="home"
      ref={containerRef}
      className="min-h-screen w-full flex pt-40 pb-20 items-center justify-center overflow-x-clip overflow-y-visible bg-white relative border-b-4 border-black"
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 2px, transparent 2px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="flex flex-col z-10 w-full text-center px-4 sm:px-6 lg:px-8 gap-6">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
          <div className="relative w-48 h-48 md:w-64 md:h-64 bg-white border-4 border-black shadow-neo-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300 flex-shrink-0">
            <Image
              src="/logopng.png"
              alt="KTÜ SDC Logo"
              fill
              className="object-contain p-4"
              priority
            />
          </div>

          <div ref={titleRef} className="bg-neo-yellow border-4 border-black shadow-neo-lg p-6 transform rotate-1 lg:-rotate-2">
            <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-black uppercase tracking-tight text-left">
              {t('home.clubNameLine1')}
              <br />
              {t('home.clubNameLine2')}
            </h1>
          </div>
        </div>

        <div ref={subtitleRef} className="bg-neo-blue border-4 border-black shadow-neo p-4 mx-auto transform rotate-1 max-w-3xl mt-8">
          <h2 className="text-xl md:text-3xl font-bold text-black">
            {t('home.subtitle')}
          </h2>
        </div>

        <div ref={buttonsRef} className="grid grid-cols-2 sm:flex gap-3 sm:gap-6 justify-center items-center mt-8 cursor-default min-h-[80px] max-w-lg sm:max-w-none mx-auto">
          {!loadingUser && (
            <>
              {!user ? (
                // GUEST BUTTONS
                <>
                  <button
                    onClick={() => router.push("/join")}
                    className="w-full sm:w-auto px-4 py-2 sm:px-8 sm:py-4 bg-neo-pink text-black border-4 border-black shadow-neo font-black text-sm sm:text-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    {t('home.joinClub')}
                  </button>
                  <button
                    onClick={() => router.push("/auth/signup")}
                    className="w-full sm:w-auto px-4 py-2 sm:px-8 sm:py-4 bg-neo-blue text-black border-4 border-black shadow-neo font-black text-sm sm:text-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    {t('home.signUp')}
                  </button>
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="w-full sm:w-auto px-4 py-2 sm:px-8 sm:py-4 bg-white text-black border-4 border-black shadow-neo font-black text-sm sm:text-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    {t('home.login')}
                  </button>
                  <button
                    onClick={() => router.push("/team")}
                    className="w-full sm:w-auto px-4 py-2 sm:px-8 sm:py-4 bg-neo-cyan text-black border-4 border-black shadow-neo font-black text-sm sm:text-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    {t('home.team')}
                  </button>
                </>
              ) : (
                // LOGGED IN USER BUTTONS
                <>
                  <button
                    onClick={() => router.push("/articles")}
                    className="w-full sm:w-auto px-4 py-2 sm:px-8 sm:py-4 bg-neo-purple text-white border-4 border-black shadow-neo font-black text-sm sm:text-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    {t('home.articles')}
                  </button>
                  <button
                    onClick={() => router.push("/projects")}
                    className="w-full sm:w-auto px-4 py-2 sm:px-8 sm:py-4 bg-neo-orange text-black border-4 border-black shadow-neo font-black text-sm sm:text-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    {t('home.projects')}
                  </button>
                  <button
                    onClick={() => router.push("/forum")}
                    className="w-full sm:w-auto px-4 py-2 sm:px-8 sm:py-4 bg-neo-green text-black border-4 border-black shadow-neo font-black text-sm sm:text-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    Forum
                  </button>
                  <button
                    onClick={() => router.push("/team")}
                    className="w-full sm:w-auto px-4 py-2 sm:px-8 sm:py-4 bg-neo-cyan text-black border-4 border-black shadow-neo font-black text-sm sm:text-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    {t('home.team')}
                  </button>
                </>
              )}
            </>
          )}
        </div>

        <div ref={statsRef} className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto w-full">
          {stats.map((stat) => (
            <Stat key={stat._id} number={stat.value} text={getStatLabel(stat)} color={stat.color} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ number, text, color }: { number: string; text: string; color: string }) {
  return (
    <div className={`${color} border-4 border-black shadow-neo p-6 transform hover:-translate-y-2 transition-transform`}>
      <div className="text-5xl font-black text-black mb-2">{number}</div>
      <div className="text-xl font-bold text-black uppercase">{text}</div>
    </div>
  );
}
