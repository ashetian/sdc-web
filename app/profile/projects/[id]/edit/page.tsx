'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../../_context/LanguageContext';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Button, Alert } from '../../../../_components/ui';

export default function EditProjectPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [revisionMessage, setRevisionMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        titleEn: '',
        description: '',
        descriptionEn: '',
        githubUrl: '',
        demoUrl: '',
        technologies: '',
    });

    useEffect(() => {
        if (id) {
            loadProject();
        }
    }, [id]);

    async function loadProject() {
        try {
            const res = await fetch(`/api/projects/${id}`);
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    title: data.title || '',
                    titleEn: data.titleEn || '',
                    description: data.description || '',
                    descriptionEn: data.descriptionEn || '',
                    githubUrl: data.githubUrl || '',
                    demoUrl: data.demoUrl || '',
                    technologies: Array.isArray(data.technologies) ? data.technologies.join(', ') : (data.technologies || ''),
                });

                if (data.status === 'revision_requested' && data.revisionMessage) {
                    setRevisionMessage(data.revisionMessage);
                }
            } else {
                setError(t('profile.projects.edit.error'));
            }
        } catch (error) {
            console.error('Project load error:', error);
            setError(t('profile.projects.edit.error'));
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const technologies = formData.technologies
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 0);

            const res = await fetch(`/api/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    technologies,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setShowSuccessModal(true);
                // Clear revision message if update is successful
                setRevisionMessage(null);
            } else {
                setError(data.error || t('profile.projects.edit.error'));
            }
        } catch {
            setError(t('profile.projects.edit.error'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center font-bold">Yükleniyor...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-black mb-8">{t('profile.projects.edit.title')}</h1>

            {revisionMessage && (
                <div className="bg-neo-yellow border-4 border-black p-4 mb-8 shadow-neo">
                    <div className="flex items-center gap-2 mb-2 font-black text-lg">
                        <AlertTriangle size={24} />
                        {t('profile.projects.edit.revisionRequest')}
                    </div>
                    <p className="font-bold mb-1">{t('profile.projects.edit.revisionNote')}</p>
                    <p className="bg-white/50 p-3 border-2 border-black border-dashed">
                        {revisionMessage}
                    </p>
                </div>
            )}

            {error && (
                <div className="bg-neo-pink border-4 border-black p-4 mb-6 font-bold shadow-neo">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white border-4 border-black shadow-neo p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-bold mb-1">{t('profile.projects.form.projectTitle')}</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-blue"
                            />
                        </div>
                        <div>
                            <label className="block font-bold mb-1">{t('profile.projects.form.projectTitleEn')}</label>
                            <input
                                type="text"
                                value={formData.titleEn}
                                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-blue"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-bold mb-1">{t('profile.projects.form.description')}</label>
                            <textarea
                                required
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-blue"
                            />
                        </div>
                        <div>
                            <label className="block font-bold mb-1">{t('profile.projects.form.descriptionEn')}</label>
                            <textarea
                                rows={4}
                                value={formData.descriptionEn}
                                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-blue"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-bold mb-1">{t('profile.projects.form.githubUrl')}</label>
                        <input
                            type="url"
                            required
                            value={formData.githubUrl}
                            onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                            className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-blue"
                        />
                    </div>

                    <div>
                        <label className="block font-bold mb-1">{t('profile.projects.form.demoUrl')}</label>
                        <input
                            type="url"
                            value={formData.demoUrl}
                            onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                            className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-blue"
                        />
                    </div>

                    <div>
                        <label className="block font-bold mb-1">{t('profile.projects.form.technologies')}</label>
                        <input
                            type="text"
                            required
                            placeholder={t('profile.projects.form.technologiesHint')}
                            value={formData.technologies}
                            onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                            className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-blue"
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button
                        type="button"
                        onClick={() => router.back()}
                        variant="secondary"
                    >
                        {t('profile.projects.edit.cancel')}
                    </Button>
                    <Button
                        type="submit"
                        isLoading={submitting}
                        variant="success"
                    >
                        {t('profile.projects.edit.submit')}
                    </Button>
                </div>
            </form>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-4 border-black shadow-neo p-8 max-w-md w-full text-center">
                        <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
                        <h2 className="text-2xl font-black mb-2">{t('profile.projects.edit.successTitle')}</h2>
                        <p className="font-bold text-gray-700 mb-6">{t('profile.projects.edit.successMessage')}</p>
                        <button
                            onClick={() => router.push('/profile/projects')}
                            className="w-full p-4 bg-neo-blue text-white border-4 border-black font-black shadow-neo hover:translate-y-[-2px] hover:shadow-lg transition-transform active:translate-y-[2px]"
                        >
                            {t('profile.projects.edit.goToProjects')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
