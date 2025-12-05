'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/app/_components/LoadingSpinner';

interface Event {
    _id: string;
    title: string;
    isOpen: boolean;
    isPaid: boolean;
    price?: number;
    createdAt: string;
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/events?mode=admin');
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (error) {
            console.error('Etkinlikler yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isOpen: !currentStatus }),
            });
            if (res.ok) {
                fetchEvents();
            }
        } catch (error) {
            console.error('Durum güncellenirken hata:', error);
        }
    };

    const deleteEvent = async (id: string) => {
        if (!confirm('Bu etkinliği silmek istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`/api/events/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchEvents();
            }
        } catch (error) {
            console.error('Etkinlik silinirken hata:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border-4 border-black shadow-neo p-6 flex justify-between items-center">
                <h1 className="text-2xl font-black text-black uppercase">Etkinlik Yönetimi</h1>
                <Link
                    href="/admin/events/create"
                    className="bg-neo-green text-black border-4 border-black shadow-neo px-6 py-3 font-black uppercase hover:bg-white hover:shadow-none transition-all"
                >
                    + Yeni Etkinlik
                </Link>
            </div>

            {/* Events List */}
            <div className="bg-white border-4 border-black shadow-neo overflow-hidden">
                {events.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 font-bold">Henüz etkinlik bulunmuyor.</p>
                    </div>
                ) : (
                    <table className="min-w-full">
                        <thead className="bg-black text-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider">
                                    Etkinlik Adı
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider">
                                    Durum
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider">
                                    Ücret
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider">
                                    Tarih
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-black uppercase tracking-wider">
                                    İşlemler
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-black">
                            {events.map((event) => (
                                <tr key={event._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-base font-black text-black">{event.title}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-3 py-1 text-xs font-black border-2 border-black uppercase ${event.isOpen
                                                ? 'bg-neo-green text-black'
                                                : 'bg-red-500 text-white'
                                                }`}
                                        >
                                            {event.isOpen ? 'Açık' : 'Kapalı'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {event.isPaid ? (
                                            <span className="bg-neo-purple text-white px-3 py-1 text-xs font-black border-2 border-black">
                                                {event.price} TL
                                            </span>
                                        ) : (
                                            <span className="bg-gray-200 text-black px-3 py-1 text-xs font-black border-2 border-black">
                                                ÜCRETSİZ
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-600">
                                        {new Date(event.createdAt).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                        <button
                                            onClick={() => toggleStatus(event._id, event.isOpen)}
                                            className={`px-3 py-1 text-xs font-black border-2 border-black transition-all ${event.isOpen
                                                ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                                                : 'bg-neo-green text-black hover:bg-green-400'
                                                }`}
                                        >
                                            {event.isOpen ? 'Kapat' : 'Aç'}
                                        </button>
                                        <Link
                                            href={`/admin/events/${event._id}/registrations`}
                                            className="inline-block px-3 py-1 text-xs font-black bg-neo-blue text-black border-2 border-black hover:bg-blue-300 transition-all"
                                        >
                                            Başvurular
                                        </Link>
                                        <button
                                            onClick={() => deleteEvent(event._id)}
                                            className="px-3 py-1 text-xs font-black bg-red-500 text-white border-2 border-black hover:bg-red-600 transition-all"
                                        >
                                            Sil
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
