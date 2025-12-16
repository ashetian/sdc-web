'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import * as XLSX from 'xlsx';
import { SkeletonList } from '@/app/_components/Skeleton';
import Link from 'next/link';
import { ChevronLeft, Check, Download, Mail, UserX, UserCheck } from 'lucide-react';
import { useToast } from '@/app/_context/ToastContext';
import { Button } from '@/app/_components/ui';

interface Member {
    _id: string;
    fullName: string;
    studentNo: string;
    email: string;
    phone?: string;
    department?: string;
    nickname?: string;
}

interface Registration {
    _id: string;
    memberId: Member;
    attendedAt?: string;
    rating?: number;
    feedback?: string;
    paymentProofUrl?: string;
    paymentStatus?: 'pending' | 'verified' | 'rejected' | 'refunded';
    createdAt: string;
    studentNumber?: string;
    name?: string;
    phone?: string;
    department?: string;
    email?: string;
}

interface GuestRegistration {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    status: 'pending' | 'approved' | 'rejected';
    attendedAt?: string;
    attendanceEmailSentAt?: string;
    rating?: number;
    feedback?: string;
    paymentProofUrl?: string;
    paymentStatus?: 'pending' | 'verified' | 'rejected' | 'refunded';
    createdAt: string;
}

interface Event {
    _id: string;
    title: string;
    isPaid: boolean;
    allowGuestRegistration: boolean;
    price?: number;
    isEnded?: boolean;
    actualDuration?: number;
}

interface AttendanceStats {
    totalRegistered: number;
    totalAttended: number;
    averageRating: number;
}

