'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import GlobalLoading from '@/app/_components/GlobalLoading';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface ProjectData {
    _id: string;
    title: string;
    description: string;
    githubUrl: string;
    demoUrl?: string;
    technologies: string[];
    status: 'pending' | 'approved' | 'rejected';
}

export default function EditProjectPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [password, setPassword] = useState('');
    const [authenticated, setAuthenticated] = useState(false);
    const [formData, setFormData] = useState<ProjectData>({
        _id: '',
        title: '',
        description: '',
        githubUrl: '',
        demoUrl: '',
        technologies: [],
        status: 'pending',
    });
    const [techInput, setTechInput] = useState('');

    useEffect(() => {
        const savedPassword = localStorage.getItem('adminPassword');
        if (savedPassword) {
            setPassword(savedPassword);
            setAuthenticated(true);
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authenticated && params.id) {
            fetchProject(params.id as string);
        }
    }, [authenticated, params.id]);

    const fetchProject = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/projects/${id}`, {
                headers: { 'x-admin-password': password },
            });

            if (res.ok) {
                const project = await res.json();
                setFormData({
                    _id: project._id,
                    title: project.title,
                    description: project.description,
                    githubUrl: project.githubUrl,
                    demoUrl: project.demoUrl || '',
                    technologies: project.technologies || [],
                    status: project.status,
                });
            } else {
                alert('Proje bulunamadı veya yetkisiz erişim.');
                router.push('/admin/projects');
            }
        } catch (error) {
            console.error('Proje yüklenirken hata:', error);
            router.push('/admin/projects');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('adminPassword', password);
        setAuthenticated(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/admin/projects/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-password': password,
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert('Proje güncellendi!');
                router.push('/admin/projects');
            } else {
                const data = await res.json();
                alert(data.error || 'Proje güncellenirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Hata:', error);
            alert('Bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    const addTech = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && techInput.trim()) {
            e.preventDefault();
            if (!formData.technologies.includes(techInput.trim())) {
                setFormData({
                    ...formData,
                    technologies: [...formData.technologies, techInput.trim()]
                });
            }
            setTechInput('');
        }
    };

    const removeTech = (tech: string) => {
        setFormData({
            ...formData,
            technologies: formData.technologies.filter(t => t !== tech)
        });
    };

    if (loading) return <GlobalLoading />;

    if (!authenticated) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="bg-gray-800 border-2 border-gray-700 p-8 w-full max-w-md">
                    <h1 className="text-2xl font-bold text-white mb-6">Admin Girişi</h1>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Admin Şifresi"
                        className="w-full p-3 bg-gray-700 text-white border border-gray-600 mb-4"
                    />
                    <button type="submit" className="w-full bg-blue-600 text-white py-3 font-bold hover:bg-blue-700">
                        Giriş
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-white">Projeyi Düzenle</h1>
                    <Link href="/admin/projects" className="text-gray-400 hover:text-white flex items-center gap-1"><ChevronLeft size={14} /> Geri Dön</Link>
                </div>

                <form onSubmit={handleSubmit} className="bg-gray-800 border-2 border-gray-700 p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Başlık</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-3 bg-gray-900 text-white border border-gray-600 focus:border-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Açıklama</label>
                        <textarea
                            required
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-3 bg-gray-900 text-white border border-gray-600 focus:border-blue-500 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">GitHub URL</label>
                            <input
                                type="url"
                                required
                                value={formData.githubUrl}
                                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                                className="w-full p-3 bg-gray-900 text-white border border-gray-600 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Demo URL (Opsiyonel)</label>
                            <input
                                type="url"
                                value={formData.demoUrl || ''}
                                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                                className="w-full p-3 bg-gray-900 text-white border border-gray-600 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Teknolojiler (Enter ile ekleyin)</label>
                        <div className="flex flex-wrap gap-2 mb-2 p-3 bg-gray-900 border border-gray-600 min-h-[50px]">
                            {formData.technologies.map((tech) => (
                                <span key={tech} className="bg-blue-900 text-blue-200 px-2 py-1 text-sm flex items-center gap-2">
                                    {tech}
                                    <button type="button" onClick={() => removeTech(tech)} className="hover:text-white">×</button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={techInput}
                                onChange={(e) => setTechInput(e.target.value)}
                                onKeyDown={addTech}
                                className="bg-transparent text-white outline-none flex-1 min-w-[100px]"
                                placeholder={formData.technologies.length === 0 ? "Örn: React, Node.js..." : ""}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">Durum</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                            className="w-full p-3 bg-gray-900 text-white border border-gray-600 focus:border-blue-500 outline-none"
                        >
                            <option value="pending">Bekliyor</option>
                            <option value="approved">Onaylı</option>
                            <option value="rejected">Reddedildi</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
                        <Link
                            href="/admin/projects"
                            className="px-6 py-3 bg-gray-700 text-white font-bold hover:bg-gray-600"
                        >
                            İptal
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
