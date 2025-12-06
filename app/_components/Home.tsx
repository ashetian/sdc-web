"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "../_context/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

interface StatData {
  _id: string;
  label: string;
  labelEn?: string;
  value: string;
  color: string;
  order: number;
}

export default function Home() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const statsRef = useRef(null);
  const [stats, setStats] = useState<StatData[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const { t, language } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    // Fetch stats
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => {
        console.error('Stats yüklenirken hata:', err);
        setStats([
          { _id: '1', label: 'Üye', labelEn: 'Members', value: '220+', color: 'bg-neo-green', order: 0 },
          { _id: '2', label: 'Proje', labelEn: 'Projects', value: '2', color: 'bg-neo-purple', order: 1 },
          { _id: '3', label: 'Etkinlik', labelEn: 'Events', value: '12', color: 'bg-neo-orange', order: 2 },
        ]);
      });

    // Fetch user
    fetch('/api/auth/me')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not logged in');
      })
      .then(data => {
        setUser(data.user);
        setLoadingUser(false);
      })
      .catch(() => {
        setUser(null);
        setLoadingUser(false);
      });
  }, []);

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
      className="min-h-screen w-full flex pt-40 pb-20 items-center justify-center overflow-hidden bg-neo-white relative border-b-4 border-black"
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 2px, transparent 2px)',
          backgroundSize: '30px 30px'
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
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-black uppercase tracking-tighter text-left">
              {language === 'tr' ? (
                <>
                  KTÜ Yazılım
                  <br />
                  Geliştirme Kulübü
                </>
              ) : (
                <>
                  KTU Software
                  <br />
                  Development Club
                </>
              )}
            </h1>
          </div>
        </div>

        <div ref={subtitleRef} className="bg-neo-blue border-4 border-black shadow-neo p-4 mx-auto transform rotate-1 max-w-3xl mt-8">
          <h2 className="text-xl md:text-3xl font-bold text-black">
            {language === 'tr' ? 'Geleceği inşa ediyoruz!' : 'We are building the future!'}
          </h2>
        </div>

        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-8 cursor-default min-h-[80px]">
          {!loadingUser && (
            <>
              {!user ? (
                // GUEST BUTTONS
                <>
                  <button
                    onClick={() => router.push("/join")}
                    className="w-64 sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-neo-pink text-black border-4 border-black shadow-neo font-black text-lg sm:text-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    {language === 'tr' ? 'Kulübe Üye Ol' : 'Join the Club'}
                  </button>
                  <button
                    onClick={() => router.push("/auth/signup")}
                    className="w-64 sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-neo-blue text-black border-4 border-black shadow-neo font-black text-lg sm:text-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    {language === 'tr' ? 'Kayıt Ol' : 'Sign Up'}
                  </button>
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="w-64 sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-white text-black border-4 border-black shadow-neo font-black text-lg sm:text-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    {language === 'tr' ? 'Giriş Yap' : 'Login'}
                  </button>
                </>
              ) : (
                // LOGGED IN USER BUTTONS
                <>
                  <button
                    onClick={() => router.push("/articles")}
                    className="w-64 sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-neo-purple text-white border-4 border-black shadow-neo font-black text-lg sm:text-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    {language === 'tr' ? 'Makaleler' : 'Articles'}
                  </button>
                  <button
                    onClick={() => router.push("/projects")}
                    className="w-64 sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-neo-orange text-black border-4 border-black shadow-neo font-black text-lg sm:text-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    {language === 'tr' ? 'Projeler' : 'Projects'}
                  </button>
                  <button
                    onClick={() => router.push("/events")}
                    className="w-64 sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-neo-green text-black border-4 border-black shadow-neo font-black text-lg sm:text-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                  >
                    {language === 'tr' ? 'Etkinlikler' : 'Events'}
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
