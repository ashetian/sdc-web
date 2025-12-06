"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../_context/LanguageContext";

interface Article {
    slug: string;
    title: string;
    titleEn?: string;
    date: string;
    dateEn?: string;
    description: string;
    descriptionEn?: string;
    image?: string;
    isDraft: boolean;
    isArchived?: boolean;
}

export default function ArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();

    useEffect(() => {
        async function loadArticles() {
            try {
                const res = await fetch("/api/announcements?type=article");
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                const activeArticles = data.filter(
                    (a: Article) => !a.isDraft && !a.isArchived
                );
                setArticles(activeArticles);
            } catch (error) {
                console.error("Error loading articles:", error);
            } finally {
                setLoading(false);
            }
        }
        loadArticles();
    }, []);

    const getText = (tr: string | undefined, en: string | undefined) => {
        if (language === 'en' && en) return en;
        return tr || '';
    };

    const labels = {
        tr: {
            title: 'Makaleler',
            subtitle: 'Kulübümüzün blog yazıları ve makaleleri',
            backHome: '← Ana Sayfa',
            noArticles: 'Henüz makale bulunmuyor.',
            readMore: 'Devamını Oku →'
        },
        en: {
            title: 'Articles',
            subtitle: 'Blog posts and articles from our club',
            backHome: '← Home',
            noArticles: 'No articles yet.',
            readMore: 'Read More →'
        }
    };

    const l = labels[language];

    if (loading) {
        return (
            <div className="min-h-screen bg-neo-yellow flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-black border-t-transparent animate-spin" />
            </div>
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

                {/* Articles Grid */}
                {articles.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-2xl font-bold text-gray-500">{l.noArticles}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => (
                            <Link
                                href={`/articles/${article.slug}`}
                                key={article.slug}
                                className="group bg-white border-4 border-black shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all"
                            >
                                {article.image && (
                                    <div className="relative aspect-video border-b-4 border-black overflow-hidden">
                                        <Image
                                            src={article.image}
                                            alt={getText(article.title, article.titleEn)}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                )}
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-2 py-1 text-xs font-bold uppercase border-2 border-black bg-neo-peach text-black">
                                            {language === 'tr' ? 'Makale' : 'Article'}
                                        </span>
                                        <time className="text-xs font-bold text-gray-600">
                                            {getText(article.date, article.dateEn)}
                                        </time>
                                    </div>
                                    <h3 className="text-xl font-black text-black mb-3 line-clamp-2 group-hover:text-neo-purple transition-colors" lang={language}>
                                        {getText(article.title, article.titleEn)}
                                    </h3>
                                    <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                                        {getText(article.description, article.descriptionEn)}
                                    </p>
                                    <span className="text-sm font-bold text-neo-purple group-hover:underline">
                                        {l.readMore}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
