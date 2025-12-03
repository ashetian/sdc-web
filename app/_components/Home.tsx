"use client";
import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface StatData {
  _id: string;
  label: string;
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

  useEffect(() => {
    // Fetch stats from API
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => {
        console.error('Stats yüklenirken hata:', err);
        // Fallback to default stats if API fails
        setStats([
          { _id: '1', label: 'Üye', value: '220+', color: 'bg-neo-green', order: 0 },
          { _id: '2', label: 'Proje', value: '2', color: 'bg-neo-purple', order: 1 },
          { _id: '3', label: 'Etkinlik', value: '12', color: 'bg-neo-orange', order: 2 },
        ]);
      });
  }, []);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.from(titleRef.current, {
      y: 100,
      opacity: 0,
      duration: 1,
      ease: "power4.out",
    })
      .from(subtitleRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      }, "-=0.5")
      .from(buttonsRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.7)",
      }, "-=0.3")
      .from(statsRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      }, "-=0.3");

  }, { scope: containerRef });

  return (
    <section
      id="home"
      ref={containerRef}
      className="min-h-screen w-full flex pt-40 pb-20 items-center justify-center overflow-hidden bg-neo-white relative border-b-4 border-black"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 2px, transparent 2px)',
          backgroundSize: '30px 30px'
        }}
      />

      <div className="flex flex-col z-10 w-full text-center px-4 sm:px-6 lg:px-8 gap-6">
        <div ref={titleRef} className="bg-neo-yellow border-4 border-black shadow-neo-lg p-6 inline-block mx-auto transform -rotate-2">
          <h1 className="text-4xl md:text-7xl font-black text-black uppercase tracking-tighter">
            KTU Software
            <br />
            Development Club
          </h1>
        </div>

        <div ref={subtitleRef} className="bg-neo-blue border-4 border-black shadow-neo p-4 mx-auto transform rotate-1 max-w-3xl mt-8">
          <h2 className="text-xl md:text-3xl font-bold text-black">
            Yazılım geliştirme tutkusuyla bir araya gelen öğrenciler için inovasyon merkezi
          </h2>
        </div>

        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-8">
          <button
            onClick={() => {
              window.location.href = "/join";
            }}
            className="w-64 sm:w-auto px-8 py-4 bg-neo-pink text-black border-4 border-black shadow-neo font-black text-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            Kulübe Üye Ol
          </button>

          <button
            onClick={() => {
              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-64 sm:w-auto px-8 py-4 bg-white text-black border-4 border-black shadow-neo font-black text-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            İletişime Geçin
          </button>
        </div>

        <div ref={statsRef} className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto w-full">
          {stats.map((stat) => (
            <Stat key={stat._id} number={stat.value} text={stat.label} color={stat.color} />
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
