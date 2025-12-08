'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import * as XLSX from 'xlsx';
import { SkeletonTable, SkeletonPageHeader, SkeletonList } from '@/app/_components/Skeleton';
import Link from 'next/link';
import { ChevronLeft, Check, Download } from 'lucide-react';

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
    // Legacy fields (for old registrations)
    studentNumber?: string;
    name?: string;
    phone?: string;
    department?: string;
    email?: string;
}

interface Event {
    _id: string;
    title: string;
    isPaid: boolean;
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
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [event, setEvent] = useState<Event | null>(null);
    const [stats, setStats] = useState<AttendanceStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchData(params.id as string);
        }
    }, [params.id]);

    const fetchData = async (eventId: string) => {
        try {
            const [eventRes, attendanceRes] = await Promise.all([
                fetch(`/api/events/${eventId}`),
                fetch(`/api/events/${eventId}/attendance`)
            ]);

            if (eventRes.ok) {
                setEvent(await eventRes.json());
            }

            if (attendanceRes.ok) {
                const data = await attendanceRes.json();
                setRegistrations(data.registrations || []);
                setStats(data.stats || null);
            }
        } catch (error) {
            console.error('Veriler yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        if (registrations.length === 0) {
            alert('Dışa aktarılacak kayıt bulunmamaktadır.');
            return;
        }

        const excelData = registrations.map((reg) => {
            const member = reg.memberId;
            return {
                'Öğrenci No': member?.studentNo || reg.studentNumber || '-',
                'Ad Soyad': member?.fullName || reg.name || '-',
                'Takma Ad': member?.nickname || '-',
                'Bölüm': member?.department || reg.department || '-',
                'E-posta': member?.email || reg.email || '-',
                'Telefon': member?.phone || reg.phone || '-',
                'Kayıt Tarihi': new Date(reg.createdAt).toLocaleString('tr-TR'),
                'Kaydoldu': 'Evet',
                'Yoklamada': reg.attendedAt ? 'Evet' : 'Hayır',
                'Yoklama Tarihi': reg.attendedAt ? new Date(reg.attendedAt).toLocaleString('tr-TR') : '-',
                'Puan': reg.rating || '-',
                'Yorum': reg.feedback || '-',
                ...(event?.isPaid ? {
                    'Ödeme Durumu': reg.paymentStatus === 'verified' ? 'Onaylandı' :
                        reg.paymentStatus === 'rejected' ? 'Reddedildi' :
                            reg.paymentStatus === 'refunded' ? 'İade' : 'Bekliyor',
                } : {}),
            };
        });

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
                        disabled={registrations.length === 0}
                    >
                        <Download size={16} className="inline" /> Excel İndir
                    </button>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-neo-blue border-2 border-black p-4 text-center">
                            <div className="text-3xl font-black">{stats.totalRegistered}</div>
                            <div className="text-sm font-bold uppercase">Kayıtlı</div>
                        </div>
                        <div className="bg-neo-green border-2 border-black p-4 text-center">
                            <div className="text-3xl font-black">{stats.totalAttended}</div>
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

                {event?.isEnded && event.actualDuration && (
                    <div className="mt-4 bg-gray-100 border-2 border-black p-3 text-center">
                        <span className="font-bold">Etkinlik Süresi: </span>
                        <span className="font-black">{event.actualDuration} dakika</span>
                    </div>
                )}
            </div>

            {/* Table */}
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
                            {event?.isPaid && (
                                <th className="px-4 py-3 text-center text-xs font-black uppercase">Ödeme</th>
                            )}
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
                                        {member?.nickname && (
                                            <span className="text-gray-500 text-xs ml-1">({member.nickname})</span>
                                        )}
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
                                    {event?.isPaid && (
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 text-xs font-black border border-black inline-flex items-center justify-center
                                                ${reg.paymentStatus === 'verified' ? 'bg-green-200 text-green-800' :
                                                    reg.paymentStatus === 'rejected' ? 'bg-red-200 text-red-800' :
                                                        'bg-yellow-200 text-yellow-800'}`}>
                                                {reg.paymentStatus === 'verified' ? 'Onaylı' :
                                                    reg.paymentStatus === 'rejected' ? 'Red' : 'Bekliyor'}
                                            </span>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}

                        {registrations.length === 0 && (
                            <tr>
                                <td colSpan={event?.isPaid ? 8 : 7} className="px-6 py-8 text-center text-gray-500 font-bold">
                                    Henüz katılımcı bulunmamaktadır.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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
