'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../_context/LanguageContext";
import { SkeletonCardGrid, SkeletonPageHeader, SkeletonFullPage } from "@/app/_components/Skeleton";
import Pagination from "@/app/_components/Pagination";
import type { Announcement } from "../lib/types/api";

const ITEMS_PER_PAGE = 12;

export default function AnnouncementsPage() {
    const [activeTab, setActiveTab] = useState<'announcements' | 'opportunities'>('announcements');
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const { language, t } = useLanguage();

    const loadAnnouncements = async (pageNum: number, append: boolean = false) => {
        if (pageNum === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const typeParam = activeTab === 'announcements'
                ? '&type=event&type=news&type=article'
                : '&type=opportunity';
            const res = await fetch(`/api/announcements?active=true&page=${pageNum}&limit=${ITEMS_PER_PAGE}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();

            // Handle paginated response
            const items = data.items || data;

            // Filter based on active tab
            const filteredData = items.filter((item: Announcement) => {
                if (item.isDraft || item.isArchived) return false;
                if (activeTab === 'announcements') {
                    return ['event', 'news', 'article'].includes(item.type);
                } else {
                    return item.type === 'opportunity';
                }
            });

            if (append) {
                setAnnouncements(prev => [...prev, ...filteredData]);
            } else {
                setAnnouncements(filteredData);
            }

            setHasMore(data.hasMore ?? false);
            setTotalPages(data.totalPages ?? 1);
            setPage(pageNum);
        } catch (error) {
            console.error("Error loading announcements:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        setPage(1);
        setAnnouncements([]);
        loadAnnouncements(1, false);
    }, [activeTab]);

    const handleLoadMore = () => {
        loadAnnouncements(page + 1, true);
    };

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
        return t(`announcements.types.${type}` as any);
    };

    const getText = (tr: string | undefined, en: string | undefined) => {
        if (language === 'en' && en) return en;
        return tr || '';
    };

    const renderContent = () => {
        if (loading) return <SkeletonCardGrid />;

        if (announcements.length === 0) {
            return (
                <div className="text-center py-20">
                    <p className="text-2xl font-bold text-gray-500">
                        {t(`announcements.noContent.${activeTab}` as any)}
                    </p>
                </div>
            );
        }

        return (
            <>
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

                                {announcement.type === 'opportunity' && (
                                    <div className="mt-auto pt-2">
                                        <span className="inline-block text-xs font-black text-neo-purple hover:underline">
                                            {t('announcements.details')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Load More Pagination */}
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handleLoadMore}
                    mode="loadMore"
                    hasMore={hasMore}
                    loading={loadingMore}
                />
            </>
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
                        ← {t('announcements.detail.backHome')}
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
                            {t('announcements.tabs.announcements')}
                        </button>
                        <button
                            onClick={() => setActiveTab('opportunities')}
                            className={`flex-1 px-4 py-3 font-black uppercase transition-all border-4 text-sm md:text-base ${activeTab === 'opportunities'
                                ? 'bg-neo-lime text-black border-black shadow-neo transform -translate-y-1'
                                : 'bg-white text-gray-500 border-gray-300 hover:border-black hover:text-black'
                                }`}
                        >
                            {t('announcements.tabs.opportunities')}
                        </button>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-black uppercase mb-4 tracking-tight">
                        {t(`announcements.titles.${activeTab}` as any)}
                    </h1>
                    <p className="text-xl font-bold text-gray-600 max-w-2xl">
                        {t(`announcements.subtitles.${activeTab}` as any)}
                    </p>
                </div>

                {/* Content */}
                {renderContent()}
            </div>
        </div>
    );
}
