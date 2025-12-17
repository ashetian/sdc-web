'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SkeletonForm } from '@/app/_components/Skeleton';
import { useLanguage } from '@/app/_context/LanguageContext';
import { useToast } from '@/app/_context/ToastContext';
import { Button } from '@/app/_components/ui';
import Turnstile from '@/app/_components/Turnstile';

interface Event {
    _id: string;
    title: string;
    titleEn?: string;
    description: string;
    eventDate: string;
    eventEndDate?: string;
    location?: string;
    isOpen: boolean;
    isEnded: boolean;
    allowGuestRegistration: boolean;
    isPaid: boolean;
    price?: number;
    iban?: string;
}

export default function GuestRegisterPage() {
    const params = useParams();
    const router = useRouter();
    const { t, language } = useLanguage();
    const { showToast } = useToast();

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        paymentProofUrl: '',
        kvkkAccepted: false,
    });
    const [uploading, setUploading] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState('');

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch(`/api/events/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setEvent(data);
                } else {
                    router.push('/events');
                }
            } catch (error) {
                console.error('Error fetching event:', error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchEvent();
        }
    }, [params.id, router]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        const file = e.target.files[0];
        const uploadData = new FormData();
        uploadData.append('file', file);

        setUploading(true);
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData,
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            setFormData(prev => ({ ...prev, paymentProofUrl: data.path }));
        } catch (error) {
            showToast('Dosya yüklenemedi', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.kvkkAccepted) {
            showToast(language === 'tr' ? 'KVKK onayı zorunludur' : 'KVKK consent is required', 'error');
            return;
        }

        if (!turnstileToken) {
            showToast(language === 'tr' ? 'Lütfen CAPTCHA doğrulamasını tamamlayın' : 'Please complete the CAPTCHA', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/events/${params.id}/guest-registrations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone || undefined,
                    paymentProofUrl: formData.paymentProofUrl || undefined,
                    turnstileToken,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setSubmitted(true);
            } else {
                showToast(data.error || 'Kayıt oluşturulamadı', 'error');
            }
        } catch (error) {
            showToast('Bir hata oluştu', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <SkeletonForm />;
    }

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neo-yellow">
                <div className="text-2xl font-black text-black">
                    {language === 'tr' ? 'Etkinlik bulunamadı' : 'Event not found'}
                </div>
            </div>
        );
    }

    if (!event.allowGuestRegistration) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-neo-yellow">
                <div className="text-xl font-black text-black bg-white border-4 border-black p-4 shadow-neo">
                    {language === 'tr'
                        ? 'Bu etkinlik sadece öğrencilere açıktır'
                        : 'This event is only open to students'}
                </div>
                <Link href={`/events/${params.id}/register`} className="text-black font-bold underline hover:text-white hover:bg-black px-2">
                    {language === 'tr' ? 'Öğrenci olarak kayıt ol' : 'Register as student'}
                </Link>
            </div>
        );
    }

    if (!event.isOpen || event.isEnded) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-neo-yellow">
                <div className="text-2xl font-black text-red-600 bg-white border-4 border-black p-4 shadow-neo">
                    {event.isEnded
                        ? (language === 'tr' ? 'Bu etkinlik sona erdi' : 'This event has ended')
                        : (language === 'tr' ? 'Kayıtlar kapalı' : 'Registrations closed')}
                </div>
                <Link href="/events" className="text-black font-bold underline hover:text-white hover:bg-black px-2">
                    {language === 'tr' ? 'Etkinliklere dön' : 'Back to events'}
                </Link>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-neo-green py-12 px-4 flex items-center justify-center">
                <div className="max-w-md w-full bg-white border-4 border-black shadow-neo-lg p-8">
                    <div className="text-center mb-6">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-neo-yellow border-4 border-black mb-4">
                            <svg className="h-8 w-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-black uppercase">
                            {language === 'tr' ? 'Başvuru Alındı!' : 'Application Received!'}
                        </h2>
                        <p className="mt-2 text-black font-bold">
                            {language === 'tr'
                                ? 'Başvurunuz yönetici onayı bekliyor. Onaylandığında e-posta ile bilgilendirileceksiniz.'
                                : 'Your application is pending approval. You will be notified by email when approved.'}
                        </p>
                    </div>
                    <Link
                        href="/events"
                        className="w-full flex justify-center py-3 px-4 border-4 border-black shadow-neo text-lg font-black text-black bg-white hover:bg-black hover:text-white transition-all uppercase"
                    >
                        {language === 'tr' ? 'Etkinliklere Dön' : 'Back to Events'}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neo-purple pt-32 pb-12 px-4 flex items-center justify-center">
            <div className="max-w-md w-full bg-white border-4 border-black shadow-neo-lg p-8">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-black uppercase bg-neo-yellow inline-block px-4 py-1 border-2 border-black shadow-neo-sm">
                        {language === 'tr' ? event.title : (event.titleEn || event.title)}
                    </h2>
                    <p className="mt-3 text-sm font-bold text-gray-600">
                        {language === 'tr' ? 'Misafir Katılımcı Kaydı' : 'Guest Registration'}
                    </p>
                </div>

                <div className="bg-purple-100 border-2 border-purple-400 p-3 mb-6">
                    <p className="text-sm font-bold text-purple-800">
                        {language === 'tr'
                            ? '⚠️ Bu kayıt üniversite öğrencisi olmayanlar içindir. Öğrenciyseniz lütfen giriş yaparak kayıt olun.'
                            : '⚠️ This registration is for non-students. If you are a student, please login to register.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-black uppercase mb-1">
                            {language === 'tr' ? 'Ad Soyad *' : 'Full Name *'}
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 border-2 border-black focus:outline-none focus:shadow-neo"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-black uppercase mb-1">
                            {language === 'tr' ? 'E-posta *' : 'Email *'}
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full p-3 border-2 border-black focus:outline-none focus:shadow-neo"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-black uppercase mb-1">
                            {language === 'tr' ? 'Telefon' : 'Phone'}
                        </label>
                        <input
                            type="tel"
                            className="w-full p-3 border-2 border-black focus:outline-none focus:shadow-neo"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="5XX-XXX-XX-XX"
                        />
                    </div>

                    {/* Payment section for paid events */}
                    {event.isPaid && (
                        <div className="bg-neo-purple/20 border-2 border-black p-4 space-y-3">
                            <h3 className="font-black uppercase">
                                {language === 'tr' ? 'Ödeme Bilgileri' : 'Payment Info'}
                            </h3>
                            <div className="bg-white border-2 border-black p-3">
                                <span className="text-sm font-bold text-gray-600">
                                    {language === 'tr' ? 'Ücret' : 'Fee'}
                                </span>
                                <span className="block text-2xl font-black text-black">{event.price} TL</span>
                            </div>
                            <div className="bg-white border-2 border-black p-3">
                                <span className="text-sm font-bold text-gray-600">IBAN</span>
                                <span className="block font-mono font-bold text-black text-sm break-all select-all">
                                    {event.iban}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-black uppercase mb-1">
                                    {language === 'tr' ? 'Dekont Yükle *' : 'Upload Receipt *'}
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    required
                                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:font-black file:bg-white file:text-black hover:file:bg-black hover:file:text-white cursor-pointer"
                                />
                                {uploading && <p className="text-sm text-blue-600 mt-1">Yükleniyor...</p>}
                                {formData.paymentProofUrl && (
                                    <p className="text-sm text-green-600 mt-1">✓ Dekont yüklendi</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* KVKK Consent */}
                    <div className="flex items-start gap-2">
                        <input
                            type="checkbox"
                            id="kvkk"
                            className="mt-1 w-5 h-5 border-2 border-black"
                            checked={formData.kvkkAccepted}
                            onChange={(e) => setFormData({ ...formData, kvkkAccepted: e.target.checked })}
                        />
                        <label htmlFor="kvkk" className="text-sm text-gray-700">
                            <Link href="/kvkk" target="_blank" className="underline font-bold">KVKK</Link>
                            {language === 'tr'
                                ? ' ve kişisel verilerin işlenmesini kabul ediyorum.'
                                : ' and personal data processing consent accepted.'}
                        </label>
                    </div>

                    <Turnstile
                        onVerify={setTurnstileToken}
                        onExpire={() => setTurnstileToken('')}
                        className="flex justify-center"
                    />

                    <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        isLoading={submitting}
                        disabled={!formData.kvkkAccepted || !turnstileToken}
                    >
                        {language === 'tr' ? 'Başvuru Gönder' : 'Submit Application'}
                    </Button>
                </form>

                <div className="mt-4 text-center">
                    <Link
                        href={`/events/${params.id}/register`}
                        className="text-sm font-bold text-gray-600 underline hover:text-black"
                    >
                        {language === 'tr' ? 'Öğrenci misiniz? Giriş yaparak kayıt olun' : 'Are you a student? Login to register'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
