'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SkeletonList, SkeletonPageHeader, SkeletonFullPage, SkeletonCardGrid } from '@/app/_components/Skeleton';
import { useLanguage } from '../../_context/LanguageContext';
import { useToast } from '../../_context/ToastContext';
import BookmarkButton from '@/app/_components/BookmarkButton';
import { Button, Alert } from '../../_components/ui';
import type { Project } from '../../lib/types/api';

export default function MyProjectsPage() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects/my');
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            } else if (res.status === 401) {
                router.push('/auth/login?returnUrl=/profile/projects');
            } else {
                setError(t('profile.projects.loadError'));
            }
        } catch {
            setError(t('profile.projects.genericError'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('profile.projects.confirmDelete'))) return;

        try {
            const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProjects(projects.filter(p => p._id !== id));
            }
        } catch {
            showToast(t('profile.projects.deleteError'), 'error');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-neo-yellow';
            case 'approved': return 'bg-neo-green';
            case 'rejected': return 'bg-neo-pink';
            default: return 'bg-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return t('profile.projects.pending');
            case 'approved': return t('profile.projects.approved');
            case 'rejected': return t('profile.projects.rejected');
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center pt-24">
                <SkeletonList items={5} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-24 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-black uppercase">{t('profile.projects.title')}</h1>
                    <Link
                        href="/profile/projects/new"
                        className="bg-black text-white px-6 py-3 font-bold border-2 border-black hover:bg-white hover:text-black hover:shadow-neo transition-all uppercase"
                    >
                        {t('profile.projects.addNew')}
                    </Link>
                </div>

                {error && (
                    <div className="mb-6">
                        <Alert variant="danger">{error}</Alert>
                    </div>
                )}

                {projects.length === 0 ? (
                    <div className="bg-white border-4 border-black shadow-neo p-8 text-center">
                        <p className="text-xl font-bold text-gray-600">{t('profile.projects.noProjects')}</p>
                        <Link
                            href="/profile/projects/new"
                            className="inline-block mt-4 bg-neo-blue text-black px-6 py-3 font-bold border-2 border-black hover:shadow-neo transition-all"
                        >
                            {t('profile.projects.addNew')}
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {projects.map((project) => (
                            <div key={project._id} className="bg-white border-4 border-black shadow-neo p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-black text-black">
                                            {language === 'en' && project.titleEn ? project.titleEn : project.title}
                                        </h2>
                                        <span className={`inline-block mt-2 px-3 py-1 text-sm font-bold border-2 border-black ${getStatusColor(project.status ?? 'pending')}`}>
                                            {getStatusText(project.status ?? 'pending')}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <BookmarkButton contentType="project" contentId={project._id} />
                                        <Link
                                            href={`/profile/projects/${project._id}/edit`}
                                            className="px-3 py-1 bg-neo-blue text-black font-bold border-2 border-black text-sm hover:shadow-neo transition-all"
                                        >
                                            {t('profile.projects.editAction')}
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(project._id)}
                                            className="px-3 py-1 bg-neo-pink text-black font-bold border-2 border-black text-sm hover:shadow-neo transition-all"
                                        >
                                            {t('profile.projects.delete')}
                                        </button>
                                    </div>
                                </div>

                                <p className="text-gray-700 mb-4">
                                    {language === 'en' && project.descriptionEn ? project.descriptionEn : project.description}
                                </p>

                                {project.technologies && project.technologies.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {project.technologies.map((tech, i) => (
                                            <span key={i} className="px-2 py-1 bg-gray-100 border border-black text-sm font-medium">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {project.status === 'rejected' && project.rejectionReason && (
                                    <div className="bg-red-50 border-2 border-red-300 p-3 mt-4">
                                        <p className="text-sm font-bold text-red-700">{t('profile.projects.rejectionReason')}:</p>
                                        <p className="text-red-600">{project.rejectionReason}</p>
                                    </div>
                                )}

                                {project.status === 'approved' && (
                                    <p className="text-sm text-gray-500 mt-4">
                                        {project.viewCount} {t('profile.projects.views')}
                                    </p>
                                )}

                                <div className="flex gap-4 mt-4 text-sm">
                                    <a href={project.githubUrl} className="text-blue-600 hover:underline font-bold">
                                        GitHub
                                    </a>
                                    {project.demoUrl && (
                                        <a href={project.demoUrl} className="text-green-600 hover:underline font-bold">
                                            Demo
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-8">
                    <Link href="/profile" className="text-black font-bold hover:underline">
                        ← {t('profile.projects.back')}
                    </Link>
                </div>
            </div>
        </div>
    );
}


