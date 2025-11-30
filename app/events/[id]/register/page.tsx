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
    isOpen: boolean;
    isPaid: boolean;
    price?: number;
    iban?: string;
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
        paymentProofUrl: '',
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchEvent = async (id: string) => {
            try {
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

        if (event?.isPaid && !formData.paymentProofUrl) {
            alert('Lütfen ödeme dekontunu yükleyiniz.');
            return;
        }

        setSubmitting(true);

        try {
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Yükleme başarısız');

            const data = await res.json();
            setFormData(prev => ({ ...prev, paymentProofUrl: data.path }));
        } catch (error) {
            console.error('Dosya yükleme hatası:', error);
            alert('Dosya yüklenirken bir hata oluştu.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-neo-yellow">
            <div className="text-2xl font-black text-black animate-bounce">Yükleniyor...</div>
        </div>
    );

    if (!event) return (
        <div className="min-h-screen flex items-center justify-center bg-neo-yellow">
            <div className="text-2xl font-black text-black">Etkinlik bulunamadı.</div>
        </div>
    );

    if (!event.isOpen) return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-neo-yellow">
            <div className="text-2xl font-black text-red-600 bg-white border-4 border-black p-4 shadow-neo">
                Bu etkinlik için başvurular kapalı.
            </div>
            <button onClick={() => router.push('/events')} className="text-black font-bold underline hover:text-white hover:bg-black px-2">
                Etkinliklere Dön
            </button>
        </div>
    );

    if (registered) return (
        <div className="min-h-screen bg-neo-green py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-md w-full bg-white border-4 border-black shadow-neo-lg p-8 transform rotate-1">
                <div className="text-center mb-8">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-neo-green border-4 border-black mb-4">
                        <svg className="h-8 w-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-black uppercase">Kayıt Başarılı!</h2>
                    <p className="mt-2 text-black font-bold">Etkinliğe başarıyla kaydoldunuz.</p>
                </div>

                <div className="space-y-4">
                    {event?.eventDate && (
                        <button
                            onClick={handleAddToCalendar}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 border-4 border-black shadow-neo text-lg font-black text-white bg-neo-blue hover:bg-white hover:text-black hover:shadow-none transition-all uppercase"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Takvime Ekle
                        </button>
                    )}
                    <button
                        onClick={() => router.push('/events')}
                        className="w-full flex justify-center py-3 px-4 border-4 border-black shadow-neo text-lg font-black text-black bg-white hover:bg-black hover:text-white hover:shadow-none transition-all uppercase"
                    >
                        Etkinliklere Dön
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-neo-blue py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto bg-white border-4 border-black shadow-neo-lg overflow-hidden transform -rotate-1">
                <div className="px-6 py-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-black uppercase bg-neo-yellow inline-block px-4 py-1 border-2 border-black shadow-neo-sm transform rotate-1">
                            {event.title}
                        </h2>
                        <p className="mt-4 text-black font-bold text-lg">Kayıt Formu</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="studentNumber" className="block text-sm font-black text-black uppercase mb-1">
                                Öğrenci Numarası
                            </label>
                            <input
                                type="text"
                                id="studentNumber"
                                required
                                className="block w-full px-4 py-3 bg-gray-100 border-4 border-black text-black font-bold focus:outline-none focus:shadow-neo focus:bg-white transition-all"
                                value={formData.studentNumber}
                                onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-black text-black uppercase mb-1">
                                Ad Soyad
                            </label>
                            <input
                                type="text"
                                id="name"
                                required
                                className="block w-full px-4 py-3 bg-gray-100 border-4 border-black text-black font-bold focus:outline-none focus:shadow-neo focus:bg-white transition-all"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="department" className="block text-sm font-black text-black uppercase mb-1">
                                Bölüm
                            </label>
                            <input
                                type="text"
                                id="department"
                                required
                                className="block w-full px-4 py-3 bg-gray-100 border-4 border-black text-black font-bold focus:outline-none focus:shadow-neo focus:bg-white transition-all"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-black text-black uppercase mb-1">
                                E-posta
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                className="block w-full px-4 py-3 bg-gray-100 border-4 border-black text-black font-bold focus:outline-none focus:shadow-neo focus:bg-white transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-black text-black uppercase mb-1">
                                Telefon
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                required
                                className="block w-full px-4 py-3 bg-gray-100 border-4 border-black text-black font-bold focus:outline-none focus:shadow-neo focus:bg-white transition-all"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        {event.isPaid && (
                            <div className="bg-neo-purple p-6 border-4 border-black shadow-neo-sm space-y-4">
                                <h3 className="text-xl font-black text-white border-b-4 border-black pb-2 uppercase">Ödeme Bilgileri</h3>
                                <div className="grid grid-cols-1 gap-4 text-sm">
                                    <div className="bg-white border-2 border-black p-2">
                                        <span className="text-black font-bold block">Ücret:</span>
                                        <span className="text-black font-black text-xl">{event.price} TL</span>
                                    </div>
                                    <div className="bg-white border-2 border-black p-2">
                                        <span className="text-black font-bold block">IBAN:</span>
                                        <span className="text-black font-mono font-bold select-all break-all">{event.iban}</span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-black text-white uppercase mb-2">
                                            Ödeme Dekontu (PDF)
                                        </label>
                                        <input
                                            type="file"
                                            accept=".pdf,application/pdf"
                                            onChange={handleFileUpload}
                                            className="block w-full text-sm text-black font-bold file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:text-sm file:font-black file:bg-white file:text-black hover:file:bg-black hover:file:text-white transition-all cursor-pointer bg-white border-2 border-black p-1"
                                        />
                                        {uploading && <span className="text-sm text-yellow-300 font-bold mt-1 block bg-black inline-block px-2">Yükleniyor...</span>}
                                        {formData.paymentProofUrl && <span className="text-sm text-green-300 font-bold mt-1 block bg-black inline-block px-2">Dekont yüklendi.</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex justify-center py-4 px-4 border-4 border-black shadow-neo text-lg font-black text-white bg-black hover:bg-white hover:text-black hover:shadow-none transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
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
