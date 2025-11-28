'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [posterPreview, setPosterPreview] = useState<string | null>(null);
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

    const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        const file = e.target.files[0];
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        setUploading(true);
        try {
            const res = await fetch('/api/upload/cloudinary', {
                method: 'POST',
                body: uploadFormData,
            });

            if (!res.ok) throw new Error('Afiş yüklenemedi');

            const data = await res.json();
            setPosterPreview(data.path);
            setFormData({ ...formData, posterUrl: data.path });
        } catch (error) {
            console.error('Afiş yüklenirken hata:', error);
            alert('Afiş yüklenirken bir hata oluştu.');
        } finally {
            setUploading(false);
        }
    };

    const handleRemovePoster = () => {
        setPosterPreview(null);
        setFormData({ ...formData, posterUrl: '' });
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
                alert('Etkinlik oluşturulurken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Hata:', error);
            alert('Bir hata oluştu.');
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Etkinlik Afişi (İsteğe Bağlı)
                    </label>

                    <div className="space-y-4">
                        {/* File Upload */}
                        <div>
                            <label htmlFor="posterFile" className="block text-xs font-medium text-gray-600 mb-1">
                                Dosya Yükle
                            </label>
                            <input
                                type="file"
                                id="posterFile"
                                accept="image/*"
                                onChange={handlePosterUpload}
                                disabled={uploading}
                                className="block w-full text-sm text-gray-900 bg-white border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                            />
                            {uploading && <p className="text-xs text-blue-600 mt-1">Yükleniyor...</p>}
                        </div>

                        {/* URL Input */}
                        <div>
                            <label htmlFor="posterUrl" className="block text-xs font-medium text-gray-600 mb-1">
                                veya URL Girin
                            </label>
                            <input
                                type="url"
                                id="posterUrl"
                                className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border placeholder-gray-400"
                                value={formData.posterUrl}
                                onChange={(e) => {
                                    setFormData({ ...formData, posterUrl: e.target.value });
                                    if (e.target.value) setPosterPreview(e.target.value);
                                }}
                                placeholder="https://example.com/image.jpg"
                                disabled={uploading}
                            />
                        </div>

                        {/* Preview */}
                        {posterPreview && (
                            <div className="relative">
                                <img
                                    src={posterPreview}
                                    alt="Afiş önizlemesi"
                                    className="w-full max-w-sm rounded-md border-2 border-gray-300"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemovePoster}
                                    className="mt-2 inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Afişi Kaldır
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">
                        Etkinlik Tarihi ve Saati *
                    </label>
                    <input
                        type="datetime-local"
                        id="eventDate"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border placeholder-gray-400"
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    />
                </div>

                <div>
                    <label htmlFor="eventEndDate" className="block text-sm font-medium text-gray-700">
                        Bitiş Tarihi ve Saati (İsteğe Bağlı)
                    </label>
                    <input
                        type="datetime-local"
                        id="eventEndDate"
                        className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border placeholder-gray-400"
                        value={formData.eventEndDate}
                        onChange={(e) => setFormData({ ...formData, eventEndDate: e.target.value })}
                    />
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
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        İptal
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? 'Oluşturuluyor...' : 'Oluştur'}
                    </button>
                </div>
            </form>
        </div>
    );
}
