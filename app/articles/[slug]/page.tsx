"use client";
import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../../_context/LanguageContext";
import ShareButtons from "../../_components/ShareButtons";
import ImageLightbox from "../../_components/ImageLightbox";
import CommentSection from "../../_components/CommentSection";
import { SkeletonList, SkeletonPageHeader, SkeletonFullPage } from "@/app/_components/Skeleton";
import type { Announcement } from "../../lib/types/api";

// Local type for article-specific content blocks (simplified version)
interface ArticleContentBlock {
    id: string;
    type: "text" | "image" | "image-grid";
    content?: string;
    contentEn?: string;
    image?: string;
    images?: string[];
}

// Article uses Announcement base but with article-specific content blocks
type Article = Omit<Announcement, 'contentBlocks' | 'contentBlocksEn'> & {
    contentBlocks?: ArticleContentBlock[];
    contentBlocksEn?: ArticleContentBlock[];
};

export default function ArticlePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = use(params);
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();

    const labels = {
        tr: {
            notFound: 'Makale Bulunamadı',
            notFoundDesc: 'Aradığınız makale bulunamadı veya kaldırılmış olabilir.',
            backHome: 'Ana Sayfaya Dön',
            backArticles: '← Tüm Makaleler',
            article: 'Makale'
        },
        en: {
            notFound: 'Article Not Found',
            notFoundDesc: 'The article you are looking for could not be found or has been removed.',
            backHome: 'Back to Home',
            backArticles: '← All Articles',
            article: 'Article'
        }
    };

    const l = labels[language];

    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch(`/api/announcements/${slug}`);
                if (!res.ok) throw new Error("Makale yüklenemedi");
                const data = await res.json();
                if (data.isDraft || data.type !== 'article') {
                    setArticle(null);
                } else {
                    setArticle(data);
                }
            } catch (error) {
                console.error("Makale yüklenirken hata:", error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [slug]);

    const getTitle = () => {
        if (!article) return '';
        if (language === 'en' && article.titleEn) return article.titleEn;
        return article.title;
    };

    const getContent = () => {
        if (!article) return '';
        if (language === 'en' && article.contentEn) return article.contentEn;
        return article.content;
    };

    const getDescription = () => {
        if (!article) return '';
        if (language === 'en' && article.descriptionEn) return article.descriptionEn;
        return article.description;
    };

    if (loading) {
        return (
            <SkeletonFullPage>
                <SkeletonPageHeader />
                <SkeletonList items={5} />
            </SkeletonFullPage>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-neo-yellow py-20 flex items-center justify-center">
                <div className="bg-white border-4 border-black shadow-neo p-8 transform rotate-1 text-center">
                    <h1 className="text-4xl font-black text-black mb-4">{l.notFound}</h1>
                    <p className="text-xl font-bold text-black mb-8">
                        {l.notFoundDesc}
                    </p>
                    <Link
                        href="/articles"
                        className="inline-block bg-black text-white px-6 py-3 border-4 border-transparent hover:bg-white hover:text-black hover:border-black hover:shadow-neo transition-all font-bold uppercase"
                    >
                        {l.backArticles}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <article className="min-h-screen bg-neo-yellow py-20 pt-40 border-b-4 border-black">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                <Link
                    href="/articles"
                    className="inline-block text-black font-bold hover:underline mb-6"
                >
                    {l.backArticles}
                </Link>

                <div className="bg-white border-4 border-black shadow-neo-lg p-8 transform -rotate-1">
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="px-4 py-2 bg-neo-cyan text-neo-black font-black uppercase border-2 border-neo-black shadow-neo">
                                {l.article}
                            </span>
                            <time className="text-sm font-bold text-black bg-gray-100 px-2 py-1 border-2 border-black shadow-neo-sm">
                                {language === 'en' && article.dateEn ? article.dateEn : article.date}
                            </time>
                        </div>

                        <h1 className="text-4xl sm:text-5xl font-black text-black mb-6 leading-tight">
                            {getTitle()}
                        </h1>
                    </div>

                    <div className="prose prose-lg max-w-none mb-12">
                        {article.image && !article.contentBlocks?.length && (
                            <div className="float-left mr-6 mb-4 border-4 border-black shadow-neo w-full sm:w-64 clearfix">
                                <ImageLightbox
                                    src={article.image}
                                    alt={getTitle()}
                                    width={256}
                                    height={256}
                                    className="w-full object-cover"
                                />
                            </div>
                        )}

                        {/* Render content blocks if available */}
                        {article.contentBlocks && article.contentBlocks.length > 0 ? (
                            <div className="space-y-6 clear-both">
                                {article.contentBlocks.map((block) => {
                                    const content = language === 'en' && block.contentEn ? block.contentEn : block.content;

                                    if (block.type === 'text' && content) {
                                        return (
                                            <div key={block.id}>
                                                {content.split("\n").map((paragraph: string, idx: number) => (
                                                    <p key={idx} className="text-black font-medium mb-4 leading-relaxed">
                                                        {paragraph}
                                                    </p>
                                                ))}
                                            </div>
                                        );
                                    }

                                    if (block.type === 'image' && block.image) {
                                        return (
                                            <div key={block.id} className="my-6">
                                                <ImageLightbox
                                                    src={block.image}
                                                    alt="Makale görseli"
                                                    width={800}
                                                    height={600}
                                                    className="w-full max-w-2xl border-4 border-black shadow-neo"
                                                />
                                            </div>
                                        );
                                    }

                                    if (block.type === 'image-grid' && block.images && block.images.length > 0) {
                                        return (
                                            <div key={block.id} className="my-6 grid grid-cols-2 gap-4">
                                                {block.images.filter(img => img).map((img, idx) => (
                                                    <ImageLightbox
                                                        key={idx}
                                                        src={img}
                                                        alt={`Görsel ${idx + 1}`}
                                                        width={400}
                                                        height={300}
                                                        className="w-full border-4 border-black shadow-neo"
                                                    />
                                                ))}
                                            </div>
                                        );
                                    }

                                    return null;
                                })}
                            </div>
                        ) : (
                            <div className="clearfix">
                                {getContent()
                                    .split("\n")
                                    .map((paragraph: string, index: number) => (
                                        <p key={index} className="text-black font-medium mb-4 leading-relaxed">
                                            {paragraph}
                                        </p>
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* Share Buttons */}
                    <div className="mt-8 pt-6 border-t-2 border-gray-200">
                        <ShareButtons
                            url={typeof window !== 'undefined' ? window.location.href : `https://ktusdc.com/articles/${slug}`}
                            title={getTitle()}
                            description={getDescription()}
                        />
                    </div>

                    <div className="mt-8 border-t-4 border-black pt-8 flex justify-center">
                        <Link
                            href="/articles"
                            className="inline-flex items-center text-black font-black uppercase hover:underline decoration-4 decoration-neo-purple underline-offset-4 transition-all"
                        >
                            <svg
                                className="w-6 h-6 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={4}
                            >
                                <path
                                    strokeLinecap="square"
                                    strokeLinejoin="miter"
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            {l.backArticles}
                        </Link>
                    </div>
                </div>

                {/* Comments Section */}
                <CommentSection contentType="announcement" contentId={article._id} />
            </div>
        </article>
    );
}
