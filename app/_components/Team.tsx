"use client";
import { useRef, useMemo } from "react";
import ChromaGrid from "./ChromaGrid";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
            "Murat Can Akyol, Karadeniz Teknik Üniversitesi Yazılım Geliştirme Bölümü öğrencisidir ve aynı zamanda Yazılım Geliştirme Kulübü’nün kurucu başkanıdır. Akademik çalışmalarının yanı sıra keman çalmada da yeteneklidir. Murat Can, yazılım geliştirme konusundaki tutkusunu ve liderlik becerilerini birleştirerek kulübün büyümesine ve gelişmesine öncülük etmektedir.",
        image: "/team/muratcan.jpg",
        location: "İstanbul",
        github: "https://github.com/Iuppitter",
        email: "contact@muratcanakyol.com",
        linkedin: "https://www.linkedin.com/in/murat-c-akyol-5847b4332/",
        instagram: "https://www.instagram.com/muratcan_akyol/",
        website: "https://muratcanakyol.com",
    },
    {
        name: "Cihan Bayram",
        subtitle: "Teknik Departman, WebDev",
        email: "contact@c1h4n.com",
        image: "/team/cc.jpeg",
        linkedin: "https://www.linkedin.com/in/c1h4n/",
        location: "Trabzon",
        description:
            "Merhaba ben Cihan. Günlük hayatımda tutkulu bir geliştiriciyim. Kendi kendine öğrenme tutumuna sahip hızlı öğrenen biriyim. Yeni teknolojileri öğrenmeyi ve keşfetmeyi, yapay zekayı kullanmayı seviyorum. Bu siteyi ve yaptığım diğer projeleri görmek için github sayfamı ve websitemi ziyaret edebilirsiniz.",
        github: "https://github.com/C1H4N",
        x: "https://x.com/cjh4n",
        instagram: "https://www.instagram.com/c1h4n",
        website: "https://c1h4n.com",
    },
    {
        name: "Caner Görez",
        subtitle: "Designer, WebDev",
        description: "I am a web developer and designer.",
        email: "caner19741@outlook.com",
        image: "/team/canergorez.jpg",
        location: "İstanbul",
        linkedin: "https://www.linkedin.com/in/caner-gorez/",
        github: "https://github.com/ashetian",
        instagram: "https://www.instagram.com/ashetian_",
        x: "https://x.com/ashetian_",
        freelance: "https://wa.me/+905446549256",
    },
    {
        name: "Yunus Emre Demirci",
        subtitle: "HSD Ambassador",
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
        subtitle: "Front-end Developer",
        description: "Merhaba ben Tunahan. ...",
        email: "tuna.akargul@gmail.com",
        image: "/team/tunahan.png",
        location: "İstanbul",
        instagram: "https://www.instagram.com/tunahan.akargul/",
        linkedin: "https://www.linkedin.com/in/tunahan-akarg%C3%BCl-b7a7a9208/",
        github: "https://github.com/tunahan-akargul",
        x: "https://x.com/TunahanAka7260",
        website: "https://tunahanakargul.online/",
    },
    {
        name: "Tarık Kılıç",
        subtitle: "ML Engineer",
        description:
            "Makine Öğrenmesi ve otomasyon teknolojileri alanında kendini geliştiren bir yazılımcı adayıyım.",
        email: "tedtkilic@gmail.com",
        github: "https://github.com/TedT002",
        linkedin:
            "https://www.linkedin.com/in/tar%C4%B1k-k%C4%B1l%C4%B1%C3%A7-73544733b/",
        location: "İstanbul",
        image: "/team/tarik31.jpeg",
        instagram: "https://www.instagram.com/tedt_emmett_brown/",
    },
    {
        name: "Çağrı Aydemir",
        subtitle: "Unreal Game Developer",
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
    {
        name: "Hasan Böcek",
        subtitle: "Backend Developer",
        description: "Backend dev for 7 years, tennis player.",
        location: "Antalya",
        linkedin: "https://www.linkedin.com/in/hasanbocek/",
        github: "https://github.com/HasanBocek",
        email: "contact@hasanbocek.com",
        website: "https://hasanbocek.com",
        image: "/team/hasan.png",
    },
] as const;

const palette = [
    { border: "#000000", gradient: "#FFDE00" }, // Neo Yellow
    { border: "#000000", gradient: "#FF6B6B" }, // Neo Pink
    { border: "#000000", gradient: "#4ECDC4" }, // Neo Blue
    { border: "#000000", gradient: "#70D6FF" }, // Neo Green
    { border: "#000000", gradient: "#9B5DE5" }, // Neo Purple
    { border: "#000000", gradient: "#F15BB5" }, // Neo Orange
] as const;

export default function Team() {
    const sectionRef = useRef<HTMLElement>(null);
    const titleRef = useRef(null);
    const gridRef = useRef(null);

    useGSAP(() => {
        gsap.from(titleRef.current, {
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 60%",
                toggleActions: "play none none reverse",
            },
            x: -100,
            rotation: -10,
            opacity: 0,
            duration: 1,
            ease: "elastic.out(1, 0.75)",
        });

        // Grid animation is handled inside ChromaGrid or we can animate the container
        gsap.from(gridRef.current, {
            scrollTrigger: {
                trigger: gridRef.current,
                start: "top 60%",
                toggleActions: "play none none reverse",
            },
            scale: 0.8,
            opacity: 0,
            duration: 1,
            ease: "elastic.out(1, 0.75)",
        });
    }, { scope: sectionRef });

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
            className="relative py-20 bg-white border-b-4 border-black"
        >
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 ref={titleRef} className="inline-block text-4xl sm:text-5xl font-black text-black mb-6 bg-neo-green border-4 border-black shadow-neo px-6 py-2 transform -rotate-1">
                        Ekibimiz
                    </h2>
                    <p className="text-xl font-bold text-black max-w-3xl mx-auto mt-4">
                        Yazılım tutkusuyla bir araya gelmiş, yenilikçi ve dinamik ekibimizle tanışın.
                    </p>
                </div>

                <div ref={gridRef}>
                    <ChromaGrid items={chromaItems} className="justify-center" />
                </div>
            </div>
        </section>
    );
}
