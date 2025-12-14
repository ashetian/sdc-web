'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { SkeletonList } from '@/app/_components/Skeleton';
import Image from 'next/image';
import { useLanguage } from '../../_context/LanguageContext';
import BookmarkButton from '@/app/_components/BookmarkButton';
import LikeButton from '@/app/_components/LikeButton';
import dynamic from "next/dynamic";
const CommentSection = dynamic(() => import('@/app/_components/CommentSection'), { ssr: false });
import type { Project } from '../../lib/types/api';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { language, t } = useLanguage();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProject();
    }, [id]);

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${id}`);
            if (res.ok) {
                const data = await res.json();
                setProject(data);
            }
        } catch (err) {
            console.error('Project fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getGithubPreview = (githubUrl: string) => {
        const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (match) {
            return `https://opengraph.githubassets.com/1/${match[1]}/${match[2]}`;
        }
        return '/sdclogo.png';
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center pt-24">
                <SkeletonList items={5} />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center pt-24">
                <div className="text-xl font-bold mb-4">{t('projects.detail.notFound')}</div>
                <Link href="/projects" className="text-blue-600 hover:underline">{t('projects.detail.back')}</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-24 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back Link */}
                <Link href="/projects" className="inline-flex items-center text-black font-bold mb-6 hover:underline">
                    ← {t('projects.detail.back')}
                </Link>

                {/* Project Card */}
                <div className="bg-white border-4 border-black shadow-neo overflow-hidden mb-8">
                    {/* Preview Image */}
                    <div className="relative h-64 border-b-4 border-black">
                        <Image
                            src={getGithubPreview(project.githubUrl ?? '')}
                            alt={project.title}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>

                    <div className="p-8">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <h1 className="text-3xl font-black text-black">
                                {language === 'en' && project.titleEn ? project.titleEn : project.title}
                            </h1>
                            <div className="flex items-center gap-3">
                                <LikeButton contentType="project" contentId={project._id} />
                                <BookmarkButton contentType="project" contentId={project._id} />
                            </div>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                            <span>{project.viewCount} {t('projects.detail.views')}</span>
                            <span>•</span>
                            <span>{formatDate(project.createdAt ?? '')}</span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-800 text-lg mb-6 whitespace-pre-wrap">
                            {language === 'en' && project.descriptionEn ? project.descriptionEn : project.description}
                        </p>

                        {/* Technologies */}
                        {project.technologies && project.technologies.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-black text-black mb-2">{t('projects.detail.technologies')}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.technologies.map((tech, i) => (
                                        <span key={i} className="px-3 py-1 bg-neo-purple text-white font-bold border-2 border-black">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Author */}
                        {project.author && (
                            <div className="mb-6 p-4 bg-gray-50 border-2 border-black">
                                <h3 className="font-black text-black mb-2">{t('projects.detail.developer')}</h3>
                                <p className="font-bold">{project.author.nickname}</p>
                                {project.author.fullName && <p className="text-gray-600">{project.author.fullName}</p>}
                                {project.author.department && <p className="text-gray-500 text-sm">{project.author.department}</p>}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black hover:shadow-neo transition-all uppercase"
                            >
                                {t('projects.detail.github')}
                            </a>
                            {project.demoUrl && (
                                <a
                                    href={project.demoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 bg-neo-green text-black font-bold border-2 border-black hover:shadow-neo transition-all uppercase"
                                >
                                    {t('projects.detail.demo')}
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <CommentSection contentType="project" contentId={project._id} />
            </div>
        </div>
    );
}
