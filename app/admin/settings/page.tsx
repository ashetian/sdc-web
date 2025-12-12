"use client";

import Link from "next/link";
import { useState } from "react";
import { Settings, Users, Lock, Mail, LucideIcon, Languages } from "lucide-react";

interface SettingsModule {
    key: string;
    label: string;
    href: string;
    color: string;
    icon: LucideIcon;
    desc: string;
}

const SETTINGS_MODULES: SettingsModule[] = [
    { key: 'general', label: 'Genel Ayarlar', href: '/admin/settings/general', color: 'bg-white', icon: Settings, desc: 'WhatsApp Linki vb.' },
    { key: 'email', label: 'E-posta Ayarları', href: '/admin/settings/email', color: 'bg-neo-yellow', icon: Mail, desc: 'E-posta sağlayıcısı ve SMTP ayarları' },
    { key: 'members', label: 'Üye Yönetimi', href: '/admin/settings/members', color: 'bg-neo-blue', icon: Users, desc: 'Excel yükle, üye listesini yönet' },
    { key: 'access', label: 'Panel Yetkileri', href: '/admin/settings/access', color: 'bg-neo-pink', icon: Lock, desc: 'Yönetici erişim izinleri' },
];

interface ContentTypes {
    announcements: boolean;
    events: boolean;
    projects: boolean;
    team: boolean;
    sponsors: boolean;
}

export default function SettingsDashboard() {
    const [translating, setTranslating] = useState(false);
    const [translateResult, setTranslateResult] = useState<{
        success: boolean;
        message: string;
        results?: Record<string, { total: number; translated: number; errors: number }>;
    } | null>(null);

    const [contentTypes, setContentTypes] = useState<ContentTypes>({
        announcements: true,
        events: true,
        projects: true,
        team: true,
        sponsors: true,
    });

    const toggleContentType = (type: keyof ContentTypes) => {
        setContentTypes(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const handleBatchTranslate = async () => {
        const selectedTypes = Object.entries(contentTypes)
            .filter(([, selected]) => selected)
            .map(([type]) => type);

        if (selectedTypes.length === 0) {
            alert('En az bir içerik türü seçmelisiniz.');
            return;
        }

        if (!confirm(`Seçili içeriklerin (${selectedTypes.join(', ')}) eksik çevirilerini DeepL ile tamamlamak istiyor musunuz?`)) {
            return;
        }

        setTranslating(true);
        setTranslateResult(null);

        try {
            const res = await fetch('/api/admin/batch-translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ types: selectedTypes }),
            });
            const data = await res.json();

            if (res.ok) {
                setTranslateResult({
                    success: true,
                    message: data.message,
                    results: data.results,
                });
            } else {
                setTranslateResult({
                    success: false,
                    message: data.error || 'Bir hata oluştu',
                });
            }
        } catch (error) {
            setTranslateResult({
                success: false,
                message: 'Bağlantı hatası: ' + (error as Error).message,
            });
        } finally {
            setTranslating(false);
        }
    };

    const contentTypeLabels: Record<keyof ContentTypes, string> = {
        announcements: '📢 Duyurular',
        events: '📅 Etkinlikler',
        projects: '💻 Projeler',
        team: '👥 Ekip Üyeleri',
        sponsors: '🏢 Sponsorlar',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border-4 border-black shadow-neo p-6">
                <h1 className="text-2xl font-black text-black uppercase">Panel Ayarları</h1>
                <p className="text-gray-600 font-bold mt-1">Sistem yapılandırması ve yönetim araçları</p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SETTINGS_MODULES.map(mod => (
                    <Link key={mod.key} href={mod.href} className={`
                ${mod.color} border-4 border-black shadow-neo p-6 
                flex flex-col gap-4 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all
            `}>
                        <div className="w-10 h-10">
                            <mod.icon size={40} strokeWidth={2} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase mb-1">{mod.label}</h2>
                            <p className="text-sm font-bold text-gray-600">{mod.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Batch Translation Section */}
            <div className="bg-neo-cyan border-4 border-black shadow-neo p-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10">
                        <Languages size={40} strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-black uppercase mb-1">Toplu Çeviri</h2>
                        <p className="text-sm font-bold text-gray-700 mb-4">
                            Eksik İngilizce çevirileri DeepL ile tamamla. Çevirmek istediğiniz içerik türlerini seçin.
                        </p>

                        {/* Content Type Checkboxes */}
                        <div className="flex flex-wrap gap-3 mb-4">
                            {(Object.keys(contentTypes) as (keyof ContentTypes)[]).map((type) => (
                                <label
                                    key={type}
                                    className={`flex items-center gap-2 px-3 py-2 border-2 border-black cursor-pointer font-bold text-sm transition-all ${contentTypes[type]
                                            ? 'bg-white shadow-neo-sm'
                                            : 'bg-gray-200 opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={contentTypes[type]}
                                        onChange={() => toggleContentType(type)}
                                        className="w-4 h-4 accent-black"
                                    />
                                    {contentTypeLabels[type]}
                                </label>
                            ))}
                        </div>

                        <button
                            onClick={handleBatchTranslate}
                            disabled={translating}
                            className="px-6 py-3 bg-white border-4 border-black shadow-neo font-black uppercase hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {translating ? '⏳ Çevriliyor...' : '🌐 Seçili İçerikleri Çevir'}
                        </button>

                        {translateResult && (
                            <div className={`mt-4 p-4 border-2 border-black ${translateResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
                                <p className="font-bold">{translateResult.success ? '✅' : '❌'} {translateResult.message}</p>
                                {translateResult.results && (
                                    <div className="mt-2 text-sm font-medium space-y-1">
                                        {Object.entries(translateResult.results).map(([type, stats]) => (
                                            <p key={type}>
                                                {contentTypeLabels[type as keyof ContentTypes] || type}: {stats.translated}/{stats.total} çevrildi
                                                {stats.errors > 0 && ` (${stats.errors} hata)`}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

