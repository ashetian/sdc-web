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
    paymentReceiptUrl?: string;
    paymentStatus: 'pending' | 'verified' | 'rejected';
    paymentVerifiedAt?: string;
    paymentVerifiedBy?: string;
    createdAt: string;
}

export default function EventRegistrationsPage() {
    const params = useParams();
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');

    useEffect(() => {
        if (params.id) {
            fetchRegistrations(params.id as string);
        }
    }, [params.id]);

    const fetchRegistrations = async (eventId: string) => {
        try {
            const res = await fetch(`/api/events/${eventId}/registrations`);
            if (res.ok) {
                const data = await res.json();
                setRegistrations(data);
            }
        } catch (error) {
            console.error('Kayıtlar yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        if (registrations.length === 0) {
            alert('Dışa aktarılacak kayıt bulunmamaktadır.');
            return;
        }

        // Prepare data for Excel
        const excelData = registrations.map((reg) => ({
            'Öğrenci No': reg.studentNumber,
            'Ad Soyad': reg.name,
            'Bölüm': reg.department,
            'E-posta': reg.email,
            'Telefon': reg.phone,
            'Başvuru Tarihi': `${new Date(reg.createdAt).toLocaleDateString('tr-TR')} ${new Date(reg.createdAt).toLocaleTimeString('tr-TR')}`,
        }));

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

    const updatePaymentStatus = async (registrationId: string, status: 'verified' | 'rejected') => {
        try {
            const res = await fetch(`/api/registrations/${registrationId}/payment`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                // Refresh registrations
                if (params.id) {
                    fetchRegistrations(params.id as string);
                }
            } else {
                alert('Ödeme durumu güncellenirken hata oluştu.');
            }
        } catch (error) {
            console.error('Ödeme durumu güncellenirken hata:', error);
            alert('Bir hata oluştu.');
        }
    };

    const filteredRegistrations = registrations.filter(reg => {
        if (filter === 'all') return true;
        return reg.paymentStatus === filter;
    });

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Başvuru Listesi</h1>
                <div className="flex items-center gap-4">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="all">Tüm Başvurular ({registrations.length})</option>
                        <option value="pending">Bekleyen ({registrations.filter(r => r.paymentStatus === 'pending').length})</option>
                        <option value="verified">Onaylanmış ({registrations.filter(r => r.paymentStatus === 'verified').length})</option>
                        <option value="rejected">Reddedilmiş ({registrations.filter(r => r.paymentStatus === 'rejected').length})</option>
                    </select>
                    <div className="text-sm text-gray-500">
                        Görüntülenen: {filteredRegistrations.length}
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Başvuru Tarihi
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ödeme Durumu
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                İşlemler
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRegistrations.map((reg) => (
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(reg.createdAt).toLocaleDateString('tr-TR')} {new Date(reg.createdAt).toLocaleTimeString('tr-TR')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${reg.paymentStatus === 'verified'
                                                ? 'bg-green-100 text-green-800'
                                                : reg.paymentStatus === 'rejected'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {reg.paymentStatus === 'verified' && '✓ Onaylandı'}
                                            {reg.paymentStatus === 'rejected' && '✗ Reddedildi'}
                                            {reg.paymentStatus === 'pending' && '⏳ Beklemede'}
                                        </span>
                                        {reg.paymentReceiptUrl && (
                                            <a
                                                href={reg.paymentReceiptUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:text-blue-800"
                                            >
                                                📎 Dekontu Gör
                                            </a>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {reg.paymentStatus === 'pending' ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => updatePaymentStatus(reg._id, 'verified')}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                ✓ Onayla
                                            </button>
                                            <button
                                                onClick={() => updatePaymentStatus(reg._id, 'rejected')}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                ✗ Reddet
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-xs">
                                            {reg.paymentVerifiedAt && new Date(reg.paymentVerifiedAt).toLocaleDateString('tr-TR')}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredRegistrations.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                                    {filter === 'all' ? 'Henüz başvuru bulunmamaktadır.' : 'Bu filtreyle eşleşen başvuru bulunamadı.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
