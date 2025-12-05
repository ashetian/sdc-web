'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '../../../_context/LanguageContext';

export default function NewProjectPage() {
    const router = useRouter();
    const { language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        titleEn: '',
        description: '',
        descriptionEn: '',
        githubUrl: '',
        demoUrl: '',
        technologies: '',
    });

    const labels = {
        tr: {
            title: 'Yeni Proje Ekle',
            projectTitle: 'Proje Başlığı',
            projectTitleEn: 'Proje Başlığı (İngilizce)',
            description: 'Açıklama',
            descriptionEn: 'Açıklama (İngilizce)',
            githubUrl: 'GitHub Repository URL',
            demoUrl: 'Demo URL (Opsiyonel)',
            technologies: 'Teknolojiler',
            technologiesHint: 'Virgülle ayırın: React, Node.js, MongoDB',
            submit: 'Proje Ekle',
            submitting: 'Ekleniyor...',
            back: 'Geri',
            success: 'Proje başarıyla eklendi. Admin onayı bekleniyor.',
        },
        en: {
            title: 'Add New Project',
            projectTitle: 'Project Title',
            projectTitleEn: 'Project Title (English)',
            description: 'Description',
            descriptionEn: 'Description (English)',
            githubUrl: 'GitHub Repository URL',
            demoUrl: 'Demo URL (Optional)',
            technologies: 'Technologies',
            technologiesHint: 'Separate with commas: React, Node.js, MongoDB',
            submit: 'Add Project',
            submitting: 'Adding...',
            back: 'Back',
            success: 'Project added successfully. Awaiting admin approval.',
        },
    };

    const l = labels[language];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const technologies = formData.technologies
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 0);

            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    technologies,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert(l.success);
                router.push('/profile/projects');
            } else {
                setError(data.error || 'Bir hata oluştu');
            }
        } catch {
            setError('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-24 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white border-4 border-black shadow-neo p-8">
                    <h1 className="text-2xl font-black text-black uppercase mb-6 border-b-4 border-black pb-4">
                        {l.title}
                    </h1>

                    {error && (
                        <div className="bg-red-100 border-2 border-red-500 p-4 mb-6 text-red-700">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-black text-black mb-2">
                                {l.projectTitle} *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                maxLength={100}
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-yellow"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-black text-black mb-2">
                                {l.projectTitleEn}
                            </label>
                            <input
                                type="text"
                                value={formData.titleEn}
                                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                                maxLength={100}
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-yellow"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-black text-black mb-2">
                                {l.description} *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                maxLength={1000}
                                rows={4}
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-yellow resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-black text-black mb-2">
                                {l.descriptionEn}
                            </label>
                            <textarea
                                value={formData.descriptionEn}
                                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                                maxLength={1000}
                                rows={4}
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-yellow resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-black text-black mb-2">
                                {l.githubUrl} *
                            </label>
                            <input
                                type="url"
                                value={formData.githubUrl}
                                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                                required
                                placeholder="https://github.com/username/repo"
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-yellow"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-black text-black mb-2">
                                {l.demoUrl}
                            </label>
                            <input
                                type="url"
                                value={formData.demoUrl}
                                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                                placeholder="https://your-demo.vercel.app"
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-yellow"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-black text-black mb-2">
                                {l.technologies}
                            </label>
                            <input
                                type="text"
                                value={formData.technologies}
                                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                                placeholder={l.technologiesHint}
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-yellow"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-black text-white py-3 font-bold border-2 border-black hover:bg-white hover:text-black hover:shadow-neo transition-all uppercase disabled:opacity-50"
                            >
                                {loading ? l.submitting : l.submit}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 pt-6 border-t-2 border-gray-200">
                        <Link href="/profile/projects" className="text-black font-bold hover:underline">
                            ← {l.back}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
