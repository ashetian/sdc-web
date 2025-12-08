"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../_context/LanguageContext";
import { SkeletonCardGrid, SkeletonPageHeader, SkeletonFullPage } from "@/app/_components/Skeleton";

interface Announcement {
    slug: string;
    title: string;
    titleEn?: string;
    date: string;
    dateEn?: string;
    description: string;
    descriptionEn?: string;
    type: "event" | "news" | "article" | "opportunity";
    image?: string;
    isDraft: boolean;
    isArchived?: boolean;
}

export default function AnnouncementsPage() {
    const [activeTab, setActiveTab] = useState<'announcements' | 'opportunities'>('announcements');
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();

    useEffect(() => {
        async function loadAnnouncements() {
            setLoading(true);
            try {
                const res = await fetch("/api/announcements");
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();

                // Filter based on active tab and status
                const filteredData = data.filter((item: Announcement) => {
                    if (item.isDraft || item.isArchived) return false;

                    if (activeTab === 'announcements') {
                        return ['event', 'news', 'article'].includes(item.type);
                    } else {
                        return item.type === 'opportunity';
                    }
                });

                setAnnouncements(filteredData);
            } catch (error) {
                console.error("Error loading announcements:", error);
            } finally {
                setLoading(false);
            }
        }
        loadAnnouncements();
    }, [activeTab]);

    const getTypeStyles = (type: Announcement["type"]) => {
        switch (type) {
            case "event": return "bg-neo-purple text-white";
            case "news": return "bg-neo-blue text-black";
            case "article": return "bg-neo-green text-black";
            case "opportunity": return "bg-neo-lime text-black";
            default: return "bg-gray-200 text-black";
        }
    };

    const getTypeText = (type: Announcement["type"]) => {
        const typeLabels = {
            tr: { event: "Etkinlik", news: "Duyuru", article: "Makale", opportunity: "Fırsat" },
            en: { event: "Event", news: "News", article: "Article", opportunity: "Opportunity" }
        };
        return typeLabels[language][type] || type;
    };

    const getText = (tr: string | undefined, en: string | undefined) => {
        if (language === 'en' && en) return en;
        return tr || '';
    };

    const labels = {
        tr: {
            titleMap: {
                announcements: 'Duyurular',
                opportunities: 'Fırsatlar'
            },
            subtitleMap: {
                announcements: 'Kulübümüzden en son haberler, etkinlikler ve gelişmeler.',
                opportunities: 'Stajlar, yarışmalar, hackathonlar ve kariyer fırsatları.'
            },
            backHome: '← Ana Sayfa',
            noAnnouncementsMap: {
                announcements: 'Henüz duyuru bulunmuyor.',
                opportunities: 'Şu an aktif bir fırsat bulunmuyor.'
            },
            tabs: {
                announcements: 'DUYURULAR',
                opportunities: 'FIRSATLAR'
            }
        },
        en: {
            titleMap: {
                announcements: 'Announcements',
                opportunities: 'Opportunities'
            },
            subtitleMap: {
                announcements: 'Latest news, events and updates from our club.',
                opportunities: 'Internships, competitions, hackathons and career opportunities.'
            },
            backHome: '← Home',
            noAnnouncementsMap: {
                announcements: 'No announcements yet.',
                opportunities: 'No active opportunities at the moment.'
            },
            tabs: {
                announcements: 'ANNOUNCEMENTS',
                opportunities: 'OPPORTUNITIES'
            }
        }
    };

    const l = labels[language];

    // Separate loading logic for better UX
    const renderContent = () => {
        if (loading) return <SkeletonCardGrid />;

        if (announcements.length === 0) {
            return (
                <div className="text-center py-20">
                    <p className="text-2xl font-bold text-gray-500">
                        {l.noAnnouncementsMap[activeTab]}
                    </p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {announcements.map((announcement) => (
                    <Link
                        href={`/announcements/${announcement.slug}`}
                        key={announcement.slug}
                        className="group bg-white border-4 border-black shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all flex flex-col h-full"
                    >
                        {announcement.image && (
                            <div className="relative aspect-video border-b-4 border-black overflow-hidden flex-shrink-0">
                                <Image
                                    src={announcement.image}
                                    alt={getText(announcement.title, announcement.titleEn)}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform"
                                />
                            </div>
                        )}
                        <div className="p-4 flex flex-col flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`px-2 py-1 text-xs font-bold uppercase border-2 border-black ${getTypeStyles(announcement.type)}`}>
                                    {getTypeText(announcement.type)}
                                </span>
                                <time className="text-xs font-bold text-gray-600">
                                    {getText(announcement.date, announcement.dateEn)}
                                </time>
                            </div>
                            <h3 className="text-lg font-black text-black uppercase mb-2 line-clamp-2 group-hover:text-neo-purple transition-colors" lang={language}>
                                {getText(announcement.title, announcement.titleEn)}
                            </h3>
                            <p className="text-sm text-gray-700 line-clamp-3 mb-4 flex-1">
                                {getText(announcement.description, announcement.descriptionEn)}
                            </p>

                            {/* Link Button Preview if available (simplified for card) */}
                            {announcement.type === 'opportunity' && (
                                <div className="mt-auto pt-2">
                                    <span className="inline-block text-xs font-black text-neo-purple hover:underline">
                                        DETAYLARI GÖR →
                                    </span>
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col items-center mb-12 text-center">
                    <Link
                        href="/"
                        className="self-start text-black font-bold hover:underline mb-4 md:absolute md:left-8 top-32"
                    >
                        {l.backHome}
                    </Link>


                    {/* Tab Toggle */}
                    <div className="flex items-center justify-center gap-4 mt-8 mb-6 w-full max-w-md">
                        <button
                            onClick={() => setActiveTab('announcements')}
                            className={`flex-1 px-4 py-3 font-black uppercase transition-all border-4 text-sm md:text-base ${activeTab === 'announcements'
                                ? 'bg-neo-purple text-black border-black shadow-neo transform -translate-y-1'
                                : 'bg-white text-gray-500 border-gray-300 hover:border-black hover:text-black'
                                }`}
                        >
                            {l.tabs.announcements}
                        </button>
                        <button
                            onClick={() => setActiveTab('opportunities')}
                            className={`flex-1 px-4 py-3 font-black uppercase transition-all border-4 text-sm md:text-base ${activeTab === 'opportunities'
                                ? 'bg-neo-lime text-black border-black shadow-neo transform -translate-y-1'
                                : 'bg-white text-gray-500 border-gray-300 hover:border-black hover:text-black'
                                }`}
                        >
                            {l.tabs.opportunities}
                        </button>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-black uppercase mb-4 tracking-tight">
                        {l.titleMap[activeTab]}
                    </h1>
                    <p className="text-xl font-bold text-gray-600 max-w-2xl">
                        {l.subtitleMap[activeTab]}
                    </p>
                </div>

                {/* Content */}
                {renderContent()}
            </div>
        </div>
    );
}
