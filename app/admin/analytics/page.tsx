'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Users, Calendar, FileText, TrendingUp, Clock, Star,
    MessageSquare, Rocket, Download, RefreshCw
} from 'lucide-react';
import { SkeletonList } from '@/app/_components/Skeleton';

interface AnalyticsData {
    members: {
        total: number;
        active: number;
        registered: number;
        emailConsent: number;
        activeLastWeek: number;
        activeLastMonth: number;
        newThisMonth: number;
    };
    events: {
        total: number;
        completed: number;
        open: number;
        totalRegistrations: number;
        totalAttendance: number;
        averageRating: number;
        ratingCount: number;
        totalDurationMinutes: number;
        totalDurationHours: number;
    };
    content: {
        announcements: {
            total: number;
            byType: Record<string, number>;
        };
        projects: {
            total: number;
            approved: number;
            pending: number;
        };
        forum: {
            topics: number;
            replies: number;
        };
        comments: number;
    };
    trends: {
        memberRegistrations: { label: string; value: number }[];
        eventAttendance: { label: string; value: number }[];
        activeUsers: { label: string; value: number }[];
    };
    generatedAt: string;
}

// Simple bar chart component (no external dependency)
function SimpleBarChart({ data, color, label }: { data: { label: string; value: number }[]; color: string; label: string }) {
    if (!data || data.length === 0) {
        return <div className="text-center py-8 text-gray-500">Veri yok</div>;
    }

    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div className="space-y-2">
            <h4 className="font-bold text-sm mb-4">{label}</h4>
            <div className="flex items-end gap-1 h-40">
                {data.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                        <div
                            className={`w-full ${color} border-2 border-black transition-all hover:opacity-80`}
                            style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: item.value > 0 ? '4px' : '0' }}
                            title={`${item.label}: ${item.value}`}
                        />
                        <span className="text-[10px] mt-1 text-gray-500 rotate-[-45deg] origin-top-left whitespace-nowrap">
                            {item.label.split(' ')[0]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Stat card component
function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color = 'bg-white'
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    color?: string;
}) {
    return (
        <div className={`${color} border-4 border-black shadow-neo p-4 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-bold text-gray-600 uppercase">{title}</p>
                    <p className="text-3xl font-black mt-1">{value}</p>
                    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <Icon className="text-gray-400" size={24} />
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/analytics');
            if (!res.ok) throw new Error('Veriler alınamadı');
            const json = await res.json();
            setData(json);
        } catch (err) {
            setError('Analitik verileri yüklenirken bir hata oluştu.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const exportData = () => {
        if (!data) return;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sdc-analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-black">Analitik Dashboard</h1>
                    <p className="text-gray-600">Veriler yükleniyor...</p>
                </div>
                <SkeletonList items={6} />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8">
                <div className="bg-red-100 border-4 border-red-500 p-6 text-center">
                    <p className="text-red-700 font-bold">{error || 'Veri bulunamadı'}</p>
                    <button
                        onClick={fetchData}
                        className="mt-4 px-4 py-2 bg-red-500 text-white font-bold border-2 border-black hover:bg-red-600"
                    >
                        Tekrar Dene
                    </button>
                </div>
            </div>
        );
    }

    const announcementTypes: Record<string, string> = {
        event: 'Etkinlik',
        news: 'Haber',
        article: 'Makale',
        opportunity: 'Fırsat',
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-white border-4 border-black shadow-neo p-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black">📊 Analitik Dashboard</h1>
                    <p className="text-gray-600 font-bold">Site Metrikleri</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Son güncelleme: {new Date(data.generatedAt).toLocaleString('tr-TR')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-2 border-black font-bold hover:bg-gray-200"
                    >
                        <RefreshCw size={16} /> Yenile
                    </button>
                    <button
                        onClick={exportData}
                        className="flex items-center gap-2 px-4 py-2 bg-neo-yellow border-2 border-black font-bold hover:bg-yellow-400"
                    >
                        <Download size={16} /> JSON İndir
                    </button>
                </div>
            </div>

            {/* Member Metrics */}
            <div>
                <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                    <Users size={24} /> Üye Metrikleri
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        title="Toplam Üye"
                        value={data.members.total}
                        subtitle={`${data.members.active} aktif`}
                        icon={Users}
                        color="bg-neo-blue"
                    />
                    <StatCard
                        title="Kayıtlı Üye"
                        value={data.members.registered}
                        subtitle={`${Math.round(data.members.registered / data.members.total * 100)}% oran`}
                        icon={Users}
                        color="bg-neo-green"
                    />
                    <StatCard
                        title="Bu Ay Yeni"
                        value={data.members.newThisMonth}
                        icon={TrendingUp}
                        color="bg-neo-yellow"
                    />
                    <StatCard
                        title="Son 30 Gün Aktif"
                        value={data.members.activeLastMonth}
                        subtitle={`${data.members.activeLastWeek} bu hafta`}
                        icon={TrendingUp}
                        color="bg-neo-orange"
                    />
                </div>
            </div>

            {/* Event Metrics */}
            <div>
                <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                    <Calendar size={24} /> Etkinlik Metrikleri
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        title="Toplam Etkinlik"
                        value={data.events.total}
                        subtitle={`${data.events.completed} tamamlandı`}
                        icon={Calendar}
                        color="bg-neo-purple"
                    />
                    <StatCard
                        title="Toplam Kayıt"
                        value={data.events.totalRegistrations}
                        subtitle={`${data.events.totalAttendance} katılım`}
                        icon={Users}
                        color="bg-neo-pink"
                    />
                    <StatCard
                        title="Ortalama Puan"
                        value={data.events.averageRating || '-'}
                        subtitle={`${data.events.ratingCount} değerlendirme`}
                        icon={Star}
                        color="bg-neo-yellow"
                    />
                    <StatCard
                        title="Toplam Süre"
                        value={`${data.events.totalDurationHours}s`}
                        subtitle={`${data.events.totalDurationMinutes} dakika`}
                        icon={Clock}
                        color="bg-neo-green"
                    />
                </div>
            </div>

            {/* Content Metrics */}
            <div>
                <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                    <FileText size={24} /> İçerik Metrikleri
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        title="Duyurular"
                        value={data.content.announcements.total}
                        subtitle={Object.entries(data.content.announcements.byType)
                            .map(([k, v]) => `${announcementTypes[k] || k}: ${v}`)
                            .join(', ')}
                        icon={FileText}
                        color="bg-white"
                    />
                    <StatCard
                        title="Projeler"
                        value={data.content.projects.total}
                        subtitle={`${data.content.projects.approved} onaylı, ${data.content.projects.pending} bekleyen`}
                        icon={Rocket}
                        color="bg-neo-blue"
                    />
                    <StatCard
                        title="Forum"
                        value={data.content.forum.topics}
                        subtitle={`${data.content.forum.replies} yanıt`}
                        icon={MessageSquare}
                        color="bg-neo-orange"
                    />
                    <StatCard
                        title="Yorumlar"
                        value={data.content.comments}
                        icon={MessageSquare}
                        color="bg-neo-pink"
                    />
                </div>
            </div>

            {/* Trends */}
            <div>
                <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                    <TrendingUp size={24} /> Trendler (Son 12 Ay)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border-4 border-black shadow-neo p-4">
                        <SimpleBarChart
                            data={data.trends.memberRegistrations}
                            color="bg-neo-green"
                            label="Yeni Üye Kayıtları"
                        />
                    </div>
                    <div className="bg-white border-4 border-black shadow-neo p-4">
                        <SimpleBarChart
                            data={data.trends.eventAttendance}
                            color="bg-neo-blue"
                            label="Etkinlik Katılımları"
                        />
                    </div>
                    <div className="bg-white border-4 border-black shadow-neo p-4">
                        <SimpleBarChart
                            data={data.trends.activeUsers}
                            color="bg-neo-purple"
                            label="Aktif Kullanıcılar"
                        />
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-100 border-4 border-black shadow-neo p-6">
                <h2 className="text-xl font-black mb-4">📋 Özet</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-3xl font-black">{data.members.total}</p>
                        <p className="text-sm font-bold text-gray-600">Toplam Üye</p>
                    </div>
                    <div>
                        <p className="text-3xl font-black">{data.events.completed}</p>
                        <p className="text-sm font-bold text-gray-600">Tamamlanan Etkinlik</p>
                    </div>
                    <div>
                        <p className="text-3xl font-black">{data.events.totalAttendance}</p>
                        <p className="text-sm font-bold text-gray-600">Toplam Katılım</p>
                    </div>
                    <div>
                        <p className="text-3xl font-black">{data.events.totalDurationHours}s</p>
                        <p className="text-sm font-bold text-gray-600">Etkinlik Süresi</p>
                    </div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-4">
                    Bu verileri JSON formatında dışa aktarabilirsiniz.
                </p>
            </div>
        </div>
    );
}
