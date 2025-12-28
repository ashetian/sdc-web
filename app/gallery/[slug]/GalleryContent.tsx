'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ShareButtons from "../../_components/ShareButtons";
import dynamic from "next/dynamic";
const CommentSection = dynamic(() => import("../../_components/CommentSection"), { ssr: false });
import BookmarkButton from "../../_components/BookmarkButton";
import LikeButton from "../../_components/LikeButton";
import ImageLightbox from "../../_components/ImageLightbox";

interface GalleryContentProps {
    announcement: {
        _id: string;
        slug: string;
        title: string;
        titleEn?: string;
        date: string;
        dateEn?: string;
        description: string;
        descriptionEn?: string;
        type: 'event' | 'news' | 'workshop' | 'article' | 'opportunity';
        galleryCover?: string;
        galleryDescription?: string;
        galleryDescriptionEn?: string;
        galleryLinks?: string[];
    };
    language: string;
    translations: {
        backToGallery: string;
        notFound: string;
        galleryImage: string;
        viewFile: string;
        types: {
            event: string;
            news: string;
            workshop: string;
        };
    };
}

function isImage(url: string) {
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) || url.includes("image/upload");
}

function isVideo(url: string) {
    return url.match(/\.(mp4|webm|mov)$/i) || url.includes("video/upload");
}

export default function GalleryContent({ announcement, language, translations }: GalleryContentProps) {
    const getTitle = () => {
        if (language === 'en' && announcement.titleEn) return announcement.titleEn;
        return announcement.title;
    };

    const getDescription = () => {
        if (language === 'en') {
            if (announcement.galleryDescriptionEn) return announcement.galleryDescriptionEn;
            if (announcement.descriptionEn) return announcement.descriptionEn;
        }
        return announcement.galleryDescription || announcement.description;
    };

    const getTypeLabel = (type: typeof announcement.type) => {
        const typeMap = {
            event: translations.types.event,
            news: translations.types.news,
            workshop: translations.types.workshop,
            article: translations.types.news,
            opportunity: translations.types.news,
        };
        return typeMap[type];
    };

    return (
        <div className="min-h-screen bg-neo-purple py-20 pt-40 border-b-4 border-black">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white border-4 border-black shadow-neo-lg p-8 transform rotate-1">
                    <Link href="/gallery" className="text-black font-black hover:underline mb-6 inline-block uppercase text-sm" lang={language}>
                        {translations.backToGallery}
                    </Link>

                    {announcement.galleryCover && (
                        <div className="mb-8 border-4 border-black shadow-neo">
                            <ImageLightbox
                                src={announcement.galleryCover}
                                alt={getTitle()}
                                width={800}
                                height={400}
                                className="w-full object-cover"
                                sizes="(max-width: 896px) 100vw, 896px"
                            />
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <span
                            className={`px-4 py-1 text-sm font-black uppercase border-2 border-black shadow-neo-sm
                ${announcement.type === "event" ? "bg-neo-purple text-white" :
                                    announcement.type === "news" ? "bg-neo-blue text-black" :
                                        "bg-neo-green text-black"}
              `}
                        >
                            {getTypeLabel(announcement.type)}
                        </span>
                        <div className="flex items-center gap-3">
                            <time className="text-sm font-bold text-black bg-gray-100 px-2 py-1 border-2 border-black shadow-neo-sm">{language === 'en' && announcement.dateEn ? announcement.dateEn : announcement.date}</time>
                            <LikeButton contentType="gallery" contentId={announcement._id} />
                            <BookmarkButton contentType="gallery" contentId={announcement._id} />
                        </div>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-black text-black mb-6 uppercase leading-tight" lang={language}>{getTitle()}</h1>

                    {(announcement.galleryDescription || announcement.galleryDescriptionEn) && (
                        <p className="text-black font-medium text-lg mb-8 whitespace-pre-line border-l-4 border-black pl-4">
                            {getDescription()}
                        </p>
                    )}

                    {announcement.galleryLinks && announcement.galleryLinks.length > 0 && (
                        <div className="space-y-8">
                            {announcement.galleryLinks.map((link, i) => (
                                <div key={i} className="w-full border-4 border-black shadow-neo bg-black p-2">
                                    {isImage(link) ? (
                                        <ImageLightbox
                                            src={link}
                                            alt={`${translations.galleryImage} ${i + 1}`}
                                            width={800}
                                            height={500}
                                            className="w-full object-contain bg-black"
                                            sizes="(max-width: 896px) 100vw, 896px"
                                        />
                                    ) : isVideo(link) ? (
                                        <video
                                            src={link}
                                            controls
                                            className="w-full bg-black"
                                        />
                                    ) : (
                                        <a href={link} className="text-white font-bold underline p-4 block text-center hover:text-neo-yellow">
                                            {translations.viewFile}
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Share Buttons */}
                    <div className="mt-8 pt-6 border-t-2 border-gray-200">
                        <ShareButtons
                            url={`https://ktusdc.com/gallery/${announcement.slug}`}
                            title={getTitle()}
                            description={getDescription()}
                        />
                    </div>
                </div>

                {/* Comments Section - Outside main content for visual separation */}
                <CommentSection contentType="gallery" contentId={announcement._id} />
            </div>
        </div>
    );
}
