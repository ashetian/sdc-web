'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Event {
    _id: string;
    title: string;
    description: string;
    posterUrl?: string;
    eventDate: string; // ISO string from API
    createdAt: string;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

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

    const months = [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];

    const daysOfWeek = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        // We want 0 = Monday, ..., 6 = Sunday
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1;
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getEventsForDay = (day: number) => {
        return events.filter(event => {
            if (!event.eventDate) return false;

            const eventDate = new Date(event.eventDate);

            return (
                eventDate.getDate() === day &&
                eventDate.getMonth() === currentDate.getMonth() &&
                eventDate.getFullYear() === currentDate.getFullYear()
            );
        });
    };

    const renderCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 sm:h-48 bg-gray-100 border-r-2 border-b-2 border-gray-300"></div>);
        }

        // Days of current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEvents = getEventsForDay(day);
            const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

            days.push(
                <div key={day} className={`min-h-[8rem] sm:min-h-[12rem] bg-white border-r-2 border-b-2 border-black p-2 relative group transition-all hover:bg-blue-50 ${isToday ? 'bg-neo-yellow' : ''}`}>
                    <span className={`absolute top-2 left-2 font-black text-lg ${isToday ? 'bg-black text-white px-2 rounded-full' : 'text-black'}`}>
                        {day}
                    </span>

                    <div className="mt-8 space-y-2">
                        {dayEvents.map(event => (
                            <Link
                                key={event._id}
                                href={`/events/${event._id}/register`}
                                className="block bg-neo-purple text-white text-xs sm:text-sm font-bold p-1 sm:p-2 border-2 border-black shadow-neo-sm hover:scale-105 transition-transform truncate"
                                title={event.title}
                            >
                                {event.title}
                            </Link>
                        ))}
                    </div>
                </div>
            );
        }

        return days;
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-neo-yellow">
            <div className="text-2xl font-black text-black animate-bounce">Yükleniyor...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-neo-yellow pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="inline-block text-4xl sm:text-6xl font-black text-black mb-6 bg-white border-4 border-black shadow-neo px-8 py-4 transform -rotate-2">
                        Etkinlik Takvimi
                    </h1>
                    <p className="mt-4 text-xl font-bold text-black max-w-2xl mx-auto bg-white border-2 border-black p-4 shadow-neo-sm transform rotate-1">
                        Yaklaşan etkinliklerimizi takvimden takip edebilir ve kaydolabilirsiniz.
                    </p>
                </div>

                {/* Calendar Container */}
                <div className="bg-white border-4 border-black shadow-neo-lg">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between p-6 bg-black text-white border-b-4 border-black">
                        <button
                            onClick={prevMonth}
                            className="p-2 hover:bg-white hover:text-black border-2 border-transparent hover:border-white transition-colors"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h2 className="text-3xl font-black uppercase tracking-wider">
                            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <button
                            onClick={nextMonth}
                            className="p-2 hover:bg-white hover:text-black border-2 border-transparent hover:border-white transition-colors"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Days of Week Header */}
                    <div className="grid grid-cols-7 bg-neo-blue border-b-4 border-black">
                        {daysOfWeek.map(day => (
                            <div key={day} className="py-4 text-center font-black text-black border-r-2 border-black last:border-r-0 uppercase">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 bg-gray-200 border-b-2 border-black">
                        {renderCalendarDays()}
                    </div>
                </div>
            </div>
        </div>
    );
}
