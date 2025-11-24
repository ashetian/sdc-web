'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Event {
    _id: string;
    title: string;
    description: string;
    isOpen: boolean;
}

export default function RegisterPage() {
    const params = useParams();
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        studentNumber: '',
        name: '',
        phone: '',
        department: '',
        email: '',
    });

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
                alert('Kaydınız başarıyla alındı!');
                router.push('/events');
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

    if (loading) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
    if (!event) return <div className="min-h-screen flex items-center justify-center">Etkinlik bulunamadı.</div>;
    if (!event.isOpen) return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
            <div className="text-xl font-bold text-red-600">Bu etkinlik için başvurular kapalı.</div>
            <button onClick={() => router.push('/events')} className="text-blue-600 hover:underline">Etkinliklere Dön</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
                        <p className="mt-2 text-gray-600">Kayıt Formu</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="studentNumber" className="block text-sm font-medium text-gray-700">
                                Öğrenci Numarası
                            </label>
                            <input
                                type="text"
                                id="studentNumber"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                value={formData.studentNumber}
                                onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Ad Soyad
                            </label>
                            <input
                                type="text"
                                id="name"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                                Bölüm
                            </label>
                            <input
                                type="text"
                                id="department"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                E-posta
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Telefon
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

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
