'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Event {
    _id: string;
    title: string;
    isOpen: boolean;
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

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Etkinlik Yönetimi</h1>
                <Link
                    href="/admin/events/create"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    Yeni Etkinlik Oluştur
                </Link>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Etkinlik Adı
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Durum
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Oluşturulma Tarihi
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                İşlemler
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {events.map((event) => (
                            <tr key={event._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-xs text-gray-500 font-mono select-all">{event._id}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{event.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${event.isOpen
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {event.isOpen ? 'Başvuruya Açık' : 'Kapalı'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(event.createdAt).toLocaleDateString('tr-TR')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    <button
                                        onClick={() => toggleStatus(event._id, event.isOpen)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        {event.isOpen ? 'Kapat' : 'Aç'}
                                    </button>
                                    <Link
                                        href={`/admin/events/${event._id}/registrations`}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        Başvurular
                                    </Link>
                                    <button
                                        onClick={() => deleteEvent(event._id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Sil
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
