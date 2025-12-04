"use client";
import { useRef, useMemo, useState, useEffect } from "react";
import ChromaGrid from "./ChromaGrid";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "../_context/LanguageContext";

gsap.registerPlugin(ScrollTrigger);

interface Department {
    _id: string;
    name: string;
    slug: string;
    color: string;
}

export interface TeamMember {
    _id?: string;
    name: string;
    email?: string;
    photo?: string;
    image?: string;
    role?: string;
    subtitle?: string;
    departmentId?: Department;
    title?: string;
    description?: string;
    location?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
    x?: string;
    website?: string;
    freelance?: string;
    handle?: string;
    order?: number;
}

const palette = [
    { border: "#000000", gradient: "#FFDE00" },
    { border: "#000000", gradient: "#FF6B6B" },
    { border: "#000000", gradient: "#4ECDC4" },
    { border: "#000000", gradient: "#70D6FF" },
    { border: "#000000", gradient: "#9B5DE5" },
    { border: "#000000", gradient: "#F15BB5" },
] as const;

const roleOrder: Record<string, number> = {
    'president': 0,
    'vice_president': 1,
    'head': 2,
    'featured': 3,
    'member': 4,
};

export default function Team() {
    const sectionRef = useRef<HTMLElement>(null);
    const titleRef = useRef(null);
    const gridRef = useRef(null);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const { language, t } = useLanguage();

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await fetch('/api/team?showInTeam=true');
                if (res.ok) {
                    const data = await res.json();
                    // Sort by role priority, then by order
                    const sorted = data.sort((a: TeamMember, b: TeamMember) => {
                        const roleA = a.role ? roleOrder[a.role] ?? 99 : 99;
                        const roleB = b.role ? roleOrder[b.role] ?? 99 : 99;
                        if (roleA !== roleB) return roleA - roleB;
                        return (a.order ?? 0) - (b.order ?? 0);
                    });
                    setMembers(sorted);
                }
            } catch (error) {
                console.error('Ekip verisi yüklenemedi:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    useGSAP(() => {
        if (!titleRef.current || !sectionRef.current || !gridRef.current) return;

        gsap.fromTo(titleRef.current,
            {
                x: -100,
                rotation: -10,
                opacity: 0,
            },
            {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 60%",
                    toggleActions: "play none none reverse",
                },
                x: 0,
                rotation: -1,
                opacity: 1,
                duration: 1,
                ease: "elastic.out(1, 0.75)",
            }
        );

        gsap.fromTo(gridRef.current,
            {
                scale: 0.8,
                opacity: 0,
            },
            {
                scrollTrigger: {
                    trigger: gridRef.current,
                    start: "top 60%",
                    toggleActions: "play none none reverse",
                },
                scale: 1,
                opacity: 1,
                duration: 1,
                ease: "elastic.out(1, 0.75)",
            }
        );
    }, { scope: sectionRef, dependencies: [members] });

    const chromaItems = useMemo(() => {
        return members.map((m, i) => {
            const p = palette[i % palette.length];

            // Format subtitle based on role with language support
            let subtitle = m.title;
            if (m.role === 'president') subtitle = language === 'tr' ? 'Kulüp Başkanı' : 'Club President';
            else if (m.role === 'vice_president') subtitle = language === 'tr' ? 'Başkan Yardımcısı' : 'Vice President';
            else if (m.role === 'head' && m.departmentId)
                subtitle = language === 'tr' ? `${m.departmentId.name} Başkanı` : `${m.departmentId.name} Head`;

            return {
                image: m.photo || '/team/default.png',
                name: m.name,
                handle: undefined,
                email: m.email,
                borderColor: p.border,
                subtitle,
                description: m.description,
                gradient: p.gradient,
                github: m.github,
                x: m.x,
                instagram: m.instagram,
                website: m.website,
                linkedin: m.linkedin,
                location: m.location,
                freelance: undefined,
            };
        });
    }, [members, language]);

    if (loading) {
        return (
            <section id="team" className="relative py-20 bg-white border-b-4 border-black">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-block bg-neo-green border-4 border-black shadow-neo px-6 py-2 transform -rotate-1">
                            <h2 className="text-4xl sm:text-5xl font-black text-black">{t('team.title')}</h2>
                        </div>
                        <p className="text-xl font-bold text-black mt-8 animate-pulse">{t('common.loading')}</p>
                    </div>
                </div>
            </section>
        );
    }

    if (members.length === 0) {
        return (
            <section id="team" className="relative py-20 bg-white border-b-4 border-black">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-block bg-neo-green border-4 border-black shadow-neo px-6 py-2 transform -rotate-1">
                            <h2 className="text-4xl sm:text-5xl font-black text-black">{t('team.title')}</h2>
                        </div>
                        <p className="text-xl font-bold text-black mt-8">
                            {language === 'tr' ? 'Yakında ekibimizle tanışacaksınız!' : 'Meet our team soon!'}
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section
            ref={sectionRef}
            id="team"
            className="relative py-20 bg-white border-b-4 border-black"
        >
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 ref={titleRef} className="inline-block text-4xl sm:text-5xl font-black text-black mb-6 bg-neo-green border-4 border-black shadow-neo px-6 py-2 transform -rotate-1">
                        {t('team.title')}
                    </h2>
                    <p className="text-xl font-bold text-black max-w-3xl mx-auto mt-4">
                        {language === 'tr'
                            ? 'Yazılım tutkusuyla bir araya gelmiş, yenilikçi ve dinamik ekibimizle tanışın.'
                            : 'Meet our innovative and dynamic team, united by a passion for software.'}
                    </p>
                </div>

                <div ref={gridRef}>
                    <ChromaGrid items={chromaItems} className="justify-center" />
                </div>
            </div>
        </section>
    );
}
