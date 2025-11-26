'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import * as XLSX from 'xlsx';

interface Registration {
    _id: string;
    studentNumber: string;
    name: string;
    phone: string;
    department: string;
    email: string;
    paymentProofUrl?: string;
    paymentStatus?: 'pending' | 'verified' | 'rejected' | 'refunded';
    createdAt: string;
}

interface Event {
    _id: string;
    title: string;
    isPaid: boolean;
    price: number;
}

export default function EventRegistrationsPage() {
    const params = useParams();
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchEventAndRegistrations(params.id as string);
        }
    }, [params.id]);

    const fetchEventAndRegistrations = async (eventId: string) => {
        try {
            const [eventRes, registrationsRes] = await Promise.all([
                fetch(`/api/events/${eventId}`),
                fetch(`/api/events/${eventId}/registrations`)
            ]);

            if (eventRes.ok) {
                const eventData = await eventRes.json();
                setEvent(eventData);
            }

            if (registrationsRes.ok) {
                const registrationsData = await registrationsRes.json();
                setRegistrations(registrationsData);
            }
        } catch (error) {
            console.error('Veriler yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const updatePaymentStatus = async (registrationId: string, status: string) => {
        if (!confirm(`Ödeme durumunu "${status}" olarak güncellemek istediğinize emin misiniz?`)) return;

        try {
            const res = await fetch(`/api/registrations/${registrationId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ paymentStatus: status }),
            });

            if (res.ok) {
                // Listeyi güncelle
                if (params.id) {
                    fetchEventAndRegistrations(params.id as string);
                }
            } else {
                alert('Durum güncellenirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Hata:', error);
            alert('Bir hata oluştu.');
        }
    };

    const exportToExcel = () => {
        if (registrations.length === 0) {
            alert('Dışa aktarılacak kayıt bulunmamaktadır.');
            return;
        }

        // Prepare data for Excel
        const excelData = registrations.map((reg) => {
            const data: any = {
                'Öğrenci No': reg.studentNumber,
                'Ad Soyad': reg.name,
                'Bölüm': reg.department,
                'E-posta': reg.email,
                'Telefon': reg.phone,
                'Başvuru Tarihi': `${new Date(reg.createdAt).toLocaleDateString('tr-TR')} ${new Date(reg.createdAt).toLocaleTimeString('tr-TR')}`,
            };

            if (event?.isPaid) {
                data['Ödeme Durumu'] = reg.paymentStatus || '-';
                data['Dekont URL'] = reg.paymentProofUrl || '-';
            }

            return data;
        });

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Başvurular');

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `etkinlik-basvurular-${params.id}-${timestamp}.xlsx`;

        // Download file
        XLSX.writeFile(workbook, filename);
    };

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    {event ? `${event.title} - Başvuru Listesi` : 'Başvuru Listesi'}
                </h1>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">
                        Toplam Başvuru: {registrations.length}
                    </div>
                    <button
                        onClick={exportToExcel}
                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={registrations.length === 0}
                    >
                        Excel&apos;e Aktar
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Öğrenci No
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ad Soyad
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Bölüm
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                E-posta
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Telefon
                            </th>
                            {event?.isPaid && (
                                <>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ödeme Durumu
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dekont
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        İşlemler
                                    </th>
                                </>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Başvuru Tarihi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {registrations.map((reg) => (
                            <tr key={reg._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {reg.studentNumber}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {reg.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {reg.department}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {reg.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {reg.phone}
                                </td>
                                {event?.isPaid && (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {reg.paymentStatus && (
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${reg.paymentStatus === 'verified' ? 'bg-green-100 text-green-800' :
                                                        reg.paymentStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                                            reg.paymentStatus === 'refunded' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'}`}>
                                                    {reg.paymentStatus === 'verified' ? 'Onaylandı' :
                                                        reg.paymentStatus === 'rejected' ? 'Reddedildi' :
                                                            reg.paymentStatus === 'refunded' ? 'İade Edildi' : 'Bekliyor'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-900">
                                            {reg.paymentProofUrl ? (
                                                <a href={reg.paymentProofUrl} target="_blank" rel="noopener noreferrer">
                                                    Görüntüle
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            {reg.paymentStatus === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => updatePaymentStatus(reg._id, 'verified')}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Onayla
                                                    </button>
                                                    <button
                                                        onClick={() => updatePaymentStatus(reg._id, 'rejected')}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Reddet
                                                    </button>
                                                </>
                                            )}
                                            {reg.paymentStatus === 'verified' && (
                                                <button
                                                    onClick={() => updatePaymentStatus(reg._id, 'refunded')}
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                >
                                                    İade Et
                                                </button>
                                            )}
                                        </td>
                                    </>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(reg.createdAt).toLocaleDateString('tr-TR')} {new Date(reg.createdAt).toLocaleTimeString('tr-TR')}
                                </td>
                            </tr>
                        ))}
                        {registrations.length === 0 && (
                            <tr>
                                <td colSpan={event?.isPaid ? 9 : 6} className="px-6 py-4 text-center text-sm text-gray-500">
                                    Henüz başvuru bulunmamaktadır.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
