'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../_context/LanguageContext';

interface Event {
    _id: string;
    title: string;
    titleEn?: string;
    description: string;
    descriptionEn?: string;
    posterUrl?: string;
    eventDate: string;
    createdAt: string;
    announcementSlug?: string;
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { language, t } = useLanguage();

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
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    const months = {
        tr: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
        en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    };

    const daysOfWeek = {
        tr: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
        en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    };

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
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

    const handleDayClick = (dayEvents: Event[]) => {
        if (window.innerWidth < 640 && dayEvents.length > 0) {
            setSelectedEvents(dayEvents);
            setIsModalOpen(true);
        }
    };

    const getEventTitle = (event: Event) => {
        if (language === 'en' && event.titleEn) return event.titleEn;
        return event.title;
    };

    const renderCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 sm:h-48 bg-gray-100 border-r-2 border-b-2 border-gray-300"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayEvents = getEventsForDay(day);
            const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

            const hasEvents = dayEvents.length > 0;

            let bgClass = '';
            if (hasEvents) {
                bgClass = 'bg-neo-purple sm:bg-white';
                if (isToday) bgClass = 'bg-neo-purple sm:bg-neo-yellow';
            } else {
                bgClass = isToday ? 'bg-neo-yellow' : 'bg-white';
            }

            days.push(
                <div
                    key={day}
                    onClick={() => handleDayClick(dayEvents)}
                    className={`h-24 sm:h-auto sm:min-h-[12rem] border-r-2 border-b-2 border-black p-2 relative group transition-all hover:bg-blue-50 ${bgClass} ${hasEvents ? 'cursor-pointer sm:cursor-default' : ''}`}
                >
                    <span className={`absolute top-2 left-2 font-black text-lg ${isToday ? 'bg-black text-white px-2 rounded-full' : (hasEvents ? 'text-white sm:text-black' : 'text-black')}`}>
                        {day}
                    </span>

                    <div className="mt-8 space-y-2 hidden sm:block">
                        {dayEvents.map(event => (
                            <Link
                                key={event._id}
                                href={event.announcementSlug ? `/announcements/${event.announcementSlug}` : `/events/${event._id}/register`}
                                className="block bg-neo-purple text-white text-xs sm:text-sm font-bold p-1 sm:p-2 border-2 border-black shadow-neo-sm hover:scale-105 transition-transform truncate"
                                title={getEventTitle(event)}
                            >
                                {getEventTitle(event)}
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
            <div className="text-2xl font-black text-black animate-bounce">{t('common.loading')}</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-neo-yellow pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="inline-block text-4xl sm:text-6xl font-black text-black mb-6 bg-white border-4 border-black shadow-neo px-8 py-4 transform -rotate-2">
                        {t('events.calendar')}
                    </h1>
                    <p className="mt-4 text-xl font-bold text-black max-w-2xl mx-auto bg-white border-2 border-black p-4 shadow-neo-sm transform rotate-1">
                        {language === 'tr'
                            ? 'Yaklaşan etkinliklerimizi takvimden takip edebilir ve kaydolabilirsiniz.'
                            : 'Follow our upcoming events from the calendar and register.'}
                    </p>
                </div>

                <div className="bg-white border-4 border-black shadow-neo-lg">
                    <div className="flex items-center justify-between p-6 bg-black text-white border-b-4 border-black">
                        <button onClick={prevMonth} className="p-2 hover:bg-white hover:text-black border-2 border-transparent hover:border-white transition-colors">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider">
                            {months[language][currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-white hover:text-black border-2 border-transparent hover:border-white transition-colors">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-7 bg-neo-blue border-b-4 border-black">
                        {daysOfWeek[language].map(day => (
                            <div key={day} className="py-2 sm:py-4 text-center font-black text-black border-r-2 border-black last:border-r-0 uppercase text-sm sm:text-base">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 bg-gray-200 border-b-2 border-black">
                        {renderCalendarDays()}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm sm:hidden" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white border-4 border-black shadow-neo-lg w-full max-w-sm p-6 relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-2 right-2 p-2 hover:bg-red-500 hover:text-white border-2 border-black transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h3 className="text-2xl font-black mb-6 border-b-4 border-black pb-2">{t('nav.events')}</h3>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                            {selectedEvents.map(event => (
                                <Link
                                    key={event._id}
                                    href={event.announcementSlug ? `/announcements/${event.announcementSlug}` : `/events/${event._id}/register`}
                                    className="block bg-neo-purple text-white font-bold p-4 border-2 border-black shadow-neo-sm active:scale-95 transition-transform"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    {getEventTitle(event)}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
