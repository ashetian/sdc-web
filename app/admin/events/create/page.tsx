'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useToast } from '@/app/_context/ToastContext';
import { Button } from '@/app/_components/ui';

export default function CreateEventPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        posterUrl: '',
        eventDate: '',
        eventEndDate: '',
        location: '',
        isOpen: false,
        allowGuestRegistration: false,
        isPaid: false,
        price: '',
        iban: '',
    });
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            setFormData(prev => ({ ...prev, posterUrl: data.path }));
        } catch (error) {
            console.error('Görsel yükleme hatası:', error);
            showToast('Görsel yüklenirken bir hata oluştu.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push('/admin/events');
            } else {
                showToast('Etkinlik oluşturulurken bir hata oluştu.', 'error');
            }
        } catch (error) {
            console.error('Hata:', error);
            showToast('Bir hata oluştu.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-black mb-6">Yeni Etkinlik Oluştur</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow border border-gray-200">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Etkinlik Başlığı
                    </label>
                    <input
                        type="text"
                        id="title"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Açıklama
                    </label>
                    <textarea
                        id="description"
                        required
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border placeholder-gray-400"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div>
                    <label htmlFor="posterUrl" className="block text-sm font-medium text-gray-700">
                        Afiş Yükle (İsteğe Bağlı)
                    </label>
                    <div className="mt-1 flex items-center space-x-4">
                        <input
                            type="file"
                            id="posterUrl"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {uploading && <span className="text-sm text-blue-500">Yükleniyor...</span>}
                    </div>
                    {formData.posterUrl && (
                        <div className="mt-2">
                            <p className="text-sm text-green-600 mb-1">Afiş yüklendi:</p>
                            <Image src={formData.posterUrl} alt="Önizleme" width={300} height={200} className="h-32 w-auto object-cover rounded border border-gray-300" unoptimized />
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, posterUrl: '' }))}
                                className="mt-1 text-xs text-red-600 hover:text-red-800"
                            >
                                Afişi Kaldır
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="eventDateDay" className="block text-sm font-medium text-gray-700">
                            Etkinlik Tarihi *
                        </label>
                        <input
                            type="date"
                            id="eventDateDay"
                            required
                            className="mt-1 block w-full rounded-md border-2 border-black bg-white text-gray-900 shadow-sm focus:border-neo-blue focus:ring-neo-blue p-3 font-bold"
                            value={formData.eventDate.split('T')[0] || ''}
                            onChange={(e) => {
                                const time = formData.eventDate.split('T')[1] || '12:00';
                                setFormData({ ...formData, eventDate: `${e.target.value}T${time}` });
                            }}
                        />
                    </div>
                    <div>
                        <label htmlFor="eventDateTime" className="block text-sm font-medium text-gray-700">
                            Saat *
                        </label>
                        <input
                            type="time"
                            id="eventDateTime"
                            required
                            className="mt-1 block w-full rounded-md border-2 border-black bg-white text-gray-900 shadow-sm focus:border-neo-blue focus:ring-neo-blue p-3 font-bold"
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
                        <label htmlFor="eventEndDateDay" className="block text-sm font-medium text-gray-700">
                            Bitiş Tarihi (İsteğe Bağlı)
                        </label>
                        <input
                            type="date"
                            id="eventEndDateDay"
                            className="mt-1 block w-full rounded-md border-2 border-black bg-white text-gray-900 shadow-sm focus:border-neo-blue focus:ring-neo-blue p-3 font-bold"
                            value={formData.eventEndDate.split('T')[0] || ''}
                            onChange={(e) => {
                                const time = formData.eventEndDate.split('T')[1] || '18:00';
                                setFormData({ ...formData, eventEndDate: e.target.value ? `${e.target.value}T${time}` : '' });
                            }}
                        />
                    </div>
                    <div>
                        <label htmlFor="eventEndDateTime" className="block text-sm font-medium text-gray-700">
                            Bitiş Saati
                        </label>
                        <input
                            type="time"
                            id="eventEndDateTime"
                            className="mt-1 block w-full rounded-md border-2 border-black bg-white text-gray-900 shadow-sm focus:border-neo-blue focus:ring-neo-blue p-3 font-bold"
                            value={formData.eventEndDate.split('T')[1] || ''}
                            onChange={(e) => {
                                const date = formData.eventEndDate.split('T')[0] || formData.eventDate.split('T')[0] || new Date().toISOString().split('T')[0];
                                setFormData({ ...formData, eventEndDate: `${date}T${e.target.value}` });
                            }}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                        Konum (İsteğe Bağlı)
                    </label>
                    <input
                        type="text"
                        id="location"
                        className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border placeholder-gray-400"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Örnek: Konferans Salonu A"
                    />
                </div>

                <div className="flex items-center">
                    <input
                        id="isOpen"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={formData.isOpen}
                        onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
                    />
                    <label htmlFor="isOpen" className="ml-2 block text-sm text-gray-700">
                        Başvuruları hemen aç
                    </label>
                </div>

                <div className="flex items-center">
                    <input
                        id="allowGuestRegistration"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={formData.allowGuestRegistration}
                        onChange={(e) => setFormData({ ...formData, allowGuestRegistration: e.target.checked })}
                    />
                    <label htmlFor="allowGuestRegistration" className="ml-2 block text-sm text-gray-700">
                        Misafir Kayıtlara Açık <span className="text-gray-400">(Üniversite dışı katılımcılar)</span>
                    </label>
                </div>

                <div className="space-y-4 border-t border-gray-200 pt-4">
                    <div className="flex items-center">
                        <input
                            id="isPaid"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={formData.isPaid}
                            onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                        />
                        <label htmlFor="isPaid" className="ml-2 block text-sm text-gray-700">
                            Ücretli Etkinlik
                        </label>
                    </div>

                    {formData.isPaid && (
                        <>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                                    Ücret (TL)
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    required={formData.isPaid}
                                    min="0"
                                    step="0.01"
                                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="iban" className="block text-sm font-medium text-gray-700">
                                    IBAN
                                </label>
                                <input
                                    type="text"
                                    id="iban"
                                    required={formData.isPaid}
                                    placeholder="TR..."
                                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    value={formData.iban}
                                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end space-x-3">
                    <Button
                        type="button"
                        onClick={() => router.back()}
                        variant="secondary"
                    >
                        İptal
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        isLoading={loading}
                    >
                        Oluştur
                    </Button>
                </div>
            </form>
        </div>
    );
}
