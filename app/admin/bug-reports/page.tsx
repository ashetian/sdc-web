"use client";

import { useEffect, useState } from "react";
import { Bug, Clock, CheckCircle, XCircle, Eye, Trash2, MessageSquare } from "lucide-react";
import { SkeletonList } from "@/app/_components/Skeleton";
import { Button } from '@/app/_components/ui';

interface BugReport {
    _id: string;
    title: string;
    description: string;
    page: string;
    browser?: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    adminNote?: string;
    createdAt: string;
    reporterId?: {
        nickname: string;
        studentNo: string;
        email: string;
        avatar?: string;
    };
    reviewedById?: {
        nickname: string;
    };
}

interface Counts {
    pending: number;
    reviewed: number;
    resolved: number;
    dismissed: number;
}

const STATUS_CONFIG = {
    pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    reviewed: { label: 'İncelendi', color: 'bg-blue-100 text-blue-800', icon: Eye },
    resolved: { label: 'Çözüldü', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    dismissed: { label: 'Reddedildi', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

export default function BugReportsAdmin() {
    const [reports, setReports] = useState<BugReport[]>([]);
    const [counts, setCounts] = useState<Counts>({ pending: 0, reviewed: 0, resolved: 0, dismissed: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
    const [adminNote, setAdminNote] = useState('');
    const [updating, setUpdating] = useState(false);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/bug-reports?status=${filter}`);
            if (res.ok) {
                const data = await res.json();
                setReports(data.reports);
                setCounts(data.counts);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [filter]);

    const updateStatus = async (id: string, status: string) => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/bug-reports/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, adminNote }),
            });
            if (res.ok) {
                fetchReports();
                setSelectedReport(null);
                setAdminNote('');
            }
        } catch (error) {
            console.error('Update error:', error);
        } finally {
            setUpdating(false);
        }
    };

    const deleteReport = async (id: string) => {
        if (!confirm('Bu bildirimi silmek istediğinizden emin misiniz?')) return;

        try {
            const res = await fetch(`/api/admin/bug-reports/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchReports();
                setSelectedReport(null);
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border-4 border-black shadow-neo p-6">
                <div className="flex items-center gap-3">
                    <Bug size={32} className="text-red-500" />
                    <div>
                        <h1 className="text-2xl font-black">Hata Bildirimleri</h1>
                        <p className="text-gray-600 font-medium">Kullanıcılardan gelen hata ve geri bildirimler</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                    const StatusIcon = config.icon;
                    const count = counts[key as keyof Counts];
                    return (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`p-4 border-4 border-black shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all ${filter === key ? 'bg-black text-white' : 'bg-white'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <StatusIcon size={20} />
                                <span className="font-bold text-lg">{count}</span>
                            </div>
                            <p className="text-sm font-medium mt-1">{config.label}</p>
                        </button>
                    );
                })}
            </div>

            {/* Filter Reset */}
            {filter !== 'all' && (
                <button
                    onClick={() => setFilter('all')}
                    className="text-sm font-bold text-blue-600 hover:underline"
                >
                    ← Tüm bildirimleri göster
                </button>
            )}

            {/* Reports List */}
            <div className="bg-white border-4 border-black shadow-neo">
                {loading ? (
                    <SkeletonList items={5} />
                ) : reports.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Bug size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="font-bold">Henüz bildirim yok</p>
                    </div>
                ) : (
                    <div className="divide-y-2 divide-black">
                        {reports.map((report) => {
                            const statusConfig = STATUS_CONFIG[report.status];
                            const StatusIcon = statusConfig.icon;
                            return (
                                <div
                                    key={report._id}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedReport?._id === report._id ? 'bg-yellow-50' : ''
                                        }`}
                                    onClick={() => {
                                        setSelectedReport(report);
                                        setAdminNote(report.adminNote || '');
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 text-xs font-bold rounded ${statusConfig.color}`}>
                                                    <StatusIcon size={12} className="inline mr-1" />
                                                    {statusConfig.label}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {formatDate(report.createdAt)}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg truncate">{report.title}</h3>
                                            <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                <span>📄 {report.page}</span>
                                                {report.reporterId && (
                                                    <span>👤 {report.reporterId.nickname || report.reporterId.studentNo}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Detail Panel */}
            {selectedReport && (
                <div className="bg-white border-4 border-black shadow-neo p-6 space-y-4">
                    <div className="flex items-start justify-between">
                        <h2 className="text-xl font-black">{selectedReport.title}</h2>
                        <button
                            onClick={() => setSelectedReport(null)}
                            className="text-gray-500 hover:text-black"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-bold text-gray-500">Açıklama</label>
                            <p className="mt-1 p-3 bg-gray-50 border-2 border-gray-200">{selectedReport.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-gray-500">Sayfa</label>
                                <p className="mt-1 font-mono text-sm">{selectedReport.page}</p>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-500">Bildiren</label>
                                <p className="mt-1">
                                    {selectedReport.reporterId?.nickname || selectedReport.reporterId?.studentNo || 'Bilinmiyor'}
                                </p>
                            </div>
                        </div>

                        {selectedReport.browser && (
                            <div>
                                <label className="text-sm font-bold text-gray-500">Tarayıcı</label>
                                <p className="mt-1 text-xs font-mono text-gray-600 truncate">{selectedReport.browser}</p>
                            </div>
                        )}

                        <div>
                            <label className="text-sm font-bold text-gray-500 flex items-center gap-1">
                                <MessageSquare size={14} />
                                Admin Notu
                            </label>
                            <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                placeholder="Not ekle..."
                                className="mt-1 w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-300"
                                rows={2}
                            />
                        </div>

                        <div className="flex flex-wrap gap-2 pt-4 border-t-2 border-gray-200">
                            <Button
                                onClick={() => updateStatus(selectedReport._id, 'reviewed')}
                                disabled={updating}
                                isLoading={updating}
                            >
                                <Eye size={16} className="inline mr-1" />
                                İncelendi
                            </Button>
                            <Button
                                onClick={() => updateStatus(selectedReport._id, 'resolved')}
                                disabled={updating}
                                variant="success"
                            >
                                <CheckCircle size={16} className="inline mr-1" />
                                Çözüldü
                            </Button>
                            <Button
                                onClick={() => updateStatus(selectedReport._id, 'dismissed')}
                                disabled={updating}
                                variant="secondary"
                            >
                                <XCircle size={16} className="inline mr-1" />
                                Reddet
                            </Button>
                            <Button
                                onClick={() => deleteReport(selectedReport._id)}
                                variant="danger"
                            >
                                <Trash2 size={16} className="inline mr-1" />
                                Sil
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
