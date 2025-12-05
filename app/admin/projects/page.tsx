'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

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
    createdAt: string;
    memberId: {
        fullName: string;
        nickname?: string;
        studentNo: string;
        department?: string;
    };
}

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [password, setPassword] = useState('');
    const [authenticated, setAuthenticated] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [rejectReason, setRejectReason] = useState('');
    const [rejectingId, setRejectingId] = useState<string | null>(null);

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
            const url = filter === 'all' ? '/api/admin/projects' : `/api/admin/projects?status=${filter}`;
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
            const res = await fetch(`/api/admin/projects/${id}/approve`, {
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
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-white">Proje Yönetimi</h1>
                    <div className="flex gap-2">
                        {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 font-bold border-2 border-gray-600 ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                {f === 'all' ? 'Tümü' : f === 'pending' ? 'Bekleyen' : f === 'approved' ? 'Onaylı' : 'Reddedilen'}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="text-white text-center py-12">Yükleniyor...</div>
                ) : projects.length === 0 ? (
                    <div className="text-gray-400 text-center py-12">Proje bulunamadı</div>
                ) : (
                    <div className="space-y-6">
                        {projects.map((project) => (
                            <div key={project._id} className="bg-gray-800 border-2 border-gray-700 overflow-hidden">
                                <div className="flex flex-col lg:flex-row">
                                    {/* Preview */}
                                    <div className="relative w-full lg:w-72 h-48 border-b-2 lg:border-b-0 lg:border-r-2 border-gray-700">
                                        <Image
                                            src={getGithubPreview(project.githubUrl)}
                                            alt={project.title}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h2 className="text-xl font-bold text-white">{project.title}</h2>
                                                <span className={`inline-block mt-2 px-3 py-1 text-sm font-bold text-black ${getStatusColor(project.status)}`}>
                                                    {project.status === 'pending' ? 'Bekliyor' : project.status === 'approved' ? 'Onaylı' : 'Reddedildi'}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-gray-300 mb-4 line-clamp-2">{project.description}</p>

                                        {/* Member Info */}
                                        <div className="text-sm text-gray-400 mb-4">
                                            <span className="font-bold">Üye:</span> {project.memberId?.fullName || 'Bilinmiyor'}
                                            {project.memberId?.studentNo && ` (${project.memberId.studentNo})`}
                                            {project.memberId?.department && ` • ${project.memberId.department}`}
                                        </div>

                                        {/* Technologies */}
                                        {project.technologies.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {project.technologies.map((tech, i) => (
                                                    <span key={i} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Links */}
                                        <div className="flex gap-4 mb-4 text-sm">
                                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                                GitHub
                                            </a>
                                            {project.demoUrl && (
                                                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
                                                    Demo
                                                </a>
                                            )}
                                        </div>

                                        {/* Rejection Reason */}
                                        {project.status === 'rejected' && project.rejectionReason && (
                                            <div className="bg-red-900/30 border border-red-700 p-3 mb-4">
                                                <p className="text-sm text-red-400">
                                                    <span className="font-bold">Red sebebi:</span> {project.rejectionReason}
                                                </p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        {project.status === 'pending' && (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleApprove(project._id)}
                                                    className="px-4 py-2 bg-green-600 text-white font-bold hover:bg-green-700"
                                                >
                                                    Onayla
                                                </button>
                                                <button
                                                    onClick={() => setRejectingId(project._id)}
                                                    className="px-4 py-2 bg-red-600 text-white font-bold hover:bg-red-700"
                                                >
                                                    Reddet
                                                </button>
                                            </div>
                                        )}

                                        {/* Reject Form */}
                                        {rejectingId === project._id && (
                                            <div className="mt-4 p-4 bg-gray-700 border border-gray-600">
                                                <textarea
                                                    value={rejectReason}
                                                    onChange={(e) => setRejectReason(e.target.value)}
                                                    placeholder="Red sebebi (opsiyonel)"
                                                    className="w-full p-2 bg-gray-800 text-white border border-gray-600 mb-3"
                                                    rows={2}
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleReject(project._id)}
                                                        className="px-4 py-2 bg-red-600 text-white font-bold hover:bg-red-700"
                                                    >
                                                        Reddet
                                                    </button>
                                                    <button
                                                        onClick={() => { setRejectingId(null); setRejectReason(''); }}
                                                        className="px-4 py-2 bg-gray-600 text-white font-bold hover:bg-gray-500"
                                                    >
                                                        İptal
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
        </div>
    );
}
