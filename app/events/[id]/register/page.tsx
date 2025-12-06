'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { downloadICalendar } from '@/app/lib/utils/calendar';
import Link from 'next/link';

interface Event {
    _id: string;
    title: string;
    description: string;
    eventDate?: string;
    eventEndDate?: string;
    location?: string;
    isOpen: boolean;
    isPaid: boolean;
    price?: number;
    iban?: string;
    isEnded?: boolean;
}

interface User {
    studentNo: string;
    nickname: string;
    fullName: string;
}

export default function RegisterPage() {
    const params = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [alreadyRegistered, setAlreadyRegistered] = useState(false);

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

    // Check if already registered
    useEffect(() => {
        const checkRegistration = async () => {
            if (!user || !params.id) return;
            try {
                const res = await fetch(`/api/events/${params.id}/registrations`);
                if (res.ok) {
                    const registrations = await res.json();
                    const isReg = registrations.some((r: any) =>
                        r.memberId?._id === user.studentNo || r.memberId?.studentNo === user.studentNo
                    );
                    setAlreadyRegistered(isReg);
                }
            } catch (error) {
                console.error('Registration check error:', error);
            }
        };
        checkRegistration();
    }, [user, params.id]);

    const handleRegister = async () => {
        if (!user) {
            router.push(`/login?redirect=/events/${params.id}/register`);
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/events/${params.id}/registrations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();

            if (res.ok) {
                setRegistered(true);
            } else {
                alert(data.error || 'Kayıt sırasında hata oluştu.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Bir hata oluştu.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddToCalendar = () => {
        if (!event || !event.eventDate) return;
        downloadICalendar(
            {
                title: event.title,
                description: event.description,
                eventDate: event.eventDate,
                eventEndDate: event.eventEndDate,
                location: event.location,
            },
            `${event.title.replace(/\s+/g, '-').toLowerCase()}.ics`
        );
    };

    if (loading || checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neo-yellow">
                <div className="text-2xl font-black text-black animate-bounce">Yükleniyor...</div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neo-yellow">
                <div className="text-2xl font-black text-black">Etkinlik bulunamadı.</div>
            </div>
        );
    }

    if (!event.isOpen || event.isEnded) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-neo-yellow">
                <div className="text-2xl font-black text-red-600 bg-white border-4 border-black p-4 shadow-neo">
                    {event.isEnded ? 'Bu etkinlik sona ermiş.' : 'Bu etkinlik için kayıtlar kapalı.'}
                </div>
                <Link href="/events" className="text-black font-bold underline hover:text-white hover:bg-black px-2">
                    Etkinliklere Dön
                </Link>
            </div>
        );
    }

    // Success state
    if (registered || alreadyRegistered) {
        return (
            <div className="min-h-screen bg-neo-green py-12 px-4 flex items-center justify-center">
                <div className="max-w-md w-full bg-white border-4 border-black shadow-neo-lg p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-neo-green border-4 border-black mb-4">
                            <svg className="h-8 w-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-black text-black uppercase">
                            {alreadyRegistered && !registered ? 'Zaten Kayıtlısınız!' : 'Kayıt Başarılı!'}
                        </h2>
                        <p className="mt-2 text-black font-bold">Etkinliğe kaydınız tamamlandı.</p>
                    </div>

                    <div className="space-y-4">
                        {event.eventDate && (
                            <button
                                onClick={handleAddToCalendar}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 border-4 border-black shadow-neo text-lg font-black text-white bg-neo-blue hover:bg-white hover:text-black hover:shadow-none transition-all uppercase"
                            >
                                📅 Takvime Ekle
                            </button>
                        )}
                        <Link
                            href="/events"
                            className="w-full flex justify-center py-3 px-4 border-4 border-black shadow-neo text-lg font-black text-black bg-white hover:bg-black hover:text-white hover:shadow-none transition-all uppercase"
                        >
                            Etkinliklere Dön
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Not logged in - show login prompt
    if (!user) {
        return (
            <div className="min-h-screen bg-neo-blue pt-32 pb-12 px-4 flex items-center justify-center">
                <div className="max-w-md w-full bg-white border-4 border-black shadow-neo-lg p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black text-black uppercase mb-4">{event.title}</h2>
                        <p className="text-black font-bold">Bu etkinliğe kayıt olmak için giriş yapmalısınız.</p>
                    </div>

                    <div className="space-y-4">
                        <Link
                            href={`/auth/login?redirect=/events/${params.id}/register`}
                            className="w-full flex justify-center py-4 px-4 border-4 border-black shadow-neo text-lg font-black text-white bg-black hover:bg-neo-green hover:text-black hover:shadow-none transition-all uppercase"
                        >
                            Giriş Yap
                        </Link>
                        <Link
                            href="/events"
                            className="w-full flex justify-center py-3 px-4 border-2 border-black text-black font-bold hover:bg-gray-100 transition-all"
                        >
                            ← Etkinliklere Dön
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Logged in - show registration confirmation
    return (
        <div className="min-h-screen bg-neo-blue pt-32 pb-12 px-4 flex items-center justify-center">
            <div className="max-w-md w-full bg-white border-4 border-black shadow-neo-lg p-8">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-black uppercase bg-neo-yellow inline-block px-4 py-1 border-2 border-black shadow-neo-sm">
                        {event.title}
                    </h2>
                </div>

                {/* User Info Display */}
                <div className="bg-gray-50 border-2 border-black p-4 mb-6">
                    <h3 className="font-black text-sm uppercase text-gray-600 mb-2">Kayıt Bilgileriniz</h3>
                    <p className="font-bold text-lg text-black">{user.fullName || user.nickname}</p>
                    <p className="text-gray-600 font-medium">{user.studentNo}</p>
                </div>

                {/* Payment Info for Paid Events */}
                {event.isPaid && (
                    <div className="bg-neo-purple p-4 border-4 border-black shadow-neo-sm mb-6">
                        <h3 className="text-lg font-black text-white mb-3 uppercase">Ödeme Bilgileri</h3>
                        <div className="bg-white border-2 border-black p-3 mb-2">
                            <span className="text-sm font-bold text-gray-600">Ücret:</span>
                            <span className="block text-2xl font-black text-black">{event.price} TL</span>
                        </div>
                        <div className="bg-white border-2 border-black p-3">
                            <span className="text-sm font-bold text-gray-600">IBAN:</span>
                            <span className="block font-mono font-bold text-black text-sm break-all select-all">{event.iban}</span>
                        </div>
                        <p className="text-white text-sm font-bold mt-3">
                            ⚠️ Ödemenizi yaptıktan sonra kaydolun. Admin onayı gerekecektir.
                        </p>
                    </div>
                )}

                <button
                    onClick={handleRegister}
                    disabled={submitting}
                    className="w-full py-4 px-4 border-4 border-black shadow-neo text-lg font-black text-white bg-neo-green hover:bg-white hover:text-black hover:shadow-none transition-all uppercase disabled:opacity-50"
                >
                    {submitting ? 'Kaydediliyor...' : '✓ Kaydol'}
                </button>

                <p className="text-center text-sm text-gray-500 font-medium mt-4">
                    Kaydolarak <Link href="/kvkk" className="underline">KVKK Aydınlatma Metni</Link>&apos;ni kabul etmiş olursunuz.
                </p>
            </div>
        </div>
    );
}
