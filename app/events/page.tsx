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

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-neo-yellow">
            <div className="text-2xl font-black text-black animate-bounce">Yükleniyor...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-neo-yellow pt-24 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="inline-block text-4xl sm:text-6xl font-black text-black mb-6 bg-white border-4 border-black shadow-neo px-8 py-4 transform -rotate-2">
                        Aktif Etkinlikler
                    </h1>
                    <p className="mt-4 text-xl font-bold text-black max-w-2xl mx-auto bg-white border-2 border-black p-4 shadow-neo-sm transform rotate-1">
                        Başvurusu açık olan etkinliklere buradan kayıt olabilirsiniz.
                    </p>
                </div>

                {events.length === 0 ? (
                    <div className="text-center mt-10">
                        <div className="inline-block bg-white border-4 border-black shadow-neo p-8 transform rotate-1">
                            <p className="text-2xl font-black text-black">
                                Şu anda açık bir etkinlik bulunmamaktadır.
                            </p>
                            <p className="mt-2 font-bold text-gray-600">
                                Daha sonra tekrar kontrol edin!
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {events.map((event, index) => (
                            <div
                                key={event._id}
                                className={`bg-white border-4 border-black shadow-neo flex flex-col transform transition-all duration-200 hover:-translate-y-2 hover:shadow-neo-lg
                                    ${index % 3 === 0 ? 'rotate-1' : index % 3 === 1 ? '-rotate-1' : 'rotate-0'}
                                `}
                            >
                                {event.posterUrl && (
                                    <div className="relative h-56 w-full border-b-4 border-black">
                                        <Image
                                            src={event.posterUrl}
                                            alt={event.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-black text-black mb-3 uppercase leading-tight">
                                        {event.title}
                                    </h3>
                                    <p className="text-black font-medium mb-6 flex-1 line-clamp-3 border-l-4 border-neo-purple pl-3">
                                        {event.description}
                                    </p>
                                    <Link
                                        href={`/events/${event._id}/register`}
                                        className="mt-auto w-full flex justify-center py-3 px-4 border-4 border-black shadow-neo text-lg font-black text-white bg-black hover:bg-white hover:text-black hover:shadow-none transition-all uppercase tracking-wider"
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
