"use client";

import Link from "next/link";
import { Settings, Users, Lock, LucideIcon } from "lucide-react";

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
    { key: 'members', label: 'Üye Yönetimi', href: '/admin/settings/members', color: 'bg-neo-blue', icon: Users, desc: 'Excel yükle, üye listesini yönet' },
    { key: 'access', label: 'Panel Yetkileri', href: '/admin/settings/access', color: 'bg-neo-pink', icon: Lock, desc: 'Yönetici erişim izinleri' },
];

export default function SettingsDashboard() {
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
        </div>
    );
}
