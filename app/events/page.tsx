'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Event {
    _id: string;
    title: string;
    description: string;
    posterUrl?: string;
    createdAt: string;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/events');
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

    if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
                        Aktif Etkinlikler
                    </h1>
                    <p className="mt-4 text-xl text-gray-400">
                        Başvurusu açık olan etkinliklere buradan kayıt olabilirsiniz.
                    </p>
                </div>

                {events.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">
                        Şu anda açık bir etkinlik bulunmamaktadır.
                    </div>
                ) : (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {events.map((event) => (
                            <div key={event._id} className="bg-gray-800 overflow-hidden shadow rounded-lg flex flex-col border border-gray-700">
                                {event.posterUrl && (
                                    <div className="relative h-48 w-full">
                                        <Image
                                            src={event.posterUrl}
                                            alt={event.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        {event.title}
                                    </h3>
                                    <p className="text-gray-300 mb-4 flex-1 line-clamp-3">
                                        {event.description}
                                    </p>
                                    <Link
                                        href={`/events/${event._id}/register`}
                                        className="mt-auto w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Kayıt Ol
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
