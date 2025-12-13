'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SkeletonList } from '@/app/_components/Skeleton';
import { useToast } from '@/app/_context/ToastContext';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/app/_components/ui';

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
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
        if (params.id) {
            fetchProject(params.id as string);
        }
    }, [params.id]);

    const fetchProject = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/projects/${id}`);

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
            } else if (res.status === 401) {
                router.push('/auth/login?returnUrl=/admin/projects');
            } else {
                showToast('Proje bulunamadı.', 'error');
                router.push('/admin/projects');
            }
        } catch (error) {
            console.error('Proje yüklenirken hata:', error);
            router.push('/admin/projects');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/admin/projects/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                showToast('Proje güncellendi!', 'success');
                router.push('/admin/projects');
            } else {
                const data = await res.json();
                showToast(data.error || 'Proje güncellenirken bir hata oluştu.', 'error');
            }
        } catch (error) {
            console.error('Hata:', error);
            showToast('Bir hata oluştu.', 'error');
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

    if (loading) return <div className="min-h-screen bg-neo-gray p-6"><SkeletonList items={5} /></div>;

    return (
        <div className="min-h-screen bg-neo-gray p-6">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-black uppercase">Projeyi Düzenle</h1>
                    <Link href="/admin/projects" className="text-black hover:underline flex items-center gap-1 font-bold"><ChevronLeft size={14} /> Geri Dön</Link>
                </div>

                <form onSubmit={handleSubmit} className="bg-white border-4 border-black shadow-neo p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-black text-black mb-2">Başlık</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-yellow"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-black text-black mb-2">Açıklama</label>
                        <textarea
                            required
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-yellow resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-black text-black mb-2">GitHub URL</label>
                            <input
                                type="url"
                                required
                                value={formData.githubUrl}
                                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-yellow"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-black text-black mb-2">Demo URL (Opsiyonel)</label>
                            <input
                                type="url"
                                value={formData.demoUrl || ''}
                                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-yellow"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-black text-black mb-2">Teknolojiler (Enter ile ekleyin)</label>
                        <div className="flex flex-wrap gap-2 mb-2 p-3 border-2 border-black min-h-[50px]">
                            {formData.technologies.map((tech) => (
                                <span key={tech} className="bg-neo-blue text-black border-2 border-black px-2 py-1 text-sm font-bold flex items-center gap-2">
                                    {tech}
                                    <button type="button" onClick={() => removeTech(tech)} className="hover:text-red-600 font-black">×</button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={techInput}
                                onChange={(e) => setTechInput(e.target.value)}
                                onKeyDown={addTech}
                                className="bg-transparent text-black outline-none flex-1 min-w-[100px]"
                                placeholder={formData.technologies.length === 0 ? "Örn: React, Node.js..." : ""}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-black text-black mb-2">Durum</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                            className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-yellow bg-white"
                        >
                            <option value="pending">Bekliyor</option>
                            <option value="approved">Onaylı</option>
                            <option value="rejected">Reddedildi</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t-4 border-black">
                        <Link
                            href="/admin/projects"
                            className="px-6 py-3 bg-gray-200 text-black border-2 border-black font-bold hover:bg-gray-300"
                        >
                            İptal
                        </Link>
                        <Button
                            type="submit"
                            disabled={saving}
                            isLoading={saving}
                            variant="success"
                        >
                            Değişiklikleri Kaydet
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

