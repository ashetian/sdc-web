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
    createdAt: string;
}

export default function EventRegistrationsPage() {
    const params = useParams();
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Başvuru Listesi</h1>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">
                        Toplam Başvuru: {registrations.length}
                    </div>
                    <button
                        onClick={exportToExcel}
                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={registrations.length === 0}
                    >
                        Excel'e Aktar
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(reg.createdAt).toLocaleDateString('tr-TR')} {new Date(reg.createdAt).toLocaleTimeString('tr-TR')}
                                </td>
                            </tr>
                        ))}
                        {registrations.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
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
