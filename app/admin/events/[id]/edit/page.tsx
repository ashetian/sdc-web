'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import GlobalLoading from '@/app/_components/GlobalLoading';
import Link from 'next/link';

interface EventData {
    _id: string;
    title: string;
    description: string;
    posterUrl?: string;
    eventDate: string;
    eventEndDate?: string;
    location?: string;
    isOpen: boolean;
    isPaid: boolean;
    price?: number;
    iban?: string;
}

export default function EditEventPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        posterUrl: '',
        eventDate: '',
        eventEndDate: '',
        location: '',
        isOpen: false,
        isPaid: false,
        price: '',
        iban: '',
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchEvent(params.id as string);
        }
    }, [params.id]);

    const fetchEvent = async (id: string) => {
        try {
            const res = await fetch(`/api/events/${id}`);
            if (res.ok) {
                const event: EventData = await res.json();
                setFormData({
                    title: event.title || '',
                    description: event.description || '',
                    posterUrl: event.posterUrl || '',
                    eventDate: event.eventDate ? formatDateTimeForInput(event.eventDate) : '',
                    eventEndDate: event.eventEndDate ? formatDateTimeForInput(event.eventEndDate) : '',
                    location: event.location || '',
                    isOpen: event.isOpen || false,
                    isPaid: event.isPaid || false,
                    price: event.price?.toString() || '',
                    iban: event.iban || '',
                });
            } else {
                alert('Etkinlik bulunamadı.');
                router.push('/admin/events');
            }
        } catch (error) {
            console.error('Etkinlik yüklenirken hata:', error);
            router.push('/admin/events');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTimeForInput = (dateString: string): string => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

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

            if (!res.ok) throw new Error('Yükleme başarısız');

            const data = await res.json();
            setFormData(prev => ({ ...prev, posterUrl: data.path }));
        } catch (error) {
            console.error('Görsel yükleme hatası:', error);
            alert('Görsel yüklenirken bir hata oluştu.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/events/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: formData.price ? parseFloat(formData.price) : undefined,
                }),
            });

            if (res.ok) {
                alert('Etkinlik güncellendi!');
                router.push('/admin/events');
            } else {
                const data = await res.json();
                alert(data.error || 'Etkinlik güncellenirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Hata:', error);
            alert('Bir hata oluştu.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <GlobalLoading />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black text-black uppercase">Etkinlik Düzenle</h1>
                <Link
                    href="/admin/events"
                    className="text-sm font-bold text-gray-500 hover:text-black"
                >
                    ← Geri Dön
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 border-4 border-black shadow-neo">
                <div>
                    <label htmlFor="title" className="block text-sm font-black text-black uppercase mb-1">
                        Etkinlik Başlığı *
                    </label>
                    <input
                        type="text"
                        id="title"
                        required
                        className="block w-full px-4 py-3 border-2 border-black bg-white text-black font-bold focus:outline-none focus:shadow-neo"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-black text-black uppercase mb-1">
                        Açıklama *
                    </label>
                    <textarea
                        id="description"
                        required
                        rows={4}
                        className="block w-full px-4 py-3 border-2 border-black bg-white text-black font-medium focus:outline-none focus:shadow-neo resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-black text-black uppercase mb-1">
                        Afiş
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="block w-full text-sm text-black font-bold file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:font-black file:bg-white file:text-black hover:file:bg-black hover:file:text-white cursor-pointer"
                        />
                        {uploading && <span className="text-sm font-bold text-neo-blue">Yükleniyor...</span>}
                    </div>
                    {formData.posterUrl && (
                        <div className="mt-2 flex items-center gap-4">
                            <Image src={formData.posterUrl} alt="Afiş" width={120} height={80} className="border-2 border-black object-cover" unoptimized />
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, posterUrl: '' }))}
                                className="text-sm font-bold text-red-600 hover:text-red-800"
                            >
                                Kaldır
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-black text-black uppercase mb-1">
                            Etkinlik Tarihi *
                        </label>
                        <input
                            type="date"
                            required
                            className="block w-full px-4 py-3 border-2 border-black bg-white text-black font-bold focus:outline-none focus:shadow-neo"
                            value={formData.eventDate.split('T')[0] || ''}
                            onChange={(e) => {
                                const time = formData.eventDate.split('T')[1] || '12:00';
                                setFormData({ ...formData, eventDate: `${e.target.value}T${time}` });
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-black text-black uppercase mb-1">
                            Saat *
                        </label>
                        <input
                            type="time"
                            required
                            className="block w-full px-4 py-3 border-2 border-black bg-white text-black font-bold focus:outline-none focus:shadow-neo"
                            value={formData.eventDate.split('T')[1] || ''}
                            onChange={(e) => {
                                const date = formData.eventDate.split('T')[0] || new Date().toISOString().split('T')[0];
                                setFormData({ ...formData, eventDate: `${date}T${e.target.value}` });
                            }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-black text-black uppercase mb-1">
                            Bitiş Tarihi
                        </label>
                        <input
                            type="date"
                            className="block w-full px-4 py-3 border-2 border-black bg-white text-black font-bold focus:outline-none focus:shadow-neo"
                            value={formData.eventEndDate.split('T')[0] || ''}
                            onChange={(e) => {
                                const time = formData.eventEndDate.split('T')[1] || '18:00';
                                setFormData({ ...formData, eventEndDate: e.target.value ? `${e.target.value}T${time}` : '' });
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-black text-black uppercase mb-1">
                            Bitiş Saati
                        </label>
                        <input
                            type="time"
                            className="block w-full px-4 py-3 border-2 border-black bg-white text-black font-bold focus:outline-none focus:shadow-neo"
                            value={formData.eventEndDate.split('T')[1] || ''}
                            onChange={(e) => {
                                const date = formData.eventEndDate.split('T')[0] || formData.eventDate.split('T')[0] || new Date().toISOString().split('T')[0];
                                setFormData({ ...formData, eventEndDate: `${date}T${e.target.value}` });
                            }}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-black text-black uppercase mb-1">
                        Konum
                    </label>
                    <input
                        type="text"
                        className="block w-full px-4 py-3 border-2 border-black bg-white text-black font-bold focus:outline-none focus:shadow-neo"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Örnek: Konferans Salonu A"
                    />
                </div>

                <div className="flex items-center gap-6 py-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-5 h-5 border-2 border-black"
                            checked={formData.isOpen}
                            onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
                        />
                        <span className="font-bold text-black">Kayıtlar Açık</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="w-5 h-5 border-2 border-black"
                            checked={formData.isPaid}
                            onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                        />
                        <span className="font-bold text-black">Ücretli Etkinlik</span>
                    </label>
                </div>

                {formData.isPaid && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-neo-purple/10 border-2 border-black">
                        <div>
                            <label className="block text-sm font-black text-black uppercase mb-1">
                                Ücret (TL)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                required={formData.isPaid}
                                className="block w-full px-4 py-3 border-2 border-black bg-white text-black font-bold focus:outline-none focus:shadow-neo"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-black text-black uppercase mb-1">
                                IBAN
                            </label>
                            <input
                                type="text"
                                required={formData.isPaid}
                                placeholder="TR..."
                                className="block w-full px-4 py-3 border-2 border-black bg-white text-black font-bold focus:outline-none focus:shadow-neo"
                                value={formData.iban}
                                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    <Link
                        href="/admin/events"
                        className="px-6 py-3 border-2 border-black bg-white text-black font-black uppercase hover:bg-gray-100 transition-all"
                    >
                        İptal
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 border-2 border-black bg-neo-green text-black font-black uppercase hover:bg-green-400 transition-all disabled:opacity-50"
                    >
                        {saving ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>
            </form>
        </div>
    );
}
