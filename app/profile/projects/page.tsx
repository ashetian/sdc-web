'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GlobalLoading from '@/app/_components/GlobalLoading';
import { useLanguage } from '../../_context/LanguageContext';

interface Project {
    _id: string;
    title: string;
    titleEn?: string;
    description: string;
    descriptionEn?: string;
    githubUrl: string;
    demoUrl?: string;
    technologies: string[];
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    viewCount: number;
    createdAt: string;
}

export default function MyProjectsPage() {
    const router = useRouter();
    const { language } = useLanguage();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const labels = {
        tr: {
            title: 'Projelerim',
            addNew: 'Yeni Proje Ekle',
            noProjects: 'Henüz proje eklenmemiş',
            pending: 'Onay Bekliyor',
            approved: 'Onaylandı',
            rejected: 'Reddedildi',
            views: 'görüntülenme',
            delete: 'Sil',
            edit: 'Düzenle',
            rejectionReason: 'Red sebebi',
            confirmDelete: 'Bu projeyi silmek istediğinize emin misiniz?',
            back: 'Geri',
        },
        en: {
            title: 'My Projects',
            addNew: 'Add New Project',
            noProjects: 'No projects added yet',
            pending: 'Pending Approval',
            approved: 'Approved',
            rejected: 'Rejected',
            views: 'views',
            delete: 'Delete',
            edit: 'Edit',
            rejectionReason: 'Rejection reason',
            confirmDelete: 'Are you sure you want to delete this project?',
            back: 'Back',
        },
    };

    const l = labels[language];

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
                router.push('/auth/login');
            } else {
                setError('Projeler yüklenemedi');
            }
        } catch {
            setError('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(l.confirmDelete)) return;

        try {
            const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProjects(projects.filter(p => p._id !== id));
            }
        } catch {
            alert('Silme işlemi başarısız');
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
            case 'pending': return l.pending;
            case 'approved': return l.approved;
            case 'rejected': return l.rejected;
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center pt-24">
                <GlobalLoading fullScreen={false} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-24 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-black uppercase">{l.title}</h1>
                    <Link
                        href="/profile/projects/new"
                        className="bg-black text-white px-6 py-3 font-bold border-2 border-black hover:bg-white hover:text-black hover:shadow-neo transition-all uppercase"
                    >
                        {l.addNew}
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-100 border-2 border-red-500 p-4 mb-6 text-red-700">{error}</div>
                )}

                {projects.length === 0 ? (
                    <div className="bg-white border-4 border-black shadow-neo p-8 text-center">
                        <p className="text-xl font-bold text-gray-600">{l.noProjects}</p>
                        <Link
                            href="/profile/projects/new"
                            className="inline-block mt-4 bg-neo-blue text-black px-6 py-3 font-bold border-2 border-black hover:shadow-neo transition-all"
                        >
                            {l.addNew}
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
                                        <span className={`inline-block mt-2 px-3 py-1 text-sm font-bold border-2 border-black ${getStatusColor(project.status)}`}>
                                            {getStatusText(project.status)}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/profile/projects/${project._id}/edit`}
                                            className="px-3 py-1 bg-neo-blue text-black font-bold border-2 border-black text-sm hover:shadow-neo transition-all"
                                        >
                                            {l.edit}
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(project._id)}
                                            className="px-3 py-1 bg-neo-pink text-black font-bold border-2 border-black text-sm hover:shadow-neo transition-all"
                                        >
                                            {l.delete}
                                        </button>
                                    </div>
                                </div>

                                <p className="text-gray-700 mb-4">
                                    {language === 'en' && project.descriptionEn ? project.descriptionEn : project.description}
                                </p>

                                {project.technologies.length > 0 && (
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
                                        <p className="text-sm font-bold text-red-700">{l.rejectionReason}:</p>
                                        <p className="text-red-600">{project.rejectionReason}</p>
                                    </div>
                                )}

                                {project.status === 'approved' && (
                                    <p className="text-sm text-gray-500 mt-4">
                                        {project.viewCount} {l.views}
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
                        ← {l.back}
                    </Link>
                </div>
            </div>
        </div>
    );
}
