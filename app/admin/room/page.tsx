'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../_context/LanguageContext';
import SkeletonPage from '../../_components/Skeleton';
import { Save, ToggleLeft, ToggleRight, MapPin } from 'lucide-react';

export default function RoomStatus() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [settings, setSettings] = useState({
        club_room_exists: 'false',
        club_room_is_open: 'false',
    });
    const { t } = useLanguage();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings({
                    club_room_exists: data.club_room_exists || 'false',
                    club_room_is_open: data.club_room_is_open || 'false',
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (key: string, value: string) => {
        setSubmitting(true);
        // Optimistic update
        setSettings(prev => ({ ...prev, [key]: value }));

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value }),
            });

            if (!res.ok) throw new Error('Failed to update');
        } catch (error) {
            console.error('Error updating setting:', error);
            // Revert on error
            fetchSettings();
            alert('Ayar güncellenirken bir hata oluştu.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <SkeletonPage />;

    return (
        <div className="p-6 sm:p-10 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black uppercase">Kulüp Odası Durumu</h1>
                <p className="text-gray-600 font-medium">Oda durumunu buradan yönetin. (IoT sistemine manuel müdahale)</p>
            </div>

            <div className="bg-white border-4 border-black shadow-neo-lg p-6 sm:p-8 space-y-8 max-w-2xl">

                {/* 1. Odamız Var Mı? */}
                <div className="flex items-center justify-between p-4 bg-gray-50 border-2 border-black">
                    <div className="space-y-1">
                        <label className="text-lg font-black flex items-center gap-2">
                            <MapPin size={24} />
                            Fiziksel Oda Mevcut mu?
                        </label>
                        <p className="text-sm text-gray-500">
                            Bunu açarsanız sitede oda durumu göstergesi aktif olur.
                        </p>
                    </div>
                    <button
                        onClick={() => updateSetting('club_room_exists', settings.club_room_exists === 'true' ? 'false' : 'true')}
                        className={`
                            relative inline-flex h-8 w-16 items-center rounded-full border-2 border-black transition-colors focus:outline-none
                            ${settings.club_room_exists === 'true' ? 'bg-neo-green' : 'bg-gray-200'}
                        `}
                    >
                        <span
                            className={`
                                inline-block h-6 w-6 transform rounded-full bg-white border-2 border-black transition-transform
                                ${settings.club_room_exists === 'true' ? 'translate-x-8' : 'translate-x-1'}
                            `}
                        />
                    </button>
                </div>

                {/* 2. Oda Açık/Kapalı Durumu (Sadece oda varsa göster) */}
                {settings.club_room_exists === 'true' && (
                    <div className={`
                        flex flex-col items-center justify-center p-8 border-4 border-black shadow-neo-sm transition-colors
                        ${settings.club_room_is_open === 'true' ? 'bg-neo-green/20' : 'bg-red-100'}
                    `}>
                        <h2 className="text-2xl font-black mb-6">Şu Anki Durum</h2>

                        <div className="flex items-center gap-8">
                            <span className={`text-xl font-bold ${settings.club_room_is_open === 'false' ? 'text-red-600' : 'text-gray-400'}`}>
                                KAPALI
                            </span>

                            <button
                                onClick={() => updateSetting('club_room_is_open', settings.club_room_is_open === 'true' ? 'false' : 'true')}
                                className="relative focus:outline-none transform transition-transform active:scale-95"
                            >
                                {/* Custom Switch/Lever Design */}
                                <div className={`w-32 h-16 rounded-full border-4 border-black relative transition-colors ${settings.club_room_is_open === 'true' ? 'bg-neo-green' : 'bg-red-500'}`}>
                                    <div className={`
                                        absolute top-1 left-1 w-12 h-12 bg-white border-4 border-black rounded-full shadow-sm transition-transform duration-300
                                        ${settings.club_room_is_open === 'true' ? 'translate-x-16' : 'translate-x-0'}
                                    `}>
                                        {/* Status Icon inside Knob */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {submitting ? (
                                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                settings.club_room_is_open === 'true' ? <ToggleRight size={24} /> : <ToggleLeft size={24} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </button>

                            <span className={`text-xl font-bold ${settings.club_room_is_open === 'true' ? 'text-green-600' : 'text-gray-400'}`}>
                                AÇIK
                            </span>
                        </div>

                        <p className="mt-6 text-center font-bold text-gray-700">
                            {settings.club_room_is_open === 'true'
                                ? "Oda şu an öğrencilere AÇIK olarak görünüyor. 🟢"
                                : "Oda şu an KAPALI olarak görünüyor. 🔴"
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
