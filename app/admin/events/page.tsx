'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GlobalLoading from '@/app/_components/GlobalLoading';
import {
    Settings,
    X,
    Pencil,
    QrCode,
    Lock,
    Unlock,
    Flag,
    Users,
    Trash2,
    ClipboardCopy,
    Download,
    Save,
    FileText
} from 'lucide-react';

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

    // Manage Modal
    const [manageModal, setManageModal] = useState<Event | null>(null);

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

        setEndingEvent(true);
        try {
            const res = await fetch(`/api/events/${endModal.eventId}/end`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });

            const data = await res.json();

            if (res.ok) {
                setEndModal(null);
                setDuration('');
                fetchEvents();
                alert('Etkinlik sonlandırıldı ve duyuru oluşturuldu!');
            } else if (data.needsReport) {
                setEndModal(null);
                alert('Önce sonuç raporu eklemelisiniz.');
                // Redirect to report page
                window.location.href = `/admin/events/${endModal.eventId}/report`;
            } else {
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
            <div className="bg-white border-4 border-black shadow-neo overflow-x-auto">
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
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setManageModal(event)}
                                            className="inline-flex items-center px-4 py-2 text-sm font-black bg-white text-black border-4 border-black shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase"
                                        >
                                            <Settings size={16} /> Yönet
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Manage Modal */}
            {manageModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={() => setManageModal(null)}>
                    <div className="bg-white border-4 border-black shadow-neo-lg max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-black uppercase text-left leading-tight">
                                {manageModal.title}
                            </h3>
                            <button onClick={() => setManageModal(null)} className="text-2xl font-black hover:scale-110 transition-transform">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link
                                href={`/admin/events/${manageModal._id}/edit`}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-black bg-neo-yellow text-black border-4 border-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-neo transition-all uppercase"
                            >
                                <Pencil size={16} /> Düzenle
                            </Link>

                            {!manageModal.isEnded && (
                                <>
                                    <button
                                        onClick={() => {
                                            setManageModal(null);
                                            generateQR(manageModal._id, manageModal.title);
                                        }}
                                        disabled={generatingQR}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-black bg-neo-purple text-white border-4 border-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-neo transition-all uppercase"
                                    >
                                        <QrCode size={16} /> QR Oluştur
                                    </button>

                                    <button
                                        onClick={() => {
                                            // No need to close modal, just toggle and update local state if needed or fetch
                                            toggleStatus(manageModal._id, manageModal.isOpen);
                                            setManageModal(prev => prev ? { ...prev, isOpen: !prev.isOpen } : null);
                                        }}
                                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-black border-4 border-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-neo transition-all uppercase ${manageModal.isOpen
                                            ? 'bg-orange-400 text-black'
                                            : 'bg-neo-green text-black'
                                            }`}
                                    >
                                        {manageModal.isOpen ? <><Lock size={16} /> Başvuruları Kapat</> : <><Unlock size={16} /> Başvuruları Aç</>}
                                    </button>

                                    <button
                                        onClick={() => {
                                            setManageModal(null);
                                            setEndModal({ eventId: manageModal._id, eventTitle: manageModal.title });
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-black bg-gray-800 text-white border-4 border-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-neo transition-all uppercase"
                                    >
                                        <Flag size={16} /> Etkinliği Sonlandır
                                    </button>
                                </>
                            )}

                            {/* Report Button - Always visible */}
                            <Link
                                href={`/admin/events/${manageModal._id}/report`}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-black bg-neo-pink text-black border-4 border-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-neo transition-all uppercase"
                            >
                                <FileText size={16} /> {manageModal.isEnded ? 'Raporu Görüntüle' : 'Sonuç Raporu'}
                            </Link>

                            <Link
                                href={`/admin/events/${manageModal._id}/registrations`}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-black bg-neo-blue text-black border-4 border-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-neo transition-all uppercase"
                            >
                                <Users size={16} /> Katılımcılar
                            </Link>

                            <hr className="border-2 border-black my-2" />

                            <button
                                onClick={() => {
                                    setManageModal(null);
                                    deleteEvent(manageModal._id);
                                }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-black bg-red-500 text-white border-4 border-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-neo transition-all uppercase"
                            >
                                <Trash2 size={16} /> Etkinliği Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Modal */}
            {qrModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={() => setQrModal(null)}>
                    <div className="bg-white border-4 border-black shadow-neo-lg max-w-md w-full p-6 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
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
                                className="flex-1 py-2 bg-neo-blue border-2 border-black font-black text-sm hover:bg-blue-300 transition-all shadow-neo active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                            >
                                <ClipboardCopy size={14} className="inline" /> Kopyala
                            </button>
                            <a
                                href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&data=${encodeURIComponent(qrModal.qrUrl)}`}
                                download={`yoklama-${qrModal.eventTitle}.png`}
                                className="flex-1 py-2 bg-neo-green border-2 border-black font-black text-sm hover:bg-green-300 transition-all text-center shadow-neo active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                            >
                                <Download size={14} className="inline" /> İndir
                            </a>
                        </div>

                        <button
                            onClick={() => setQrModal(null)}
                            className="w-full mt-4 py-2 bg-gray-200 border-2 border-black font-black text-sm hover:bg-gray-300 transition-all shadow-neo active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            )}

            {/* End Event Modal */}
            {endModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={() => setEndModal(null)}>
                    <div className="bg-white border-4 border-black shadow-neo-lg max-w-md w-full p-6 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-black uppercase mb-4 text-center">Etkinliği Sonlandır</h3>
                        <p className="text-center font-bold mb-2">{endModal.eventTitle}</p>
                        <p className="text-center text-sm text-gray-600 mb-6">
                            Bu işlem geri alınamaz. Etkinlik sonlandırılacak ve otomatik olarak duyuru oluşturulacaktır.
                        </p>

                        <div className="bg-neo-yellow/30 border-2 border-black p-4 mb-6">
                            <p className="text-sm font-bold text-center">
                                ⚠️ Sonlandırmadan önce "Sonuç Raporu" sayfasından rapor eklemelisiniz.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleEndEvent}
                                disabled={endingEvent}
                                className="flex-1 py-3 bg-orange-500 text-white border-2 border-black font-black uppercase hover:bg-orange-600 transition-all disabled:opacity-50 shadow-neo active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                            >
                                {endingEvent ? 'İşleniyor...' : <><Flag size={14} className="inline" /> Sonlandır</>}
                            </button>
                            <button
                                onClick={() => setEndModal(null)}
                                className="flex-1 py-3 bg-gray-200 border-2 border-black font-black uppercase hover:bg-gray-300 transition-all shadow-neo active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
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
