'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import GlobalLoading from '@/app/_components/GlobalLoading';
import Image from 'next/image';
import { FolderOpen, User, Hash, Github, ExternalLink, AlertTriangle } from 'lucide-react';

interface Project {
    _id: string;
    title: string;
    titleEn?: string;
    description: string;
    githubUrl: string;
    demoUrl?: string;
    technologies: string[];
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    isDeleted?: boolean;
    deletedAt?: string;
    createdAt: string;
    memberId: {
        fullName: string;
        nickname?: string;
        studentNo: string;
        department?: string;
    };
}

type TabType = 'pending' | 'approved' | 'rejected' | 'all' | 'deleted';

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [password, setPassword] = useState('');
    const [authenticated, setAuthenticated] = useState(false);
    const [filter, setFilter] = useState<TabType>('pending');
    const [rejectReason, setRejectReason] = useState('');
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
    const [permanentDeleteModalId, setPermanentDeleteModalId] = useState<string | null>(null);

    useEffect(() => {
        const savedPassword = localStorage.getItem('adminPassword');
        if (savedPassword) {
            setPassword(savedPassword);
            setAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        if (authenticated) {
            fetchProjects();
        }
    }, [authenticated, filter]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            let url = '/api/admin/projects';
            if (filter === 'deleted') {
                url = '/api/admin/projects?deleted=true';
            } else if (filter !== 'all') {
                url = `/ api / admin / projects ? status = ${filter} `;
            }

            const res = await fetch(url, {
                headers: { 'x-admin-password': password },
            });

            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            } else if (res.status === 401) {
                setAuthenticated(false);
                localStorage.removeItem('adminPassword');
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('adminPassword', password);
        setAuthenticated(true);
    };

    const handleApprove = async (id: string) => {
        try {
            const res = await fetch(`/ api / admin / projects / ${id}/approve`, {
                method: 'POST',
                headers: { 'x-admin-password': password },
            });

            if (res.ok) {
                fetchProjects();
            }
        } catch (err) {
            console.error('Approve error:', err);
        }
    };

    const handleReject = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/projects/${id}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-password': password,
                },
                body: JSON.stringify({ reason: rejectReason }),
            });

            if (res.ok) {
                setRejectingId(null);
                setRejectReason('');
                fetchProjects();
            }
        } catch (err) {
            console.error('Reject error:', err);
        }
    };

    const handleSoftDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/projects?id=${id}`, {
                method: 'DELETE',
                headers: { 'x-admin-password': password },
            });

            if (res.ok) {
                setDeleteModalId(null);
                fetchProjects();
            }
        } catch (err) {
            console.error('Soft delete error:', err);
        }
    };

    const handleRestore = async (id: string) => {
        try {
            const res = await fetch('/api/admin/projects', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-password': password,
                },
                body: JSON.stringify({ projectId: id, action: 'restore' }),
            });

            if (res.ok) {
                fetchProjects();
            }
        } catch (err) {
            console.error('Restore error:', err);
        }
    };

    const handlePermanentDelete = async (id: string) => {
        try {
            const res = await fetch('/api/admin/projects', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-password': password,
                },
                body: JSON.stringify({ projectId: id, action: 'permanent-delete' }),
            });

            if (res.ok) {
                setPermanentDeleteModalId(null);
                fetchProjects();
            }
        } catch (err) {
            console.error('Permanent delete error:', err);
        }
    };

    const getGithubPreview = (githubUrl: string) => {
        const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (match) {
            return `https://opengraph.githubassets.com/1/${match[1]}/${match[2]}`;
        }
        return '/sdclogo.png';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-neo-yellow';
            case 'approved': return 'bg-neo-green';
            case 'rejected': return 'bg-neo-pink';
            default: return 'bg-gray-200';
        }
    };

    const getDaysUntilPermanentDelete = (deletedAt: string) => {
        const deleted = new Date(deletedAt);
        const now = new Date();
        const diffTime = 30 * 24 * 60 * 60 * 1000 - (now.getTime() - deleted.getTime());
        return Math.max(0, Math.ceil(diffTime / (24 * 60 * 60 * 1000)));
    };

    if (!authenticated) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="bg-gray-800 border-2 border-gray-700 p-8 w-full max-w-md">
                    <h1 className="text-2xl font-bold text-white mb-6">Proje Yönetimi</h1>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Admin Şifresi"
                        className="w-full p-3 bg-gray-700 text-white border border-gray-600 mb-4"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 font-bold hover:bg-blue-700"
                    >
                        Giriş
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neo-gray text-neo-black p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter bg-neo-black text-neo-white px-6 py-2 shadow-neo transform -rotate-1">
                        Proje Yönetimi
                    </h1>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap justify-center gap-4">
                        {(['pending', 'approved', 'rejected', 'all', 'deleted'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`
                                    px-6 py-3 font-bold uppercase tracking-wider border-2 border-neo-black transition-all duration-200
                                    ${filter === f
                                        ? 'bg-neo-black text-neo-yellow shadow-neo translate-x-[-2px] translate-y-[-2px]'
                                        : 'bg-neo-white text-neo-black hover:bg-neo-yellow hover:shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px]'
                                    }
                                    ${f === 'deleted' && filter !== 'deleted' ? 'hover:bg-neo-red hover:text-white' : ''}
                                    ${f === 'deleted' && filter === 'deleted' ? '!bg-neo-red !text-white' : ''}
                                `}
                            >
                                {f === 'all' ? 'Tümü' : f === 'pending' ? 'Bekleyen' : f === 'approved' ? 'Onaylı' : f === 'rejected' ? 'Reddedilen' : 'Silinenler'}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <GlobalLoading fullScreen={false} />
                ) : projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 border-4 border-neo-black border-dashed bg-neo-white/50">
                        <div className="text-6xl mb-4"><FolderOpen size={48} /></div>
                        <div className="text-2xl font-black uppercase text-neo-black/50">Proje Bulunamadı</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        {projects.map((project, index) => (
                            <div
                                key={project._id}
                                className={`
                                    relative bg-neo-white border-4 border-neo-black shadow-neo hover:shadow-neo-lg transition-all duration-300
                                    ${project.isDeleted ? 'opacity-75 grayscale' : ''}
                                `}
                            >
                                {/* Status Badge (Absolute) */}
                                <div className={`
                                    absolute -top-4 -right-4 px-6 py-2 border-2 border-neo-black font-black uppercase tracking-widest shadow-neo-sm transform rotate-2 z-10
                                    ${project.status === 'pending' ? 'bg-neo-yellow text-neo-black' :
                                        project.status === 'approved' ? 'bg-neo-green text-neo-black' :
                                            'bg-neo-red text-neo-white'}
                                `}>
                                    {project.status === 'pending' ? 'Bekliyor' : project.status === 'approved' ? 'Onaylı' : 'Reddedildi'}
                                </div>

                                <div className="flex flex-col lg:flex-row">
                                    {/* Preview Section */}
                                    <div className="relative w-full lg:w-1/3 aspect-video lg:aspect-auto border-b-4 lg:border-b-0 lg:border-r-4 border-neo-black bg-neo-gray-dark group overflow-hidden">
                                        <div className="absolute inset-0 bg-neo-purple/20 mix-blend-overlay group-hover:bg-transparent transition-all duration-300 z-10" />
                                        <Image
                                            src={getGithubPreview(project.githubUrl)}
                                            alt={project.title}
                                            fill
                                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                            unoptimized
                                        />
                                    </div>

                                    {/* Content Section */}
                                    <div className="flex-1 p-6 lg:p-8 flex flex-col">

                                        <div className="flex-1">
                                            {/* Header */}
                                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                                <div>
                                                    <h2 className="text-3xl font-black uppercase leading-none mb-2">{project.title}</h2>
                                                    {project.isDeleted && project.deletedAt && (
                                                        <span className="inline-block px-2 py-1 bg-neo-red text-white text-xs font-bold uppercase border border-neo-black">
                                                            {getDaysUntilPermanentDelete(project.deletedAt)} gün sonra silinecek
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="text-neo-black/80 font-bold leading-relaxed mb-6 line-clamp-2 border-l-4 border-neo-yellow pl-4">
                                                {project.description}
                                            </p>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-neo-blue border-2 border-neo-black flex items-center justify-center font-bold text-white">
                                                        <User size={16} />
                                                    </div>
                                                    <div>
                                                        <span className="block font-black uppercase text-xs text-neo-black/60">Geliştirici</span>
                                                        <span className="font-bold truncate">{project.memberId?.fullName || 'Bilinmiyor'}</span>
                                                    </div>
                                                </div>

                                                {project.memberId?.studentNo && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-neo-purple border-2 border-neo-black flex items-center justify-center font-bold text-white">
                                                            <Hash size={16} />
                                                        </div>
                                                        <div>
                                                            <span className="block font-black uppercase text-xs text-neo-black/60">Öğrenci No</span>
                                                            <span className="font-bold">{project.memberId.studentNo}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Technologies Chips */}
                                            {project.technologies.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    {project.technologies.map((tech, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-3 py-1 bg-neo-black text-neo-white text-xs font-bold uppercase border border-neo-black hover:bg-neo-white hover:text-neo-black transition-colors"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Rejection Notice */}
                                        {project.status === 'rejected' && project.rejectionReason && (
                                            <div className="bg-neo-red/10 border-2 border-neo-red p-4 mb-6">
                                                <p className="text-neo-red font-bold">
                                                    <span className="uppercase text-xs block opacity-70 mb-1">Red Sebebi:</span>
                                                    {project.rejectionReason}
                                                </p>
                                            </div>
                                        )}

                                        {/* Actions Footer */}
                                        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mt-auto pt-6 border-t-2 border-neo-black/10">
                                            {/* Links */}
                                            <div className="flex gap-4">
                                                <a href={project.githubUrl}
                                                    className="flex items-center gap-2 font-bold hover:text-neo-purple underline decoration-2 underline-offset-4">
                                                    <Github size={18} /> GitHub
                                                </a>
                                                {project.demoUrl && (
                                                    <a href={project.demoUrl}
                                                        className="flex items-center gap-2 font-bold hover:text-neo-green underline decoration-2 underline-offset-4">
                                                        <ExternalLink size={18} /> Demo
                                                    </a>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            {!project.isDeleted ? (
                                                <div className="flex flex-wrap gap-3">
                                                    <Link
                                                        href={`/admin/projects/${project._id}/edit`}
                                                        className="px-6 py-2 bg-neo-white border-2 border-neo-black text-neo-black font-black uppercase hover:bg-neo-black hover:text-neo-white transition-all shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                                                    >
                                                        Düzenle
                                                    </Link>

                                                    {project.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(project._id)}
                                                                className="px-6 py-2 bg-neo-green border-2 border-neo-black text-neo-black font-black uppercase hover:brightness-110 shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                                            >
                                                                Onayla
                                                            </button>
                                                            <button
                                                                onClick={() => setRejectingId(project._id)}
                                                                className="px-6 py-2 bg-neo-red border-2 border-neo-black text-white font-black uppercase hover:brightness-110 shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                                            >
                                                                Reddet
                                                            </button>
                                                        </>
                                                    )}
                                                    {(project.status === 'approved' || project.status === 'rejected') && (
                                                        <button
                                                            onClick={() => setDeleteModalId(project._id)}
                                                            className="px-6 py-2 bg-neo-gray-dark border-2 border-neo-black text-white font-black uppercase hover:bg-neo-red shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                                        >
                                                            Sil
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-3">
                                                    <button
                                                        onClick={() => handleRestore(project._id)}
                                                        className="px-6 py-2 bg-neo-blue border-2 border-neo-black text-white font-black uppercase hover:brightness-110 shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                                    >
                                                        Geri Yükle
                                                    </button>
                                                    <button
                                                        onClick={() => setPermanentDeleteModalId(project._id)}
                                                        className="px-6 py-2 bg-neo-red border-2 border-neo-black text-white font-black uppercase hover:brightness-110 shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                                    >
                                                        Kalıcı Sil
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Reject Form Layout Update */}
                                        {rejectingId === project._id && (
                                            <div className="mt-6 p-6 bg-neo-black text-neo-white border-4 border-neo-red animate-pulse-slow">
                                                <h4 className="font-bold uppercase text-neo-red mb-2">Red Nedeni Belirtin</h4>
                                                <textarea
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                    placeholder="Geliştiriciye neyin eksik olduğunu açıklayın..."
                                                    className="w-full p-3 bg-neo-gray-dark text-white border-2 border-neo-white/20 focus:border-neo-red outline-none mb-4 font-mono text-sm"
                                                    rows={3}
                                                />
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => { setRejectingId(null); setRejectReason(''); }}
                                                        className="px-4 py-2 border-2 border-white text-white font-bold uppercase hover:bg-white hover:text-black transition-all"
                                                    >
                                                        İptal
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(project._id)}
                                                        className="px-4 py-2 bg-neo-red border-2 border-neo-red text-white font-bold uppercase hover:brightness-125 transition-all"
                                                    >
                                                        Reddet
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals with Neo Style */}
            {deleteModalId && (
                <div className="fixed inset-0 bg-neo-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-neo-white border-4 border-neo-black shadow-neo-lg p-8 max-w-md w-full relative">
                        <div className="absolute -top-6 -left-6 bg-neo-red text-white px-4 py-2 font-black border-2 border-neo-black shadow-neo transform -rotate-2">
                            DİKKAT!
                        </div>
                        <h3 className="text-2xl font-black uppercase mb-4 text-neo-black">Projeyi Sil?</h3>
                        <p className="font-bold text-neo-black/70 mb-8 leading-relaxed">
                            Bu proje "Silinenler" kutusuna taşınacak. 30 gün içinde geri yükleyebilirsiniz.
                        </p>
                        <div className="flex gap-4 justify-end">
                            <button
                                onClick={() => setDeleteModalId(null)}
                                className="px-6 py-3 border-2 border-neo-black font-black uppercase hover:bg-neo-gray transition-all"
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={() => handleSoftDelete(deleteModalId)}
                                className="px-6 py-3 bg-neo-black text-white border-2 border-neo-black font-black uppercase hover:bg-neo-red hover:shadow-neo transition-all"
                            >
                                Evet, Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {permanentDeleteModalId && (
                <div className="fixed inset-0 bg-neo-red/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-neo-black border-4 border-white shadow-neo-lg p-8 max-w-md w-full text-white">
                        <h3 className="text-2xl font-black uppercase mb-4 text-neo-red flex items-center gap-2"><AlertTriangle size={24} /> SON UYARI</h3>
                        <p className="font-bold mb-8 leading-relaxed">
                            Bu işlem geri alınamaz! Proje veritabanından tamamen silinecek.
                        </p>
                        <div className="flex gap-4 justify-end">
                            <button
                                onClick={() => setPermanentDeleteModalId(null)}
                                className="px-6 py-3 border-2 border-white font-black uppercase hover:bg-white hover:text-black transition-all"
                            >
                                İptal Et
                            </button>
                            <button
                                onClick={() => handlePermanentDelete(permanentDeleteModalId)}
                                className="px-6 py-3 bg-neo-red text-white border-2 border-neo-red font-black uppercase hover:brightness-125 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all"
                            >
                                Yok Et
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
