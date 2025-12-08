'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SkeletonForm, SkeletonPageHeader, SkeletonFullPage, SkeletonList } from '@/app/_components/Skeleton';

interface Event {
    _id: string;
    title: string;
    attendanceCode?: string;
    isEnded?: boolean;
}

interface User {
    studentNo: string;
    nickname: string;
    fullName: string;
}

export default function CheckinPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');

    const [event, setEvent] = useState<Event | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');

    // Check authentication
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setCheckingAuth(false);
            }
        };
        checkAuth();
    }, []);

    // Fetch event
    useEffect(() => {
        const fetchEvent = async () => {
            if (!params.id) return;
            try {
                const res = await fetch(`/api/events/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setEvent(data);

                    // Validate code
                    if (data.attendanceCode && data.attendanceCode !== code) {
                        setError('Geçersiz yoklama kodu.');
                    }
                } else {
                    setError('Etkinlik bulunamadı.');
                }
            } catch (e) {
                console.error(e);
                setError('Bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [params.id, code]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            alert('Lütfen bir puan verin.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/events/${params.id}/attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'checkin',
                    rating,
                    feedback: feedback.trim() || undefined,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.error || 'Yoklama yapılamadı.');
            }
        } catch (e) {
            console.error(e);
            setError('Bir hata oluştu.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || checkingAuth) {
        return <SkeletonList items={5} />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-red-500 p-4">
                <div className="text-2xl font-black text-white bg-black p-4 border-4 border-white mb-4">
                    ❌ {error}
                </div>
                <Link href="/events" className="text-white font-bold underline">
                    Etkinliklere Dön
                </Link>
            </div>
        );
    }

    // Not logged in
    if (!user) {
        return (
            <div className="min-h-screen bg-neo-purple pt-32 pb-12 px-4 flex items-center justify-center">
                <div className="max-w-md w-full bg-white border-4 border-black shadow-neo-lg p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-black text-black uppercase mb-4">
                            {event?.title || 'Etkinlik'} - Yoklama
                        </h2>
                        <p className="text-black font-bold">Yoklama yapmak için giriş yapmalısınız.</p>
                    </div>

                    <Link
                        href={`/auth/login?returnUrl=/events/${params.id}/checkin?code=${code}`}
                        className="w-full flex justify-center py-4 px-4 border-4 border-black shadow-neo text-lg font-black text-white bg-black hover:bg-neo-green hover:text-black transition-all uppercase"
                    >
                        Giriş Yap
                    </Link>
                </div>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div className="min-h-screen bg-neo-green py-12 px-4 flex items-center justify-center">
                <div className="max-w-md w-full bg-white border-4 border-black shadow-neo-lg p-8 text-center">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-neo-green border-4 border-black mb-6">
                        <span className="text-4xl">✓</span>
                    </div>
                    <h2 className="text-3xl font-black text-black uppercase mb-4">Yoklama Tamam!</h2>
                    <p className="text-black font-bold mb-6">Katılımınız için teşekkürler!</p>
                    <Link
                        href="/events"
                        className="inline-block py-3 px-6 border-4 border-black shadow-neo text-lg font-black bg-white hover:bg-black hover:text-white transition-all"
                    >
                        Etkinliklere Dön
                    </Link>
                </div>
            </div>
        );
    }

    // Survey form
    return (
        <div className="min-h-screen bg-neo-purple pt-32 pb-12 px-4 flex items-center justify-center">
            <div className="max-w-md w-full bg-white border-4 border-black shadow-neo-lg p-8">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-black uppercase bg-neo-yellow inline-block px-4 py-1 border-2 border-black">
                        {event?.title}
                    </h2>
                    <p className="mt-4 font-bold text-black">Etkinlik Anketi</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Star Rating */}
                    <div>
                        <label className="block text-sm font-black text-black uppercase mb-3">
                            Etkinliği nasıl buldunuz?
                        </label>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`text-4xl transition-transform hover:scale-125 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <p className="text-center text-sm text-gray-500 mt-2">
                            {rating === 0 ? 'Puan vermek için yıldızlara tıklayın' : `${rating} / 5`}
                        </p>
                    </div>

                    {/* Feedback */}
                    <div>
                        <label className="block text-sm font-black text-black uppercase mb-2">
                            Yorumunuz (İsteğe Bağlı)
                        </label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={3}
                            maxLength={500}
                            placeholder="Etkinlik hakkında düşünceleriniz..."
                            className="w-full px-4 py-3 bg-gray-100 border-4 border-black text-black font-medium focus:outline-none focus:shadow-neo focus:bg-white transition-all resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || rating === 0}
                        className="w-full py-4 px-4 border-4 border-black shadow-neo text-lg font-black text-white bg-neo-green hover:bg-white hover:text-black hover:shadow-none transition-all uppercase disabled:opacity-50"
                    >
                        {submitting ? 'Gönderiliyor...' : 'Yoklamayı Tamamla'}
                    </button>
                </form>
            </div>
        </div>
    );
}
