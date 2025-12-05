'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/app/_components/LoadingSpinner';

export default function AdminSettingsPage() {
    const [whatsappLink, setWhatsappLink] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                if (data.whatsappLink) {
                    setWhatsappLink(data.whatsappLink);
                }
            }
        } catch (error) {
            console.error('Ayarlar yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    key: 'whatsappLink',
                    value: whatsappLink,
                }),
            });

            if (res.ok) {
                setMessage('Ayarlar başarıyla kaydedildi.');
            } else {
                setMessage('Kaydedilirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Hata:', error);
            setMessage('Bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="md" />
        </div>
    );

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Genel Ayarlar</h1>
                <Link href="/admin" className="text-blue-600 hover:text-blue-800">
                    &larr; Geri Dön
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
                <div>
                    <label htmlFor="whatsappLink" className="block text-sm font-medium text-gray-700">
                        WhatsApp Davet Linki
                    </label>
                    <div className="mt-1">
                        <input
                            type="url"
                            name="whatsappLink"
                            id="whatsappLink"
                            value={whatsappLink}
                            onChange={(e) => setWhatsappLink(e.target.value)}
                            placeholder="https://chat.whatsapp.com/..."
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                        />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        Sitedeki tüm WhatsApp butonlarının yönlendireceği grup linki.
                    </p>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {saving ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>

                {message && (
                    <div className={`p-4 rounded-md ${message.includes('hata') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
}
