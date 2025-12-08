"use client";

import { useEffect, useState } from "react";
import { SkeletonList, SkeletonPageHeader } from '@/app/_components/Skeleton';
import Link from 'next/link';

export default function GeneralSettingsPage() {
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'whatsappLink',
                    value: whatsappLink,
                }),
            });

            if (res.ok) {
                setMessage('✅ Ayarlar başarıyla kaydedildi.');
            } else {
                setMessage('❌ Kaydedilirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Hata:', error);
            setMessage('❌ Bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="space-y-6">
            <SkeletonPageHeader />
            <SkeletonList items={3} />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white border-4 border-black shadow-neo p-6 flex justify-between items-center">
                <h1 className="text-2xl font-black text-black uppercase">Genel Ayarlar</h1>
                <Link href="/admin/settings" className="font-bold text-gray-500 hover:text-black hover:underline">
                    &larr; Geri Dön
                </Link>
            </div>

            <div className="bg-white border-4 border-black shadow-neo p-6">
                <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
                    <div>
                        <label htmlFor="whatsappLink" className="block text-sm font-black text-black uppercase mb-1">
                            WhatsApp Davet Linki
                        </label>
                        <input
                            type="url"
                            name="whatsappLink"
                            id="whatsappLink"
                            value={whatsappLink}
                            onChange={(e) => setWhatsappLink(e.target.value)}
                            placeholder="https://chat.whatsapp.com/..."
                            className="w-full p-3 border-4 border-black bg-gray-50 text-black font-bold focus:shadow-neo focus:outline-none transition-shadow"
                        />
                        <p className="mt-2 text-xs font-bold text-gray-500">
                            Sitedeki tüm WhatsApp butonlarının yönlendireceği grup linki.
                        </p>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-neo-blue text-black border-4 border-black px-6 py-3 font-black uppercase hover:bg-blue-300 hover:shadow-neo transition-all disabled:opacity-50"
                        >
                            {saving ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>

                    {message && (
                        <div className={`p - 4 font - bold border - 2 border - black ${message.includes('❌') ? 'bg-red-100 text-red-900' : 'bg-green-100 text-green-900'} `}>
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
