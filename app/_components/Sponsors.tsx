"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useLanguage } from "../_context/LanguageContext";
import { X } from "lucide-react";

interface Sponsor {
    _id: string;
    name: string;
    nameEn?: string;
    description: string;
    descriptionEn?: string;
    logo: string;
}

export default function Sponsors() {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const { language } = useLanguage();
    const marqueeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function loadSponsors() {
            try {
                const res = await fetch("/api/sponsors?active=true");
                if (res.ok) {
                    const data = await res.json();
                    setSponsors(data);
                }
            } catch (error) {
                console.error("Sponsors load error:", error);
            }
        }
        loadSponsors();
    }, []);

    const getText = (tr: string, en?: string) => {
        if (language === 'en' && en) return en;
        return tr;
    };

    const labels = {
        tr: { title: 'Sponsorlarımız & Partnerlerimiz', close: 'Kapat' },
        en: { title: 'Our Sponsors & Partners', close: 'Close' }
    };

    const l = labels[language] || labels.tr;

    if (sponsors.length === 0) return null;

    // Calculate placeholders needed to fill viewport (~1920px / 160px per item = 12 items)
    const itemsToFillScreen = 12;
    const ghostCount = Math.max(itemsToFillScreen - sponsors.length, 0);
    const ghosts = Array(ghostCount).fill(null);

    return (
        <section className="py-8 bg-black border-t-4 border-b-4 border-black overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 mb-4">
                <h2 className="text-xl font-black text-white text-center uppercase tracking-wider">
                    {l.title}
                </h2>
            </div>

            <div
                className="relative"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div
                    ref={marqueeRef}
                    className="marquee-container flex gap-8"
                    style={{
                        width: 'max-content',
                        animationPlayState: isPaused ? 'paused' : 'running',
                    }}
                >
                    {/* Real sponsors */}
                    {sponsors.map((sponsor) => (
                        <button
                            key={sponsor._id}
                            onClick={() => setSelectedSponsor(sponsor)}
                            className="flex-shrink-0 w-32 h-20 bg-white border-4 border-white hover:border-neo-green transition-colors p-2 group"
                        >
                            <div className="relative w-full h-full">
                                <Image
                                    src={sponsor.logo}
                                    alt={getText(sponsor.name, sponsor.nameEn)}
                                    fill
                                    className="object-contain filter grayscale group-hover:grayscale-0 transition-all"
                                />
                            </div>
                        </button>
                    ))}

                    {/* Ghost placeholders - only if needed to fill screen */}
                    {ghosts.map((_, idx) => (
                        <div
                            key={`ghost-${idx}`}
                            className="flex-shrink-0 w-32 h-20 opacity-0"
                        />
                    ))}

                    {/* Duplicate sponsors for seamless loop */}
                    {sponsors.map((sponsor) => (
                        <button
                            key={`dup-${sponsor._id}`}
                            onClick={() => setSelectedSponsor(sponsor)}
                            className="flex-shrink-0 w-32 h-20 bg-white border-4 border-white hover:border-neo-green transition-colors p-2 group"
                        >
                            <div className="relative w-full h-full">
                                <Image
                                    src={sponsor.logo}
                                    alt={getText(sponsor.name, sponsor.nameEn)}
                                    fill
                                    className="object-contain filter grayscale group-hover:grayscale-0 transition-all"
                                />
                            </div>
                        </button>
                    ))}

                    {/* Ghost placeholders for second set */}
                    {ghosts.map((_, idx) => (
                        <div
                            key={`ghost2-${idx}`}
                            className="flex-shrink-0 w-32 h-20 opacity-0"
                        />
                    ))}
                </div>
            </div>

            {/* Sponsor Detail Modal */}
            {selectedSponsor && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setSelectedSponsor(null)}
                >
                    <div
                        className="bg-white border-4 border-black shadow-neo max-w-md w-full p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-2xl font-black">
                                {getText(selectedSponsor.name, selectedSponsor.nameEn)}
                            </h3>
                            <button
                                onClick={() => setSelectedSponsor(null)}
                                className="p-1 hover:bg-gray-100 border-2 border-black"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="relative w-full h-32 bg-gray-100 border-2 border-black mb-4">
                            <Image
                                src={selectedSponsor.logo}
                                alt={getText(selectedSponsor.name, selectedSponsor.nameEn)}
                                fill
                                className="object-contain p-4"
                            />
                        </div>

                        <p className="text-gray-700">
                            {getText(selectedSponsor.description, selectedSponsor.descriptionEn)}
                        </p>

                        <button
                            onClick={() => setSelectedSponsor(null)}
                            className="mt-4 w-full py-2 bg-black text-white font-bold border-2 border-black hover:bg-gray-800"
                        >
                            {l.close}
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes marquee {
                    0% {
                        transform: translateX(-50%);
                    }
                    100% {
                        transform: translateX(0);
                    }
                }

                .marquee-container {
                    animation: marquee 20s linear infinite;
                }
            `}</style>
        </section>
    );
}