export default function EventRegistrationsPage() {
    const params = useParams();
    const { showToast } = useToast();
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [guestRegistrations, setGuestRegistrations] = useState<GuestRegistration[]>([]);
    const [event, setEvent] = useState<Event | null>(null);
    const [stats, setStats] = useState<AttendanceStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'members' | 'guests'>('members');
    const [processingGuest, setProcessingGuest] = useState<string | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchData(params.id as string);
        }
    }, [params.id]);

    const fetchData = async (eventId: string) => {
        try {
            const [eventRes, attendanceRes, guestRes] = await Promise.all([
                fetch(`/api/events/${eventId}`),
                fetch(`/api/events/${eventId}/attendance`),
                fetch(`/api/events/${eventId}/guest-registrations`)
            ]);

            if (eventRes.ok) {
                setEvent(await eventRes.json());
            }

            if (attendanceRes.ok) {
                const data = await attendanceRes.json();
                setRegistrations(data.registrations || []);
                setStats(data.stats || null);
            }

            if (guestRes.ok) {
                setGuestRegistrations(await guestRes.json());
            }
        } catch (error) {
            console.error('Veriler yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGuestApproval = async (guestId: string, action: 'approve' | 'reject') => {
        setProcessingGuest(guestId);
        try {
            const res = await fetch(`/api/events/${params.id}/guest-registrations/${guestId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });

            if (res.ok) {
                showToast(action === 'approve' ? 'Kayıt onaylandı' : 'Kayıt reddedildi', 'success');
                fetchData(params.id as string);
            } else {
                const data = await res.json();
                showToast(data.error || 'İşlem başarısız', 'error');
            }
        } catch (error) {
            showToast('Bir hata oluştu', 'error');
        } finally {
            setProcessingGuest(null);
        }
    };

    const handleSendAttendanceEmail = async (guestId: string) => {
        setProcessingGuest(guestId);
        try {
            const res = await fetch(`/api/events/${params.id}/guest-registrations/${guestId}/send-attendance`, {
                method: 'POST',
            });

            if (res.ok) {
                showToast('Yoklama maili gönderildi', 'success');
                fetchData(params.id as string);
            } else {
                const data = await res.json();
                showToast(data.error || 'Mail gönderilemedi', 'error');
            }
        } catch (error) {
            showToast('Bir hata oluştu', 'error');
        } finally {
            setProcessingGuest(null);
        }
    };

    const exportToExcel = () => {
        if (registrations.length === 0 && guestRegistrations.length === 0) {
            alert('Dışa aktarılacak kayıt bulunmamaktadır.');
            return;
        }

        const memberData = registrations.map((reg) => {
            const member = reg.memberId;
            return {
                'Tip': 'Öğrenci',
                'Öğrenci No': member?.studentNo || reg.studentNumber || '-',
                'Ad Soyad': member?.fullName || reg.name || '-',
                'E-posta': member?.email || reg.email || '-',
                'Telefon': member?.phone || reg.phone || '-',
                'Kayıt Tarihi': new Date(reg.createdAt).toLocaleString('tr-TR'),
                'Yoklamada': reg.attendedAt ? 'Evet' : 'Hayır',
                'Puan': reg.rating || '-',
            };
        });

        const guestData = guestRegistrations.filter(g => g.status === 'approved').map((reg) => ({
            'Tip': 'Misafir',
            'Öğrenci No': '-',
            'Ad Soyad': reg.fullName,
            'E-posta': reg.email,
            'Telefon': reg.phone || '-',
            'Kayıt Tarihi': new Date(reg.createdAt).toLocaleString('tr-TR'),
            'Yoklamada': reg.attendedAt ? 'Evet' : 'Hayır',
            'Puan': reg.rating || '-',
        }));

        const excelData = [...memberData, ...guestData];

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Katılımcılar');

        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `${event?.title || 'etkinlik'}-katilimcilar-${timestamp}.xlsx`;

        XLSX.writeFile(workbook, filename);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <SkeletonList items={5} />
            </div>
        );
    }

    const pendingGuests = guestRegistrations.filter(g => g.status === 'pending');
    const approvedGuests = guestRegistrations.filter(g => g.status === 'approved');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border-4 border-black shadow-neo p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <Link href="/admin/events" className="text-sm font-bold text-gray-500 hover:text-black mb-2 inline-block">
                            <ChevronLeft size={14} className="inline" /> Etkinliklere Dön
                        </Link>
                        <h1 className="text-2xl font-black text-black uppercase">
                            {event?.title || 'Etkinlik'} - Katılımcılar
                        </h1>
                    </div>
                    <button
                        onClick={exportToExcel}
                        className="px-6 py-3 bg-neo-green text-black border-4 border-black shadow-neo font-black uppercase hover:shadow-none transition-all"
                        disabled={registrations.length === 0 && guestRegistrations.length === 0}
                    >
                        <Download size={16} className="inline" /> Excel İndir
                    </button>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-neo-blue border-2 border-black p-4 text-center">
                            <div className="text-3xl font-black">{stats.totalRegistered + approvedGuests.length}</div>
                            <div className="text-sm font-bold uppercase">Kayıtlı</div>
                        </div>
                        <div className="bg-neo-green border-2 border-black p-4 text-center">
                            <div className="text-3xl font-black">
                                {stats.totalAttended + approvedGuests.filter(g => g.attendedAt).length}
                            </div>
                            <div className="text-sm font-bold uppercase">Yoklamada</div>
                        </div>
                        <div className="bg-neo-yellow border-2 border-black p-4 text-center">
                            <div className="text-3xl font-black">
                                {stats.averageRating > 0 ? `${stats.averageRating} ★` : '-'}
                            </div>
                            <div className="text-sm font-bold uppercase">Ort. Puan</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            {event?.allowGuestRegistration && (
                <div className="flex border-4 border-black bg-white">
                    <button
                        onClick={() => setActiveTab('members')}
                        className={`flex-1 px-6 py-3 font-black uppercase transition-all ${activeTab === 'members'
                                ? 'bg-black text-white'
                                : 'bg-white text-black hover:bg-gray-100'
                            }`}
                    >
                        Öğrenciler ({registrations.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('guests')}
                        className={`flex-1 px-6 py-3 font-black uppercase transition-all border-l-4 border-black ${activeTab === 'guests'
                                ? 'bg-black text-white'
                                : 'bg-white text-black hover:bg-gray-100'
                            }`}
                    >
                        Misafirler ({guestRegistrations.length})
                        {pendingGuests.length > 0 && (
                            <span className="ml-2 px-2 py-1 bg-neo-yellow text-black text-xs border border-black">
                                {pendingGuests.length} bekliyor
                            </span>
                        )}
                    </button>
                </div>
            )}

            {/* Members Table */}
            {activeTab === 'members' && (
                <div className="bg-white border-4 border-black shadow-neo overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-black text-white">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-black uppercase">Öğrenci No</th>
                                <th className="px-4 py-3 text-left text-xs font-black uppercase">Ad Soyad</th>
                                <th className="px-4 py-3 text-left text-xs font-black uppercase">Bölüm</th>
                                <th className="px-4 py-3 text-left text-xs font-black uppercase">E-posta</th>
                                <th className="px-4 py-3 text-center text-xs font-black uppercase">Kaydoldu</th>
                                <th className="px-4 py-3 text-center text-xs font-black uppercase">Yoklamada</th>
                                <th className="px-4 py-3 text-center text-xs font-black uppercase">Puan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-black">
                            {registrations.map((reg) => {
                                const member = reg.memberId;
                                return (
                                    <tr key={reg._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-bold">
                                            {member?.studentNo || reg.studentNumber || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold">
                                            {member?.fullName || reg.name || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {member?.department || reg.department || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {member?.email || reg.email || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-1 text-xs font-black bg-neo-green border border-black inline-flex items-center justify-center">
                                                <Check size={12} />
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {reg.attendedAt ? (
                                                <span className="px-2 py-1 text-xs font-black bg-neo-blue border border-black inline-flex items-center justify-center">
                                                    <Check size={12} />
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-black bg-gray-200 border border-black text-gray-500 inline-flex items-center justify-center">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {reg.rating ? (
                                                <span className="font-bold text-yellow-600">{reg.rating} ★</span>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                            {registrations.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500 font-bold">
                                        Henüz öğrenci kaydı bulunmamaktadır.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Guests Table */}
            {activeTab === 'guests' && (
                <div className="bg-white border-4 border-black shadow-neo overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-black text-white">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-black uppercase">Ad Soyad</th>
                                <th className="px-4 py-3 text-left text-xs font-black uppercase">E-posta</th>
                                <th className="px-4 py-3 text-left text-xs font-black uppercase">Telefon</th>
                                <th className="px-4 py-3 text-center text-xs font-black uppercase">Durum</th>
                                <th className="px-4 py-3 text-center text-xs font-black uppercase">Yoklamada</th>
                                <th className="px-4 py-3 text-center text-xs font-black uppercase">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-black">
                            {guestRegistrations.map((guest) => (
                                <tr key={guest._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-bold">
                                        {guest.fullName}
                                        <span className="ml-2 px-2 py-0.5 text-xs font-black bg-purple-200 text-purple-800 border border-purple-400">
                                            Öğrenci Değil
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{guest.email}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{guest.phone || '-'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 text-xs font-black border border-black ${guest.status === 'approved' ? 'bg-green-200 text-green-800' :
                                                guest.status === 'rejected' ? 'bg-red-200 text-red-800' :
                                                    'bg-yellow-200 text-yellow-800'
                                            }`}>
                                            {guest.status === 'approved' ? 'Onaylı' :
                                                guest.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {guest.attendedAt ? (
                                            <span className="px-2 py-1 text-xs font-black bg-neo-blue border border-black inline-flex items-center justify-center">
                                                <Check size={12} />
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-black bg-gray-200 border border-black text-gray-500 inline-flex items-center justify-center">
                                                -
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {guest.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="success"
                                                        onClick={() => handleGuestApproval(guest._id, 'approve')}
                                                        isLoading={processingGuest === guest._id}
                                                    >
                                                        <UserCheck size={14} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => handleGuestApproval(guest._id, 'reject')}
                                                        isLoading={processingGuest === guest._id}
                                                    >
                                                        <UserX size={14} />
                                                    </Button>
                                                </>
                                            )}
                                            {guest.status === 'approved' && !guest.attendedAt && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSendAttendanceEmail(guest._id)}
                                                    isLoading={processingGuest === guest._id}
                                                    title={guest.attendanceEmailSentAt ? 'Tekrar gönder' : 'Yoklama maili gönder'}
                                                >
                                                    <Mail size={14} />
                                                    {guest.attendanceEmailSentAt && <span className="ml-1 text-xs">✓</span>}
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {guestRegistrations.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 font-bold">
                                        Henüz misafir kaydı bulunmamaktadır.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Feedback Section */}
            {registrations.some(r => r.feedback) && (
                <div className="bg-white border-4 border-black shadow-neo p-6">
                    <h2 className="text-xl font-black uppercase mb-4">Katılımcı Yorumları</h2>
                    <div className="space-y-3">
                        {registrations.filter(r => r.feedback).map((reg) => (
                            <div key={reg._id} className="bg-gray-50 border-2 border-black p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-bold">{reg.memberId?.fullName || reg.name}</span>
                                    {reg.rating && (
                                        <span className="text-yellow-600 font-bold">{reg.rating} ★</span>
                                    )}
                                </div>
                                <p className="text-gray-700">{reg.feedback}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
