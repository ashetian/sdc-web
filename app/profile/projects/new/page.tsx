'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '../../../_context/LanguageContext';
import { CheckCircle } from 'lucide-react';
import { Button, Alert } from '../../../_components/ui';

export default function NewProjectPage() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        titleEn: '',
        description: '',
        descriptionEn: '',
        githubUrl: '',
        demoUrl: '',
        technologies: '',
    });

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
                setShowSuccessModal(true);
            } else {
                setError(data.error || t('profile.projects.new.error'));
            }
        } catch {
            setError(t('profile.projects.new.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-24 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white border-4 border-black shadow-neo p-8">
                    <h1 className="text-2xl font-black text-black uppercase mb-6 border-b-4 border-black pb-4">
                        {t('profile.projects.new.title')}
                    </h1>

                    {error && (
                        <div className="bg-red-100 border-2 border-red-500 p-4 mb-6 text-red-700">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-black text-black mb-2">
                                {t('profile.projects.form.projectTitle')} *
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
                                {t('profile.projects.form.projectTitleEn')}
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
                                {t('profile.projects.form.description')} *
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
                                {t('profile.projects.form.descriptionEn')}
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
                                {t('profile.projects.form.githubUrl')} *
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
                                {t('profile.projects.form.demoUrl')}
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
                                {t('profile.projects.form.technologies')}
                            </label>
                            <input
                                type="text"
                                value={formData.technologies}
                                onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                                placeholder={t('profile.projects.form.technologiesHint')}
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-yellow"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="submit"
                                isLoading={loading}
                                fullWidth
                            >
                                {t('profile.projects.new.submit')}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 pt-6 border-t-2 border-gray-200">
                        <Link href="/profile/projects" className="text-black font-bold hover:underline">
                            ← {t('profile.projects.form.back')}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-4 border-black shadow-neo max-w-md w-full p-8 text-center">
                        <div className="w-16 h-16 bg-neo-green border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={32} className="text-black" />
                        </div>
                        <h2 className="text-2xl font-black text-black uppercase mb-4">
                            {t('profile.projects.new.successTitle')}
                        </h2>
                        <p className="text-gray-700 font-medium mb-8">
                            {t('profile.projects.new.successMessage')}
                        </p>
                        <button
                            onClick={() => router.push('/profile/projects')}
                            className="w-full bg-black text-white py-3 font-bold border-2 border-black hover:bg-neo-green hover:text-black transition-all uppercase"
                        >
                            {t('profile.projects.new.goToProjects')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

