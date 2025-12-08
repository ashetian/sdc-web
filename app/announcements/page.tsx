"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../_context/LanguageContext";
import ImageLightbox from "../_components/ImageLightbox";
import { SkeletonCardGrid, SkeletonPageHeader, SkeletonFullPage } from "@/app/_components/Skeleton";

interface Announcement {
    slug: string;
    title: string;
    titleEn?: string;
    date: string;
    dateEn?: string;
    description: string;
    descriptionEn?: string;
    type: "event" | "news" | "workshop";
    image?: string;
    isDraft: boolean;
    isArchived?: boolean;
}

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();

    useEffect(() => {
        async function loadAnnouncements() {
            try {
                const res = await fetch("/api/announcements");
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                const activeAnnouncements = data.filter(
                    (a: Announcement) => !a.isDraft && !a.isArchived
                );
                setAnnouncements(activeAnnouncements);
            } catch (error) {
                console.error("Error loading announcements:", error);
            } finally {
                setLoading(false);
            }
        }
        loadAnnouncements();
    }, []);

    const getTypeStyles = (type: Announcement["type"]) => {
        switch (type) {
            case "event": return "bg-neo-purple text-white";
            case "news": return "bg-neo-blue text-black";
            case "workshop": return "bg-neo-green text-black";
        }
    };

    const getTypeText = (type: Announcement["type"]) => {
        const typeLabels = {
            tr: { event: "Etkinlik", news: "Duyuru", workshop: "Workshop" },
            en: { event: "Event", news: "News", workshop: "Workshop" }
        };
        return typeLabels[language][type];
    };

    const getText = (tr: string | undefined, en: string | undefined) => {
        if (language === 'en' && en) return en;
        return tr || '';
    };

    const labels = {
        tr: {
            title: 'Tüm Duyurular',
            subtitle: 'Kulübümüzün tüm etkinlik ve duyuruları',
            backHome: '← Ana Sayfa',
            noAnnouncements: 'Henüz duyuru bulunmuyor.'
        },
        en: {
            title: 'All Announcements',
            subtitle: 'All events and announcements from our club',
            backHome: '← Home',
            noAnnouncements: 'No announcements yet.'
        }
    };

    const l = labels[language];

    if (loading) {
        return (
            <SkeletonFullPage>
                <SkeletonPageHeader />
                <SkeletonCardGrid />
            </SkeletonFullPage>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12">
                    <Link
                        href="/"
                        className="inline-block text-black font-bold hover:underline mb-4"
                    >
                        {l.backHome}
                    </Link>
                    <h1 className="text-4xl sm:text-5xl font-black text-black uppercase mb-4" lang={language}>
                        {l.title}
                    </h1>
                    <p className="text-xl font-medium text-gray-700">{l.subtitle}</p>
                </div>

                {/* Announcements Grid */}
                {announcements.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-2xl font-bold text-gray-500">{l.noAnnouncements}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {announcements.map((announcement) => (
                            <Link
                                href={`/announcements/${announcement.slug}`}
                                key={announcement.slug}
                                className="group bg-white border-4 border-black shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all"
                            >
                                {announcement.image && (
                                    <div className="relative aspect-video border-b-4 border-black overflow-hidden">
                                        <Image
                                            src={announcement.image}
                                            alt={getText(announcement.title, announcement.titleEn)}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                )}
                                <div className="p-4">
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
                                    <p className="text-sm text-gray-700 line-clamp-2">
                                        {getText(announcement.description, announcement.descriptionEn)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
