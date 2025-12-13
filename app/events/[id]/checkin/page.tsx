'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SkeletonForm, SkeletonPageHeader, SkeletonFullPage, SkeletonList } from '@/app/_components/Skeleton';
import { useLanguage } from '@/app/_context/LanguageContext';
import { useToast } from '@/app/_context/ToastContext';
import { Button } from '@/app/_components/ui';
import type { Event, User } from '@/app/lib/types/api';

export default function CheckinPage() {
    const params = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [checkedIn, setCheckedIn] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const { t } = useLanguage();
    const { showToast } = useToast();

    // Check authentication
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Auth check error:', error);
            } finally {
                setCheckingAuth(false);
            }
        };
        checkAuth();
    }, []);

    // Fetch event
    useEffect(() => {
        const fetchEvent = async (id: string) => {
            try {
                const res = await fetch(`/api/events/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setEvent(data);
                } else {
                    router.push('/events');
                }
            } catch (error) {
                console.error('Etkinlik yüklenirken hata:', error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchEvent(params.id as string);
        }
    }, [params.id, router]);

    const handleCheckin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !event) return;

        if (rating === 0) {
            showToast(t('events.checkinPage.rateError'), 'error');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/events/${params.id}/checkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rating,
                    comment
                }),
            });

            if (res.ok) {
                setCheckedIn(true);
                showToast(t('events.checkinPage.successMessage'), 'success');
            } else {
                const data = await res.json();
                showToast(data.error || t('events.checkinPage.error'), 'error');
            }
        } catch (error) {
            console.error('Checkin error:', error);
            showToast(t('events.checkinPage.error'), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || checkingAuth) {
        return <SkeletonForm />;
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-neo-blue pt-32 pb-12 px-4 flex items-center justify-center">
                <div className="max-w-md w-full bg-white border-4 border-black shadow-neo-lg p-8">
                    <p className="text-black font-bold text-center mb-6">{t('events.checkinPage.loginRequired')}</p>
                    <button
                        onClick={() => router.push(`/auth/login?returnUrl=${encodeURIComponent(`/events/${params.id}/checkin`)}`)}
                        className="w-full py-4 px-4 border-4 border-black shadow-neo text-lg font-black text-white bg-black hover:bg-neo-green hover:text-black hover:shadow-none transition-all uppercase"
                    >
                        {t('events.registerPage.login')}
                    </button>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neo-yellow">
                <div className="text-2xl font-black text-black">{t('events.checkinPage.notFound')}</div>
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
                    <h2 className="text-3xl font-black text-black uppercase mb-2">
                        {t('events.checkinPage.successTitle')}
                    </h2>
                    <p className="text-black font-bold">{t('events.checkinPage.successMessage')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neo-blue pt-32 pb-12 px-4 flex items-center justify-center">
            <div className="max-w-md w-full bg-white border-4 border-black shadow-neo-lg p-8">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-black uppercase bg-neo-yellow inline-block px-4 py-1 border-2 border-black shadow-neo-sm">
                        {event.title}
                    </h2>
                    <h3 className="text-xl font-black text-gray-500 mt-2 uppercase">{t('events.checkinPage.title')}</h3>
                </div>

                <form onSubmit={handleCheckin} className="space-y-6">
                    {/* Rating */}
                    <div className="space-y-2">
                        <label className="block text-sm font-black uppercase">{t('events.checkinPage.ratePrompt')}</label>
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
                        {rating === 0 && (
                            <p className="text-center text-xs text-gray-500 font-bold">{t('events.checkinPage.ratePlaceholder')}</p>
                        )}
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <label className="block text-sm font-black uppercase">{t('events.checkinPage.commentPrompt')}</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-3 border-2 border-black shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[100px] resize-none"
                            placeholder={t('events.checkinPage.commentPlaceholder')}
                        />
                    </div>

                    <Button
                        type="submit"
                        isLoading={submitting}
                        fullWidth
                        size="lg"
                    >
                        {t('events.checkinPage.submit')}
                    </Button>
                </form>
            </div>
        </div>
    );
}
