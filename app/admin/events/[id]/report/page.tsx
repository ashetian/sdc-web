'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SkeletonForm, SkeletonPageHeader, SkeletonGallery, SkeletonList } from '@/app/_components/Skeleton';
import ContentBlockEditor, { ContentBlock } from '@/app/admin/_components/ContentBlockEditor';
import { Save, ArrowLeft, FileText, Users, Clock } from 'lucide-react';
import { Button } from '@/app/_components/ui';

interface ReportData {
    contentBlocks: ContentBlock[];
    participantCount: number;
    duration: number;
    summary: string;
    summaryEn?: string;
    reportedAt?: Date;
}

interface EventData {
    title: string;
    report: ReportData | null;
    isEnded: boolean;
}

export default function EventReportPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [eventTitle, setEventTitle] = useState('');
    const [isEnded, setIsEnded] = useState(false);

    // Form state
    const [summary, setSummary] = useState('');
    const [participantCount, setParticipantCount] = useState(0);
    const [duration, setDuration] = useState(0);
    const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);

    // Fetch event report
    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await fetch(`/api/events/${id}/report`);
                if (!res.ok) throw new Error('Rapor yüklenemedi');

                const data: EventData = await res.json();
                setEventTitle(data.title);
                setIsEnded(data.isEnded);

                if (data.report) {
                    setSummary(data.report.summary || '');
                    setParticipantCount(data.report.participantCount || 0);
                    setDuration(data.report.duration || 0);
                    setContentBlocks(data.report.contentBlocks || []);
                }

                // Fetch participant count from attendance if not set
                if (!data.report?.participantCount) {
                    try {
                        const regRes = await fetch(`/api/events/${id}/registrations`);
                        if (regRes.ok) {
                            const regData = await regRes.json();
                            const attended = regData.filter((r: any) => r.attendedAt).length;
                            setParticipantCount(attended);
                        }
                    } catch (e) {
                        console.error('Katılımcı sayısı alınamadı:', e);
                    }
                }
            } catch (error) {
                console.error('Rapor yüklenirken hata:', error);
                alert('Rapor yüklenirken bir hata oluştu');
                router.push('/admin/events');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [id, router]);

    const handleSave = async () => {
        if (!summary.trim()) {
            alert('Rapor özeti gerekli');
            return;
        }
        if (participantCount <= 0) {
            alert('Geçerli bir katılımcı sayısı girin');
            return;
        }
        if (duration <= 0) {
            alert('Geçerli bir süre girin (dakika)');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/events/${id}/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    summary,
                    participantCount,
                    duration,
                    contentBlocks,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Rapor kaydedilemedi');
            }

            alert('Rapor başarıyla kaydedildi!');
            router.push('/admin/events');
        } catch (error) {
            console.error('Rapor kaydedilirken hata:', error);
            alert(error instanceof Error ? error.message : 'Rapor kaydedilirken bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <SkeletonList items={5} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border-4 border-black shadow-neo p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <Link
                            href="/admin/events"
                            className="inline-flex items-center gap-1 text-gray-600 hover:text-black font-bold mb-2"
                        >
                            <ArrowLeft size={16} /> Etkinliklere Dön
                        </Link>
                        <h1 className="text-2xl font-black text-black uppercase flex items-center gap-2">
                            <FileText size={24} /> Sonuç Raporu
                        </h1>
                        <p className="text-gray-600 mt-1">{eventTitle}</p>
                    </div>
                    {isEnded && (
                        <span className="px-3 py-1 bg-gray-500 text-white font-black text-sm border-2 border-black">
                            ARŞİV MODU
                        </span>
                    )}
                </div>
            </div>

            {/* Report Form */}
            <div className="bg-white border-4 border-black shadow-neo p-6 space-y-6">
                {isEnded && (
                    <div className="bg-gray-100 border-2 border-gray-400 p-4 text-center">
                        <p className="font-bold text-gray-600">
                            Bu etkinlik sonlandırılmış. Rapor salt okunur modda görüntüleniyor.
                        </p>
                    </div>
                )}

                {/* Summary */}
                <div>
                    <label className="block text-sm font-black uppercase mb-2">
                        Rapor Özeti *
                    </label>
                    <textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        disabled={isEnded}
                        placeholder="Etkinlik hakkında kısa bir özet yazın. Bu, duyuru açıklaması olarak kullanılacak."
                        rows={4}
                        className="w-full px-4 py-3 border-4 border-black font-medium focus:outline-none focus:shadow-neo transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Bu özet, otomatik oluşturulacak duyurunun açıklaması olacak.</p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-black uppercase mb-2 flex items-center gap-2">
                            <Users size={16} /> Katılımcı Sayısı *
                        </label>
                        <input
                            type="number"
                            value={participantCount}
                            onChange={(e) => setParticipantCount(parseInt(e.target.value) || 0)}
                            disabled={isEnded}
                            min={0}
                            className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Yoklamadan otomatik çekilir, düzenlenebilir.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-black uppercase mb-2 flex items-center gap-2">
                            <Clock size={16} /> Süre (Dakika) *
                        </label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                            disabled={isEnded}
                            min={0}
                            placeholder="örn: 120"
                            className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {duration > 0 && `${Math.floor(duration / 60)} saat ${duration % 60} dakika`}
                        </p>
                    </div>
                </div>

                {/* Content Blocks */}
                <div>
                    <label className="block text-sm font-black uppercase mb-2">
                        İçerik Blokları (Opsiyonel)
                    </label>
                    <p className="text-xs text-gray-500 mb-4">
                        Etkinlik fotoğrafları ve detaylı metin ekleyebilirsiniz. Bu içerik duyuru sayfasında görüntülenecek.
                    </p>
                    {isEnded ? (
                        <div className="border-2 border-gray-200 p-4 bg-gray-50">
                            {contentBlocks.length === 0 ? (
                                <p className="text-gray-500 text-center">İçerik bloğu eklenmemiş.</p>
                            ) : (
                                <div className="space-y-4">
                                    {contentBlocks.map((block, index) => (
                                        <div key={block.id || index} className="p-3 bg-white border-2 border-black">
                                            <span className="text-xs font-bold uppercase text-gray-400">
                                                {block.type === 'text' ? 'Metin' : block.type === 'image' ? 'Görsel' : 'Görsel Grid'}
                                            </span>
                                            {block.type === 'text' && (
                                                <p className="mt-2 whitespace-pre-wrap">{block.content}</p>
                                            )}
                                            {block.type === 'image' && block.image && (
                                                <img src={block.image} alt="" className="mt-2 max-h-48 object-cover" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <ContentBlockEditor blocks={contentBlocks} onChange={setContentBlocks} />
                    )}
                </div>

                {/* Actions */}
                {!isEnded && (
                    <div className="flex justify-end gap-3 pt-4 border-t-4 border-black">
                        <Link
                            href="/admin/events"
                            className="px-6 py-3 bg-gray-200 border-4 border-black font-black uppercase hover:bg-gray-300 transition-all"
                        >
                            İptal
                        </Link>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            isLoading={saving}
                            variant="success"
                        >
                            <Save size={18} />
                            Raporu Kaydet
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
