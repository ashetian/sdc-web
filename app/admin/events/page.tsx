'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SkeletonTable, SkeletonPageHeader } from '@/app/_components/Skeleton';
import { useToast } from '@/app/_context/ToastContext';
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
    FileText,
    Plus,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/app/_components/ui';
import QRCode from 'react-qr-code';

interface SurveyQuestion {
    id: string;
    question: string;
    options: string[];
    required: boolean;
}

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
    surveyQuestions?: SurveyQuestion[];
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Manage Modal
    const [manageModal, setManageModal] = useState<Event | null>(null);

    // QR Modal
    const [qrModal, setQrModal] = useState<{ eventId: string; eventTitle: string; qrUrl: string } | null>(null);
    const [generatingQR, setGeneratingQR] = useState(false);

    // Survey Modal
    const [surveyModal, setSurveyModal] = useState<{ eventId: string; eventTitle: string } | null>(null);
    const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);
    const [savingSurvey, setSavingSurvey] = useState(false);

    // End Event Modal
    const [endModal, setEndModal] = useState<{ eventId: string; eventTitle: string } | null>(null);
    const [duration, setDuration] = useState('');
    const [endingEvent, setEndingEvent] = useState(false);

    useEffect(() => {
        fetchEvents();
        // Clear registration notifications
        fetch('/api/notifications/admin/clear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'admin_new_registration' }),
        }).catch(err => console.error('Failed to clear notifications:', err));
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
                showToast('QR olusturulamadı.', 'error');
            }
        } catch (error) {
            console.error('QR generation error:', error);
            showToast('Hata olustu.', 'error');
        } finally {
            setGeneratingQR(false);
        }
    };

    // Survey Functions
    const openSurveyModal = async (eventId: string, eventTitle: string) => {
        setSurveyModal({ eventId, eventTitle });
        try {
            const res = await fetch(`/api/events/${eventId}/survey`);
            if (res.ok) {
                const data = await res.json();
                setSurveyQuestions(data.surveyQuestions || []);
            }
        } catch (error) {
            console.error('Load survey error:', error);
        }
    };

    const saveSurveyAndGenerateQR = async () => {
        if (!surveyModal) return;
        setSavingSurvey(true);
        try {
            // Save survey questions
            const saveRes = await fetch(`/api/events/${surveyModal.eventId}/survey`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ surveyQuestions }),
            });

            if (!saveRes.ok) {
                showToast('Anket kaydedilemedi.', 'error');
                return;
            }

            // Close survey modal and generate QR
            setSurveyModal(null);
            generateQR(surveyModal.eventId, surveyModal.eventTitle);
        } catch (error) {
            console.error('Save survey error:', error);
            showToast('Hata olustu.', 'error');
        } finally {
            setSavingSurvey(false);
        }
    };

    const skipSurveyAndGenerateQR = () => {
        if (!surveyModal) return;
        setSurveyModal(null);
        generateQR(surveyModal.eventId, surveyModal.eventTitle);
    };

    const addQuestion = () => {
        setSurveyQuestions([...surveyQuestions, {
            id: crypto.randomUUID(),
            question: '',
            options: ['', ''],
            required: false,
        }]);
    };

    const removeQuestion = (id: string) => {
        setSurveyQuestions(surveyQuestions.filter(q => q.id !== id));
    };

    const updateQuestion = (id: string, field: keyof SurveyQuestion, value: string | boolean | string[]) => {
        setSurveyQuestions(surveyQuestions.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        ));
    };

    const addOption = (questionId: string) => {
        setSurveyQuestions(surveyQuestions.map(q =>
            q.id === questionId ? { ...q, options: [...q.options, ''] } : q
        ));
    };

    const removeOption = (questionId: string, index: number) => {
        setSurveyQuestions(surveyQuestions.map(q =>
            q.id === questionId ? { ...q, options: q.options.filter((_, i) => i !== index) } : q
        ));
    };

    const updateOption = (questionId: string, index: number, value: string) => {
        setSurveyQuestions(surveyQuestions.map(q =>
            q.id === questionId ? {
                ...q,
                options: q.options.map((opt, i) => i === index ? value : opt)
            } : q
        ));
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
                showToast('Etkinlik sonlandırıldı ve duyuru oluşturuldu!', 'success');
            } else if (data.needsReport) {
                setEndModal(null);
                showToast('Önce sonuç raporu eklemelisiniz.', 'warning');
                // Redirect to report page
                window.location.href = `/admin/events/${endModal.eventId}/report`;
            } else {
                showToast(data.error || 'Sonlandırılamadı.', 'error');
            }
        } catch (error) {
            console.error('End event error:', error);
            showToast('Hata oluştu.', 'error');
        } finally {
            setEndingEvent(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('Kopyalandı!', 'success');
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <SkeletonPageHeader />
                <SkeletonTable rows={6} cols={5} />
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
                                        <Button
                                            onClick={() => setManageModal(event)}
                                            size="sm"
                                        >
                                            <Settings size={16} /> Yönet
                                        </Button>
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
                                            openSurveyModal(manageModal._id, manageModal.title);
                                        }}
                                        disabled={generatingQR}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-black bg-neo-purple text-white border-4 border-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-neo transition-all uppercase"
                                    >
                                        <QrCode size={16} /> QR Olustur
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

                        {/* QR Code Display - using react-qr-code */}
                        <div className="flex justify-center mb-4 p-4 bg-white border-4 border-black">
                            <QRCode value={qrModal.qrUrl} size={200} />
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
                                <Download size={14} className="inline" /> Indir
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

            {/* Survey Modal */}
            {surveyModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={() => setSurveyModal(null)}>
                    <div className="bg-white border-4 border-black shadow-neo-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-black uppercase">{surveyModal.eventTitle}</h3>
                                <p className="text-sm text-gray-600 font-bold">Yoklama Anketi</p>
                            </div>
                            <button onClick={() => setSurveyModal(null)} className="text-2xl font-black hover:scale-110 transition-transform">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="bg-gray-100 border-2 border-black p-3 mb-4">
                            <p className="text-sm font-bold">
                                Katılımcılara check-in sırasında sorulacak anket sorularını olusturun.
                                Anket eklemek istemiyorsanız "Atla" butonuna tıklayın.
                            </p>
                        </div>

                        {/* Questions List */}
                        <div className="space-y-4 mb-4">
                            {surveyQuestions.map((question, qIndex) => (
                                <div key={question.id} className="border-2 border-black p-4 bg-gray-50">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="font-black text-sm bg-black text-white px-2 py-1">
                                            Soru {qIndex + 1}
                                        </span>
                                        <button
                                            onClick={() => removeQuestion(question.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <input
                                        type="text"
                                        value={question.question}
                                        onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                                        placeholder="Soru metnini girin..."
                                        className="w-full p-2 border-2 border-black mb-3 font-bold"
                                    />

                                    <div className="flex items-center gap-2 mb-3">
                                        <input
                                            type="checkbox"
                                            id={`required-${question.id}`}
                                            checked={question.required}
                                            onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor={`required-${question.id}`} className="text-sm font-bold">
                                            Zorunlu
                                        </label>
                                    </div>

                                    <p className="text-xs font-bold text-gray-600 mb-2">Secenekler:</p>
                                    <div className="space-y-2">
                                        {question.options.map((option, oIndex) => (
                                            <div key={oIndex} className="flex gap-2">
                                                <span className="w-6 h-8 flex items-center justify-center font-black text-sm">
                                                    {String.fromCharCode(65 + oIndex)}.
                                                </span>
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => updateOption(question.id, oIndex, e.target.value)}
                                                    placeholder={`Secenek ${String.fromCharCode(65 + oIndex)}`}
                                                    className="flex-1 p-2 border-2 border-black text-sm"
                                                />
                                                {question.options.length > 2 && (
                                                    <button
                                                        onClick={() => removeOption(question.id, oIndex)}
                                                        className="px-2 text-red-500 hover:text-red-700"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => addOption(question.id)}
                                        className="mt-2 text-sm font-bold text-neo-purple hover:underline flex items-center gap-1"
                                    >
                                        <Plus size={14} /> Secenek Ekle
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add Question Button */}
                        <button
                            onClick={addQuestion}
                            className="w-full py-3 border-2 border-dashed border-black font-black text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2 mb-4"
                        >
                            <Plus size={18} /> Yeni Soru Ekle
                        </button>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={skipSurveyAndGenerateQR}
                                className="flex-1 py-3 bg-gray-200 border-2 border-black font-black uppercase hover:bg-gray-300 transition-all flex items-center justify-center gap-2 shadow-neo active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                            >
                                <ChevronRight size={16} /> Atla
                            </button>
                            <button
                                onClick={saveSurveyAndGenerateQR}
                                disabled={savingSurvey}
                                className="flex-1 py-3 bg-neo-green border-2 border-black font-black uppercase hover:bg-green-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-neo active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                            >
                                {savingSurvey ? 'Kaydediliyor...' : <><Save size={16} /> Kaydet ve QR Olustur</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
