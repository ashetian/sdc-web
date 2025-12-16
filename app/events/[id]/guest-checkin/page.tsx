'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { SkeletonForm } from '@/app/_components/Skeleton';
import { useLanguage } from '@/app/_context/LanguageContext';
import { useToast } from '@/app/_context/ToastContext';
import { Button } from '@/app/_components/ui';
import Link from 'next/link';

interface Event {
    _id: string;
    title: string;
    titleEn?: string;
    isEnded: boolean;
}

export default function GuestCheckinPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { language } = useLanguage();
    const { showToast } = useToast();

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [checkedIn, setCheckedIn] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState<string | null>(null);

    const token = searchParams.get('token');

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch(`/api/events/${params.id}`);
                if (res.ok) {
                    setEvent(await res.json());
                } else {
                    setError(language === 'tr' ? 'Etkinlik bulunamadı' : 'Event not found');
                }
            } catch (err) {
                setError(language === 'tr' ? 'Bir hata oluştu' : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchEvent();
        }
    }, [params.id, language]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            showToast(language === 'tr' ? 'Lütfen puan verin' : 'Please rate the event', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/events/${params.id}/guest-checkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, rating, feedback }),
            });

            const data = await res.json();

            if (res.ok) {
                setCheckedIn(true);
            } else {
                showToast(data.error || 'Yoklama yapılamadı', 'error');
            }
        } catch (err) {
            showToast('Bir hata oluştu', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <SkeletonForm />;
    }

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neo-yellow">
                <div className="max-w-md bg-white border-4 border-black shadow-neo p-6 text-center">
                    <h2 className="text-xl font-black text-red-600 mb-4">
                        {language === 'tr' ? 'Geçersiz Link' : 'Invalid Link'}
                    </h2>
                    <p className="text-gray-600 font-bold">
                        {language === 'tr'
                            ? 'Yoklama linkiniz geçersiz. Lütfen e-postanızdaki linki kullanın.'
                            : 'Your check-in link is invalid. Please use the link from your email.'}
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neo-yellow">
                <div className="text-2xl font-black text-red-600 bg-white border-4 border-black p-4 shadow-neo">
                    {error}
                </div>
            </div>
        );
    }

    if (event?.isEnded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neo-yellow">
                <div className="max-w-md bg-white border-4 border-black shadow-neo p-6 text-center">
                    <h2 className="text-xl font-black text-red-600 mb-4">
                        {language === 'tr' ? 'Etkinlik Sona Erdi' : 'Event Ended'}
                    </h2>
                    <p className="text-gray-600 font-bold">
                        {language === 'tr'
                            ? 'Bu etkinlik için yoklama süresi sona ermiştir.'
                            : 'The check-in period for this event has ended.'}
                    </p>
                </div>
            </div>
        );
    }

    if (checkedIn) {
        return (
            <div className="min-h-screen bg-neo-green py-12 px-4 flex items-center justify-center">
                <div className="max-w-md w-full bg-white border-4 border-black shadow-neo-lg p-8 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-neo-green border-4 border-black mb-4">
                        <svg className="h-8 w-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-black uppercase mb-2">
                        {language === 'tr' ? 'Yoklama Başarılı!' : 'Check-in Successful!'}
                    </h2>
                    <p className="text-black font-bold">
                        {language === 'tr' ? 'Etkinliğe hoş geldiniz!' : 'Welcome to the event!'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neo-blue pt-32 pb-12 px-4 flex items-center justify-center">
            <div className="max-w-md w-full bg-white border-4 border-black shadow-neo-lg p-8">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-black uppercase bg-neo-yellow inline-block px-4 py-1 border-2 border-black shadow-neo-sm">
                        {language === 'tr' ? event?.title : (event?.titleEn || event?.title)}
                    </h2>
                    <h3 className="text-lg font-black text-gray-500 mt-2 uppercase">
                        {language === 'tr' ? 'Misafir Yoklama' : 'Guest Check-in'}
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Rating */}
                    <div className="space-y-2">
                        <label className="block text-sm font-black uppercase">
                            {language === 'tr' ? 'Etkinliği puanlayın' : 'Rate the event'}
                        </label>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`text-4xl transition-all transform hover:scale-110 ${rating >= star ? 'text-neo-yellow' : 'text-gray-300'
                                        }`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Feedback */}
                    <div className="space-y-2">
                        <label className="block text-sm font-black uppercase">
                            {language === 'tr' ? 'Yorum (isteğe bağlı)' : 'Feedback (optional)'}
                        </label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="w-full p-3 border-2 border-black shadow-neo-sm focus:outline-none min-h-[100px] resize-none"
                            placeholder={language === 'tr' ? 'Düşüncelerinizi paylaşın...' : 'Share your thoughts...'}
                        />
                    </div>

                    <Button
                        type="submit"
                        isLoading={submitting}
                        fullWidth
                        size="lg"
                    >
                        {language === 'tr' ? 'Yoklamayı Tamamla' : 'Complete Check-in'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
