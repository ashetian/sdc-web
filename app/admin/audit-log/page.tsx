"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SkeletonTable } from "@/app/_components/Skeleton";

interface AuditLogEntry {
    _id: string;
    adminName: string;
    action: string;
    targetType: string;
    targetId?: string;
    targetName?: string;
    details?: string;
    ipAddress?: string;
    createdAt: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// Human-readable action labels
const actionLabels: Record<string, string> = {
    CREATE_EVENT: 'Etkinlik Oluşturdu',
    UPDATE_EVENT: 'Etkinlik Güncelledi',
    DELETE_EVENT: 'Etkinlik Sildi',
    END_EVENT: 'Etkinlik Sonlandırdı',
    CREATE_ANNOUNCEMENT: 'Duyuru Oluşturdu',
    UPDATE_ANNOUNCEMENT: 'Duyuru Güncelledi',
    DELETE_ANNOUNCEMENT: 'Duyuru Sildi',
    ARCHIVE_ANNOUNCEMENT: 'Duyuru Arşivledi',
    DEACTIVATE_USER: 'Kullanıcı Deaktif Etti',
    ACTIVATE_USER: 'Kullanıcı Aktif Etti',
    UPDATE_USER_ROLE: 'Kullanıcı Rolü Değiştirdi',
    UPDATE_SETTINGS: 'Ayarları Güncelledi',
    IMPORT_MEMBERS: 'Üye İçe Aktardı',
    CREATE_DEPARTMENT: 'Departman Oluşturdu',
    UPDATE_DEPARTMENT: 'Departman Güncelledi',
    DELETE_DEPARTMENT: 'Departman Sildi',
    CREATE_ELECTION: 'Oylama Oluşturdu',
    UPDATE_ELECTION: 'Oylama Güncelledi',
    DELETE_ELECTION: 'Oylama Sildi',
    CREATE_PROJECT: 'Proje Oluşturdu',
    UPDATE_PROJECT: 'Proje Güncelledi',
    DELETE_PROJECT: 'Proje Sildi',
    CREATE_STAT: 'İstatistik Oluşturdu',
    UPDATE_STAT: 'İstatistik Güncelledi',
    DELETE_STAT: 'İstatistik Sildi',
    CREATE_TEAM_MEMBER: 'Ekip Üyesi Oluşturdu',
    UPDATE_TEAM_MEMBER: 'Ekip Üyesi Güncelledi',
    DELETE_TEAM_MEMBER: 'Ekip Üyesi Sildi',
    DELETE_COMMENT: 'Yorum Sildi',
    RESTORE_COMMENT: 'Yorum Geri Yükledi',
};

export default function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        async function fetchLogs() {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/audit-log?page=${currentPage}&limit=50`);
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data.logs);
                    setPagination(data.pagination);
                }
            } catch (error) {
                console.error('Failed to fetch audit logs:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchLogs();
    }, [currentPage]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getActionLabel = (action: string) => {
        return actionLabels[action] || action;
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white border-4 border-black shadow-neo p-6 mb-8">
                    <h1 className="text-3xl font-black text-black uppercase">Audit Log</h1>
                    <p className="text-gray-600 font-medium mt-2">Admin işlem geçmişi</p>
                </div>

                {loading ? (
                    <div className="bg-white border-4 border-black shadow-neo p-4">
                        <SkeletonTable rows={8} cols={5} />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="bg-white border-4 border-black shadow-neo p-8 text-center">
                        <p className="font-bold text-lg">Henüz kayıtlı işlem yok.</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white border-4 border-black shadow-neo overflow-hidden">
                            <table className="min-w-full">
                                <thead className="bg-black text-white">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-black uppercase">Tarih</th>
                                        <th className="px-4 py-3 text-left text-sm font-black uppercase">Admin</th>
                                        <th className="px-4 py-3 text-left text-sm font-black uppercase">İşlem</th>
                                        <th className="px-4 py-3 text-left text-sm font-black uppercase">Hedef</th>
                                        <th className="px-4 py-3 text-left text-sm font-black uppercase hidden lg:table-cell">Detay</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-black">
                                    {logs.map((log) => (
                                        <tr key={log._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                                                {formatDate(log.createdAt)}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-bold">{log.adminName}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-neo-yellow border-2 border-black text-xs font-black uppercase">
                                                    {getActionLabel(log.action)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className="font-bold">{log.targetType}</span>
                                                {log.targetName && (
                                                    <span className="text-gray-600 ml-1">({log.targetName})</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                                                {log.details || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="mt-6 flex justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-white border-2 border-black font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-colors"
                                >
                                    <ChevronLeft size={16} className="inline" /> Önceki
                                </button>
                                <span className="px-4 py-2 bg-black text-white font-bold">
                                    {currentPage} / {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                                    disabled={currentPage === pagination.totalPages}
                                    className="px-4 py-2 bg-white border-2 border-black font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-colors"
                                >
                                    Sonraki <ChevronRight size={16} className="inline" />
                                </button>
                            </div>
                        )}

                        {pagination && (
                            <p className="mt-4 text-center text-sm text-gray-600">
                                Toplam {pagination.total} kayıt
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
