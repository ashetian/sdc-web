'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GlobalLoading from '@/app/_components/GlobalLoading';

interface Event {
    _id: string;
    title: string;
    isOpen: boolean;
    isPaid: boolean;
    price?: number;
    createdAt: string;
    eventDate?: string;
    isEnded?: boolean;
    attendanceCode?: string;
    actualDuration?: number;
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    // QR Modal
    const [qrModal, setQrModal] = useState<{ eventId: string; eventTitle: string; qrUrl: string } | null>(null);
    const [generatingQR, setGeneratingQR] = useState(false);

    // End Event Modal
    const [endModal, setEndModal] = useState<{ eventId: string; eventTitle: string } | null>(null);
    const [duration, setDuration] = useState('');
    const [endingEvent, setEndingEvent] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/events?mode=admin');
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (error) {
            console.error('Etkinlikler yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/events/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isOpen: !currentStatus }),
            });
            if (res.ok) {
                fetchEvents();
            }
        } catch (error) {
            console.error('Durum güncellenirken hata:', error);
        }
    };

    const deleteEvent = async (id: string) => {
        if (!confirm('Bu etkinliği silmek istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`/api/events/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchEvents();
            }
        } catch (error) {
            console.error('Etkinlik silinirken hata:', error);
        }
    };

    const generateQR = async (eventId: string, eventTitle: string) => {
        setGeneratingQR(true);
        try {
            const res = await fetch(`/api/events/${eventId}/attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate' }),
            });

            if (res.ok) {
                const data = await res.json();
                const fullUrl = `${window.location.origin}${data.qrUrl}`;
                setQrModal({ eventId, eventTitle, qrUrl: fullUrl });
            } else {
                alert('QR oluşturulamadı.');
            }
        } catch (error) {
            console.error('QR generation error:', error);
            alert('Hata oluştu.');
        } finally {
            setGeneratingQR(false);
        }
    };

    const handleEndEvent = async () => {
        if (!endModal) return;
        const mins = parseInt(duration);
        if (isNaN(mins) || mins <= 0) {
            alert('Geçerli bir süre girin (dakika).');
            return;
        }

        setEndingEvent(true);
        try {
            const res = await fetch(`/api/events/${endModal.eventId}/end`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ actualDuration: mins }),
            });

            if (res.ok) {
                setEndModal(null);
                setDuration('');
                fetchEvents();
                alert('Etkinlik sonlandırıldı!');
            } else {
                const data = await res.json();
                alert(data.error || 'Sonlandırılamadı.');
            }
        } catch (error) {
            console.error('End event error:', error);
            alert('Hata oluştu.');
        } finally {
            setEndingEvent(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Kopyalandı!');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <GlobalLoading />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border-4 border-black shadow-neo p-6 flex justify-between items-center">
                <h1 className="text-2xl font-black text-black uppercase">Etkinlik Yönetimi</h1>
                <Link
                    href="/admin/events/create"
                    className="bg-neo-green text-black border-4 border-black shadow-neo px-6 py-3 font-black uppercase hover:bg-white hover:shadow-none transition-all"
                >
                    + Yeni Etkinlik
                </Link>
            </div>

            {/* Events List */}
            <div className="bg-white border-4 border-black shadow-neo overflow-hidden">
                {events.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 font-bold">Henüz etkinlik bulunmuyor.</p>
                    </div>
                ) : (
                    <table className="min-w-full">
                        <thead className="bg-black text-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider">
                                    Etkinlik Adı
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider">
                                    Durum
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider">
                                    Ücret
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider">
                                    Tarih
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-black uppercase tracking-wider">
                                    İşlemler
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-black">
                            {events.map((event) => (
                                <tr key={event._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-base font-black text-black">{event.title}</span>
                                        {event.isEnded && (
                                            <span className="ml-2 px-2 py-0.5 text-xs font-black bg-gray-500 text-white border border-black">
                                                BİTTİ
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-3 py-1 text-xs font-black border-2 border-black uppercase ${event.isEnded
                                                ? 'bg-gray-400 text-white'
                                                : event.isOpen
                                                    ? 'bg-neo-green text-black'
                                                    : 'bg-red-500 text-white'
                                                }`}
                                        >
                                            {event.isEnded ? 'Sona Erdi' : event.isOpen ? 'Açık' : 'Kapalı'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {event.isPaid ? (
                                            <span className="bg-neo-purple text-white px-3 py-1 text-xs font-black border-2 border-black">
                                                {event.price} TL
                                            </span>
                                        ) : (
                                            <span className="bg-gray-200 text-black px-3 py-1 text-xs font-black border-2 border-black">
                                                ÜCRETSİZ
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-600">
                                        {event.eventDate
                                            ? new Date(event.eventDate).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                            : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                        <Link
                                            href={`/admin/events/${event._id}/edit`}
                                            className="inline-block px-3 py-1 text-xs font-black bg-neo-yellow text-black border-2 border-black hover:bg-yellow-300 transition-all"
                                        >
                                            ✏️ Düzenle
                                        </Link>
                                        {!event.isEnded && (
                                            <>
                                                <button
                                                    onClick={() => generateQR(event._id, event.title)}
                                                    disabled={generatingQR}
                                                    className="px-3 py-1 text-xs font-black bg-neo-purple text-white border-2 border-black hover:bg-purple-400 transition-all"
                                                >
                                                    📱 QR
                                                </button>
                                                <button
                                                    onClick={() => toggleStatus(event._id, event.isOpen)}
                                                    className={`px-3 py-1 text-xs font-black border-2 border-black transition-all ${event.isOpen
                                                        ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                                                        : 'bg-neo-green text-black hover:bg-green-400'
                                                        }`}
                                                >
                                                    {event.isOpen ? 'Kapat' : 'Aç'}
                                                </button>
                                                <button
                                                    onClick={() => setEndModal({ eventId: event._id, eventTitle: event.title })}
                                                    className="px-3 py-1 text-xs font-black bg-orange-500 text-white border-2 border-black hover:bg-orange-600 transition-all"
                                                >
                                                    🏁 Sonlandır
                                                </button>
                                            </>
                                        )}
                                        <Link
                                            href={`/admin/events/${event._id}/registrations`}
                                            className="inline-block px-3 py-1 text-xs font-black bg-neo-blue text-black border-2 border-black hover:bg-blue-300 transition-all"
                                        >
                                            Katılımcılar
                                        </Link>
                                        <button
                                            onClick={() => deleteEvent(event._id)}
                                            className="px-3 py-1 text-xs font-black bg-red-500 text-white border-2 border-black hover:bg-red-600 transition-all"
                                        >
                                            Sil
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* QR Modal */}
            {qrModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={() => setQrModal(null)}>
                    <div className="bg-white border-4 border-black shadow-neo-lg max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-black uppercase mb-4 text-center">{qrModal.eventTitle}</h3>
                        <p className="text-center font-bold mb-4">Yoklama QR Kodu</p>

                        {/* QR Code Display - using external API */}
                        <div className="flex justify-center mb-4">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrModal.qrUrl)}`}
                                alt="QR Code"
                                className="border-4 border-black"
                            />
                        </div>

                        <div className="bg-gray-100 p-3 border-2 border-black mb-4">
                            <p className="text-xs font-bold text-gray-600 mb-1">Link:</p>
                            <p className="text-sm font-mono break-all select-all">{qrModal.qrUrl}</p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => copyToClipboard(qrModal.qrUrl)}
                                className="flex-1 py-2 bg-neo-blue border-2 border-black font-black text-sm hover:bg-blue-300 transition-all"
                            >
                                📋 Kopyala
                            </button>
                            <a
                                href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&data=${encodeURIComponent(qrModal.qrUrl)}`}
                                download={`yoklama-${qrModal.eventTitle}.png`}
                                className="flex-1 py-2 bg-neo-green border-2 border-black font-black text-sm hover:bg-green-300 transition-all text-center"
                            >
                                💾 İndir
                            </a>
                        </div>

                        <button
                            onClick={() => setQrModal(null)}
                            className="w-full mt-4 py-2 bg-gray-200 border-2 border-black font-black text-sm hover:bg-gray-300 transition-all"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            )}

            {/* End Event Modal */}
            {endModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={() => setEndModal(null)}>
                    <div className="bg-white border-4 border-black shadow-neo-lg max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-black uppercase mb-4 text-center">Etkinliği Sonlandır</h3>
                        <p className="text-center font-bold mb-2">{endModal.eventTitle}</p>
                        <p className="text-center text-sm text-gray-600 mb-6">
                            Bu işlem geri alınamaz. Etkinlik kayıtlara kapanacak ve yoklama kapatılacaktır.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-black uppercase mb-2">
                                Etkinlik Süresi (Dakika)
                            </label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="örn: 120"
                                min="1"
                                className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleEndEvent}
                                disabled={endingEvent}
                                className="flex-1 py-3 bg-orange-500 text-white border-2 border-black font-black uppercase hover:bg-orange-600 transition-all disabled:opacity-50"
                            >
                                {endingEvent ? 'İşleniyor...' : '🏁 Sonlandır'}
                            </button>
                            <button
                                onClick={() => setEndModal(null)}
                                className="flex-1 py-3 bg-gray-200 border-2 border-black font-black uppercase hover:bg-gray-300 transition-all"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
