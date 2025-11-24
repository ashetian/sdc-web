'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        posterUrl: '',
        isOpen: false,
    });

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
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Yeni Etkinlik Oluştur</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Etkinlik Başlığı
                    </label>
                    <input
                        type="text"
                        id="title"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        value={formData.title}
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div>
                    <label htmlFor="posterUrl" className="block text-sm font-medium text-gray-700">
                        Afiş URL (İsteğe Bağlı)
                    </label>
                    <input
                        type="url"
                        id="posterUrl"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        value={formData.posterUrl}
                        onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
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
                    <label htmlFor="isOpen" className="ml-2 block text-sm text-gray-900">
                        Başvuruları hemen aç
                    </label>
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
