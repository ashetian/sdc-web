"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import ChromaGrid from "./ChromaGrid";

export interface TeamMember {
  name: string;
  role?: string;
  subtitle?: string;
  email?: string;
  description?: string;
  location?: string;
  borderColor?: string;
  image: string;
  linkedin?: string;
  github?: string;
  x?: string;
  instagram?: string;
  website?: string;
  freelance?: string;
  handle?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Murat C. Akyol",
    subtitle: "Kulüp Başkanı",
    description:
      "Murat Can Akyol is a student in the Software Development Department at Karadeniz Technical University, where he also serves as the founding head of the Software Development Club. Alongside his academic studies, he is interested in playing the violin.",
    image: "/team/muratcan.jpg",
    location: "İstanbul",
    github: "https://github.com/Iuppitter",
    email: "muratcan.akyol739@icloud.com",
    linkedin: "https://www.linkedin.com/in/murat-c-akyol-5847b4332/",
    instagram: "https://www.instagram.com/muratcan_akyol/",
  },
  {
    name: "Cihan Bayram",
    subtitle: "Full-stack",
    email: "contact@c1h4n.com",
    image: "/team/ccc.png",
    linkedin: "https://www.linkedin.com/in/c1h4n/",
    location: "Trabzon",
    description: "Merhaba ben Cihan. ...",
    github: "https://github.com/C1H4N",
    x: "https://x.com/cjh4n",
    instagram: "https://www.instagram.com/c1h4n",
    website: "https://c1h4n.com",
  },
  {
    name: "Caner Görez",
    subtitle: "WebDev, Designer",
    description: "I am a web developer and designer.",
    email: "caner19741@outlook.com",
    image: "/team/canergorez.jpg",
    location: "İstanbul",
    linkedin: "https://www.linkedin.com/in/caner-görez/",
    github: "https://github.com/ashetian",
    instagram: "https://www.instagram.com/ashetian_",
    x: "https://x.com/ashetian_",
    freelance: "https://wa.me/+905446549256",
  },
  {
    name: "Yunus Emre Demirci",
    //subtitle: "AI / Yazılım",
    subtitle: "Başkumandan",
    description:
      "Yapay zeka ve teknolojiyle ilgilenen bir yazılım öğrencisiyim. ...",
    github: "https://github.com/yedemirci",
    email: "ye.demirci@outlook.com",
    location: "Trabzon",
    image: "/team/yunusemre.png",
    instagram: "https://www.instagram.com/y.emre.demirci/",
    linkedin: "https://www.linkedin.com/in/yedemirci/",
  },
  {
    name: "Tunahan Akargül",
    subtitle: "Unity / Front-end",
    description: "Merhaba ben Tunahan. ...",
    email: "tuna.akargul@gmail.com",
    image: "/team/tunahan.jpg",
    location: "İstanbul",
    instagram: "https://www.instagram.com/tunahan.akargul/",
    linkedin: "https://www.linkedin.com/in/tunahan-akarg%C3%BCl-b7a7a9208/",
    github: "https://github.com/tunahan-akargul",
    x: "https://x.com/TunahanAka7260",
    website: "https://tunahanakargul.online/",
  },
  {
    name: "Tarık Kılıç",
    subtitle: "Kulüp Saymanı",
    description:
      "Makine Öğrenmesi ve otomasyon teknolojileri alanında kendini geliştiren bir yazılımcı adayıyım.",
    email: "tedtkilic@gmail.com",
    github: "https://github.com/TedT002",
    linkedin:
      "https://www.linkedin.com/in/tar%C4%B1k-k%C4%B1l%C4%B1%C3%A7-73544733b/",
    location: "İstanbul",
    image: "/team/tarik.jpg",
    instagram: "https://www.instagram.com/tedt_emmett_brown/",
  },
  {
    name: "Çağrı Aydemir",
    subtitle: "Oyun Geliştirici",
    description:
      "Merhaba, ben Çağrı. KTÜ Yazılım Geliştirme Bölümü öğrencisiyim.",
    email: "cagriaydemir67@gmail.com",
    image: "/team/cagri.png",
    location: "Zonguldak",
    linkedin:
      "https://www.linkedin.com/in/%C3%A7a%C4%9Fr%C4%B1-aydemir-106822353/",
    instagram: "https://www.instagram.com/_cagriaydemir_/",
    x: "https://x.com/MoonIron_67",
  },
] as const;

const palette = [
  { border: "#4F46E5", gradient: "linear-gradient(145deg,#4F46E5,#000)" },
  { border: "#10B930", gradient: "linear-gradient(165deg,#10C950,#000)" },
  { border: "#10B981", gradient: "linear-gradient(210deg,#10B981,#000)" },
  { border: "#EF4444", gradient: "linear-gradient(195deg,#EF4444,#000)" },
  { border: "#8B5CF6", gradient: "linear-gradient(225deg,#8B5CF6,#000)" },
  { border: "#e6007a", gradient: "linear-gradient(135deg,#e6007a,#000)" },
] as const;

export default function Team() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const chromaItems = useMemo(() => {
    return teamMembers.map((m, i) => {
      const p = palette[i % palette.length];

      return {
        image: m.image,
        name: m.name,
        handle: m.handle,
        email: m.email,
        borderColor: p.border,
        subtitle: m.subtitle,
        description: m.description,
        gradient: p.gradient,
        github: m.github,
        x: m.x,
        instagram: m.instagram,
        website: m.website,
        linkedin: m.linkedin,
        location: m.location,
        freelance: m.freelance,
      };
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="team"
      className="relative py-20 bg-gradient-to-b from-secondary-800 to-secondary-900 overflow-hidden"
    >
      {/* Arkaplan */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-secondary-900 opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 via-transparent to-secondary-900/50" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center transform transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ekibimiz
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-16">
            Yazılım tutkusuyla bir araya gelmiş, yenilikçi ve dinamik ekibimizle
            tanışın.
          </p>

          {/* Halo tint fix: light/dark temaya göre --bf-bg ayarla */}
          <div className="[--bf-bg:rgba(0,0,0,0.0001)] dark:[--bf-bg:rgba(255,255,255,0.0001)]">
            <ChromaGrid items={chromaItems} className="justify-center" />
          </div>
        </div>
      </div>
    </section>
  );
}
