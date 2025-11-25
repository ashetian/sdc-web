'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { downloadICalendar } from '@/app/lib/utils/calendar';

interface Event {
    _id: string;
    title: string;
    description: string;
    eventDate?: string;
    eventEndDate?: string;
    location?: string;
    isPaid: boolean;
    fee?: number;
    paymentIBAN?: string;
    paymentDetails?: string;
    isOpen: boolean;
}

export default function RegisterPage() {
    const params = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [formData, setFormData] = useState({
        studentNumber: '',
        name: '',
        phone: '',
        department: '',
        email: '',
    });
    const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);

    useEffect(() => {
        const fetchEvent = async (id: string) => {
            try {
                // Get all to check if exists, then filter
                const listRes = await fetch('/api/events?mode=admin');
                if (listRes.ok) {
                    const events: Event[] = await listRes.json();
                    const found = events.find(e => e._id === id);
                    if (found) {
                        setEvent(found);
                    } else {
                        alert('Etkinlik bulunamadı.');
                        router.push('/events');
                    }
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // For paid events with receipt upload, use FormData
            if (event && event.isPaid && paymentReceipt) {
                const formDataToSend = new FormData();
                formDataToSend.append('eventId', params.id as string);
                formDataToSend.append('studentNumber', formData.studentNumber);
                formDataToSend.append('name', formData.name);
                formDataToSend.append('phone', formData.phone);
                formDataToSend.append('department', formData.department);
                formDataToSend.append('email', formData.email);
                formDataToSend.append('paymentReceipt', paymentReceipt);

                const res = await fetch('/api/registrations', {
                    method: 'POST',
                    body: formDataToSend,
                });

                const data = await res.json();

                if (res.ok) {
                    setRegistered(true);
                } else {
                    alert(data.error || 'Kayıt olurken bir hata oluştu.');
                }
            } else {
                // For free events or without receipt, use JSON
                const res = await fetch('/api/registrations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        eventId: params.id,
                        ...formData,
                    }),
                });

                const data = await res.json();

                if (res.ok) {
                    setRegistered(true);
                } else {
                    alert(data.error || 'Kayıt olurken bir hata oluştu.');
                }
            }
        } catch (error) {
            console.error('Hata:', error);
            alert('Bir hata oluştu.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddToCalendar = () => {
        if (!event || !event.eventDate) {
            alert('Etkinlik tarihi bilgisi bulunamadı.');
            return;
        }

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

    if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
    if (!event) return <div className="min-h-screen flex items-center justify-center">Etkinlik bulunamadı.</div>;
    if (!event.isOpen) return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
            <div className="text-xl font-bold text-red-600">Bu etkinlik için başvurular kapalı.</div>
            <button onClick={() => router.push('/events')} className="text-blue-600 hover:underline">Etkinliklere Dön</button>
        </div>
    );

    // Success state after registration
    if (registered) return (
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
                <div className="px-6 py-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white">Kayıt Başarılı!</h2>
                        {event.isPaid ? (
                            <>
                                <p className="mt-2 text-gray-400">Kaydınız alındı. Ödemeniz doğrulandıktan sonra kesinleşecektir.</p>
                                <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
                                    <p className="text-sm text-yellow-400">
                                        ⏳ Ödeme Durumu: <span className="font-semibold">Beklemede</span>
                                    </p>
                                    {paymentReceipt && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            Dekont: {paymentReceipt.name}
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <p className="mt-2 text-gray-400">Etkinliğe başarıyla kaydoldunuz.</p>
                        )}
                    </div>

                    <div className="space-y-4">
                        {event?.eventDate && (
                            <button
                                onClick={handleAddToCalendar}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Takvime Ekle
                            </button>
                        )}
                        <button
                            onClick={() => router.push('/events')}
                            className="w-full flex justify-center py-3 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Etkinliklere Dön
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );

    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-700">
                <div className="px-6 py-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white">{event.title}</h2>
                        <p className="mt-2 text-gray-400">Kayıt Formu</p>
                    </div>

                    {event.isPaid && event.fee && (
                        <div className="mb-6 p-4 bg-blue-900/30 border border-blue-600 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-400 mb-3">Ödeme Bilgileri</h3>
                            <div className="space-y-2 text-sm text-gray-300">
                                <div className="flex justify-between items-center">
                                    <span>Etkinlik Ücreti:</span>
                                    <span className="text-xl font-bold text-white">{event.fee} TL</span>
                                </div>
                                <div className="border-t border-blue-600/30 pt-2 mt-2">
                                    <p className="font-medium text-white mb-1">IBAN:</p>
                                    <p className="font-mono text-xs bg-gray-900 p-2 rounded">{event.paymentIBAN}</p>
                                </div>
                                {event.paymentDetails && (
                                    <div className="border-t border-blue-600/30 pt-2 mt-2">
                                        <p className="font-medium text-white mb-1">Ödeme Talimatları:</p>
                                        <p className="text-xs text-gray-400">{event.paymentDetails}</p>
                                    </div>
                                )}
                                <div className="border-t border-blue-600/30 pt-2 mt-2">
                                    <p className="text-yellow-400 text-xs">
                                        ⚠️ Önce yukardaki IBAN&apos;a ödeme yapın, sonra dekont/makbuz yükleyin.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="studentNumber" className="block text-sm font-medium text-gray-300">
                                Öğrenci Numarası
                            </label>
                            <input
                                type="text"
                                id="studentNumber"
                                required
                                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border placeholder-gray-400"
                                value={formData.studentNumber}
                                onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                                Ad Soyad
                            </label>
                            <input
                                type="text"
                                id="name"
                                required
                                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border placeholder-gray-400"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-gray-300">
                                Bölüm
                            </label>
                            <input
                                type="text"
                                id="department"
                                required
                                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border placeholder-gray-400"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                E-posta
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border placeholder-gray-400"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                                Telefon
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                required
                                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border placeholder-gray-400"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        {event.isPaid && (
                            <div>
                                <label htmlFor="paymentReceipt" className="block text-sm font-medium text-gray-300">
                                    Ödeme Dekontu/Makbuzu (PDF) *
                                </label>
                                <input
                                    type="file"
                                    id="paymentReceipt"
                                    accept=".pdf,image/*"
                                    required={event.isPaid}
                                    className="mt-1 block w-full text-sm text-gray-300
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-600 file:text-white
                                        hover:file:bg-blue-700
                                        cursor-pointer"
                                    onChange={(e) => setPaymentReceipt(e.target.files?.[0] || null)}
                                />
                                <p className="mt-1 text-xs text-gray-400">
                                    Banka tarafından verilen ödeme dekontunu veya makbuzunu yükleyin (PDF veya resim).
                                </p>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {submitting ? 'Kaydediliyor...' : 'Kayıt Ol'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
