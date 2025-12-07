'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../_context/LanguageContext';
import { AlertCircle, BookOpen, Calendar, Gift, Clock } from 'lucide-react';

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

interface CalendarMarker {
    _id: string;
    title: string;
    titleEn?: string;
    type: 'holiday' | 'exam_week' | 'registration_period' | 'semester_break' | 'important';
    startDate: string;
    endDate: string;
    color?: string;
}

const markerConfig: Record<string, { bg: string; text: string; icon: React.ReactNode; label: { tr: string; en: string } }> = {
    holiday: { bg: 'bg-green-200', text: 'text-green-800', icon: <Gift size={14} />, label: { tr: 'Tatil', en: 'Holiday' } },
    exam_week: { bg: 'bg-red-200', text: 'text-red-800', icon: <BookOpen size={14} />, label: { tr: 'Sınav Haftası', en: 'Exam Week' } },
    registration_period: { bg: 'bg-blue-200', text: 'text-blue-800', icon: <Clock size={14} />, label: { tr: 'Kayıt Dönemi', en: 'Registration' } },
    semester_break: { bg: 'bg-orange-200', text: 'text-orange-800', icon: <Calendar size={14} />, label: { tr: 'Yarıyıl Tatili', en: 'Semester Break' } },
    important: { bg: 'bg-yellow-200', text: 'text-yellow-800', icon: <AlertCircle size={14} />, label: { tr: 'Önemli', en: 'Important' } },
};

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [markers, setMarkers] = useState<CalendarMarker[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { language, t } = useLanguage();

    useEffect(() => {
        fetchData();
    }, [currentDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [eventsRes, markersRes] = await Promise.all([
                fetch('/api/events'),
                fetch(`/api/calendar-markers?year=${currentDate.getFullYear()}&month=${currentDate.getMonth()}`),
            ]);

            if (eventsRes.ok) {
                const data = await eventsRes.json();
                setEvents(data);
            }
            if (markersRes.ok) {
                const data = await markersRes.json();
                setMarkers(data);
            }
        } catch (error) {
            console.error('Error loading data:', error);
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

    const getEventTitle = (event: Event) => {
        if (language === 'en' && event.titleEn) return event.titleEn;
        return event.title;
    };

    const getMarkerTitle = (marker: CalendarMarker) => {
        if (language === 'en' && marker.titleEn) return marker.titleEn;
        return marker.title;
    };

    // Helper: Get weeks for the current month view
    const getCalendarWeeks = (year: number, month: number) => {
        const weeks: (Date | null)[][] = [];
        const firstDay = getFirstDayOfMonth(year, month); // 0-6
        const daysInMonth = getDaysInMonth(year, month);

        let currentWeek: (Date | null)[] = [];

        // Prev month padding
        for (let i = 0; i < firstDay; i++) {
            currentWeek.push(null);
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            currentWeek.push(new Date(year, month, day));
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        // Next month padding
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            weeks.push(currentWeek);
        }

        return weeks;
    };

    // Helper: Process events for a specific week to determine layout
    const getWeekEvents = (week: (Date | null)[]) => {
        if (!week[0] && !week[6] && !week.some(d => d !== null)) return { processedItems: [], maxRows: 0 };

        const weekStart = week.find(d => d !== null) || new Date(); // Fallback safe
        const weekEnd = [...week].reverse().find(d => d !== null) || new Date();

        // Adjust to full week range boundaries
        const rangeStart = new Date(weekStart);
        if (week[0] === null) rangeStart.setDate(1); // Start of month
        else rangeStart.setDate(rangeStart.getDate() - week.indexOf(weekStart)); // Back to Monday

        const rangeEnd = new Date(weekEnd);
        if (week[6] === null) rangeEnd.setDate(getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())); // End of month
        else rangeEnd.setDate(rangeEnd.getDate() + (6 - week.indexOf(weekEnd))); // Forward to Sunday

        // Normalize time
        rangeStart.setHours(0, 0, 0, 0);
        rangeEnd.setHours(23, 59, 59, 999);

        // Filter valid items
        const rawItems = [
            ...markers.map(m => ({ ...m, isMarker: true, date: m.startDate })),
            ...events.map(e => ({ ...e, isMarker: false, startDate: e.eventDate, endDate: e.eventDate }))
        ].filter(item => {
            const start = new Date(item.startDate);
            const end = new Date(item.endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            return start <= rangeEnd && end >= rangeStart;
        });

        // Calculate positions
        const processedItems: any[] = [];
        const grid = Array(10).fill(null).map(() => Array(7).fill(false)); // 10 rows max, 7 cols

        rawItems.sort((a, b) => {
            // Sort by start date, then duration (longer first)
            const startA = new Date(a.startDate).getTime();
            const startB = new Date(b.startDate).getTime();
            if (startA !== startB) return startA - startB;

            const durA = new Date(a.endDate).getTime() - startA;
            const durB = new Date(b.endDate).getTime() - startB;
            return durB - durA;
        });

        for (const item of rawItems) {
            const itemStart = new Date(item.startDate);
            const itemEnd = new Date(item.endDate);
            itemStart.setHours(0, 0, 0, 0);
            itemEnd.setHours(0, 0, 0, 0);

            // Determine Start/End indices in this week (0-6)
            // Week days dates matching
            let startIndex = -1;
            let endIndex = -1;

            // Find start index
            for (let i = 0; i < 7; i++) {
                const d = week[i];
                // If day is null (prev/next month), we need actual date for comparison
                // Calculate actual date for the slot
                let slotDate = new Date(rangeStart);
                slotDate.setDate(rangeStart.getDate() + i);
                slotDate.setHours(0, 0, 0, 0);

                if (itemStart <= slotDate && itemEnd >= slotDate) {
                    if (startIndex === -1) startIndex = i;
                    endIndex = i;
                }
            }

            if (startIndex !== -1) {
                // Find first available row
                let rowIndex = 0;
                let foundRow = false;

                while (!foundRow && rowIndex < 10) {
                    let collision = false;
                    for (let i = startIndex; i <= endIndex; i++) {
                        if (grid[rowIndex][i]) {
                            collision = true;
                            break;
                        }
                    }
                    if (!collision) {
                        foundRow = true;
                        // Mark grid
                        for (let i = startIndex; i <= endIndex; i++) {
                            grid[rowIndex][i] = true;
                        }
                    } else {
                        rowIndex++;
                    }
                }

                if (foundRow) {
                    processedItems.push({
                        data: item,
                        start: startIndex,
                        span: endIndex - startIndex + 1,
                        row: rowIndex,
                        isStart: itemStart >= rangeStart && itemStart <= new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate() - (6 - startIndex)), // Rough check
                        isEnd: itemEnd <= rangeEnd
                    });
                }
            }
        }

        return { processedItems, maxRows: Math.max(...processedItems.map(i => i.row), -1) + 1 };
    };


    const renderCalendarWeeks = () => {
        const weeks = getCalendarWeeks(currentDate.getFullYear(), currentDate.getMonth());

        return weeks.map((week, wIdx) => {
            const { processedItems, maxRows } = getWeekEvents(week);
            const rowHeight = 24; // px per event bar
            const headerHeight = 32; // px for day number
            const minHeight = 112; // 7rem
            const dynamicHeight = headerHeight + (maxRows * (rowHeight + 4)) + 10;
            const cellHeight = Math.max(minHeight, dynamicHeight);

            return (
                <div key={`week-${wIdx}`} className="grid grid-cols-7 relative bg-white border-b-2 border-black" style={{ minHeight: `${cellHeight}px` }}>
                    {/* Background Grid Cells */}
                    {week.map((date, dIdx) => {
                        const isToday = date &&
                            date.getDate() === new Date().getDate() &&
                            date.getMonth() === new Date().getMonth() &&
                            date.getFullYear() === new Date().getFullYear();

                        return (
                            <div key={`day-bg-${dIdx}`} className={`border-r-2 border-gray-200 ${dIdx === 6 ? 'border-r-0' : ''} p-2 ${isToday ? 'bg-neo-yellow/10' : ''} ${!date ? 'bg-gray-50' : ''}`}>
                                {date && (
                                    <span className={`font-black text-lg ${isToday ? 'bg-black text-white px-2 rounded-full shadow-neo-sm' : 'text-black'}`}>
                                        {date.getDate()}
                                    </span>
                                )}
                            </div>
                        );
                    })}

                    {/* Events Layer */}
                    <div className="absolute inset-0 top-9 w-full grid grid-cols-7 pointer-events-none px-1">
                        {processedItems.map((item: any, idx: number) => {
                            const isMarker = item.data.isMarker;
                            const config = isMarker ? markerConfig[item.data.type] : null;
                            const bgColor = isMarker ? (config?.bg || 'bg-gray-200') : 'bg-neo-purple';
                            const textColor = isMarker ? (config?.text || 'text-black') : 'text-white';
                            const borderColor = 'border-black';

                            return (
                                <div
                                    key={`evt-${idx}`}
                                    className={`
                                        absolute border-2 h-6 flex items-center px-2 text-xs font-bold shadow-neo-sm truncate cursor-pointer pointer-events-auto transition-transform hover:scale-[1.02] z-10
                                        ${bgColor} ${textColor} ${borderColor}
                                    `}
                                    style={{
                                        left: `${(item.start / 7) * 100}%`,
                                        width: `calc(${(item.span / 7) * 100}%)`, // -4px for gap
                                        top: `${item.row * 28}px`,
                                        borderRadius: '4px',
                                        // margin: '0 2px'
                                        marginLeft: '2px',
                                        marginRight: '2px'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isMarker) {
                                            // Handle event click
                                            const event = item.data;
                                            // You can use a router push here or open modal
                                            if (event.announcementSlug) {
                                                window.location.href = `/announcements/${event.announcementSlug}`;
                                            } else {
                                                window.location.href = `/events/${event._id}/register`;
                                            }
                                        }
                                    }}
                                    title={isMarker ? getMarkerTitle(item.data) : getEventTitle(item.data)}
                                >
                                    <div className="flex items-center gap-1 w-full overflow-hidden">
                                        {isMarker && config?.icon}
                                        {!isMarker && <Calendar size={12} className="shrink-0" />}
                                        <span className="truncate">{isMarker ? getMarkerTitle(item.data) : getEventTitle(item.data)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        });
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

                {/* Legend */}
                <div className="mb-6 flex flex-wrap gap-3 justify-center">
                    {Object.entries(markerConfig).map(([key, config]) => (
                        <div key={key} className={`flex items-center gap-2 px-3 py-1 border-2 border-black ${config.bg} ${config.text} font-bold text-sm shadow-neo-sm`}>
                            {config.icon}
                            <span>{config.label[language]}</span>
                        </div>
                    ))}
                    <div className="flex items-center gap-2 px-3 py-1 border-2 border-black bg-neo-purple text-white font-bold text-sm shadow-neo-sm">
                        <Calendar size={14} />
                        <span>{language === 'tr' ? 'Etkinlik' : 'Event'}</span>
                    </div>
                </div>

                <div className="bg-white border-4 border-black shadow-neo-lg overflow-hidden">
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

                    <div className="grid grid-cols-7 bg-neo-blue border-b-4 border-black text-white">
                        {daysOfWeek[language].map(day => (
                            <div key={day} className="py-2 sm:py-4 text-center font-black text-black border-r-2 border-black last:border-r-0 uppercase text-sm sm:text-base bg-neo-green">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="bg-white">
                        {renderCalendarWeeks()}
                    </div>
                </div>
            </div>
        </div>
    );
}
