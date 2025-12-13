'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SkeletonTable, SkeletonPageHeader, SkeletonList } from '@/app/_components/Skeleton';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button, ConfirmModal } from '@/app/_components/ui';

interface Election {
    _id: string;
    title: string;
    description?: string;
    type: 'president' | 'department_head';
    status: 'draft' | 'active' | 'completed' | 'suspended';
    startDate?: string;
    endDate?: string;
    useRankedChoice: boolean;
    isSuspended?: boolean;
    suspensionReason?: string;
    suspendedAt?: string;
    stats?: {
        candidateCount: number;
        memberCount: number;
        voteCount: number;
        votedMemberCount: number;
        turnout: string;
    };
}

const statusLabels: Record<string, string> = {
    draft: 'Taslak',
    active: 'Devam Ediyor',
    completed: 'Tamamlandı',
    suspended: 'Askıya Alındı',
};

const statusColors: Record<string, string> = {
    draft: 'bg-gray-300',
    active: 'bg-neo-green',
    completed: 'bg-neo-purple text-white',
    suspended: 'bg-red-500 text-white',
};

export default function ElectionsPage() {
    const [elections, setElections] = useState<Election[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'president' as 'president' | 'department_head',
        useRankedChoice: true,
    });

    // Modal states
    const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
    const [suspendModalId, setSuspendModalId] = useState<string | null>(null);
    const [suspensionReason, setSuspensionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchElections();
    }, []);

    const fetchElections = async () => {
        try {
            const res = await fetch('/api/elections');
            if (res.ok) {
                setElections(await res.json());
            }
        } catch (error) {
            console.error('Seçimler yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/elections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchElections();
                setFormData({ title: '', description: '', type: 'president', useRankedChoice: true });
                setShowForm(false);
            }
        } catch (error) {
            console.error('Seçim oluşturulamadı:', error);
        }
    };

    const handleDelete = async (id: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/elections/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchElections();
            }
        } catch (error) {
            console.error('Seçim silinemedi:', error);
        } finally {
            setActionLoading(false);
            setDeleteModalId(null);
        }
    };

    const handleSuspend = async (id: string) => {
        if (suspensionReason.trim().length < 10) {
            alert('Askıya alma nedeni en az 10 karakter olmalıdır');
            return;
        }

        setActionLoading(true);
        try {
            const res = await fetch(`/api/elections/${id}/suspend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: suspensionReason }),
            });

            if (res.ok) {
                fetchElections();
                setSuspensionReason('');
            } else {
                const data = await res.json();
                alert(data.error || 'Bir hata oluştu');
            }
        } catch (error) {
            console.error('Seçim askıya alınamadı:', error);
        } finally {
            setActionLoading(false);
            setSuspendModalId(null);
        }
    };

    const handleResume = async (id: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/elections/${id}/suspend`, { method: 'DELETE' });
            if (res.ok) {
                fetchElections();
            }
        } catch (error) {
            console.error('Seçim askıdan kaldırılamadı:', error);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <SkeletonList items={5} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border-4 border-black shadow-neo p-6 flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-black text-black uppercase">Seçim Yönetimi</h1>
                    <p className="text-gray-600 font-medium mt-1">Kulüp başkanlığı ve departman seçimlerini yönetin</p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    variant={showForm ? 'secondary' : 'success'}
                >
                    {showForm ? 'İptal' : '+ Yeni Seçim'}
                </Button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white border-4 border-black shadow-neo p-6">
                    <h2 className="text-xl font-black text-black mb-4">Yeni Seçim Oluştur</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-black text-black uppercase mb-1">Başlık *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Örn: 2024-2025 Kulüp Başkanlığı Seçimi"
                                className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-black text-black uppercase mb-1">Açıklama</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">Seçim Tipi</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'president' | 'department_head' })}
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                >
                                    <option value="president">Kulüp Başkanlığı</option>
                                    <option value="department_head">Departman Başkanlığı</option>
                                </select>
                            </div>
                            <div className="flex items-center">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.useRankedChoice}
                                        onChange={(e) => setFormData({ ...formData, useRankedChoice: e.target.checked })}
                                        className="w-5 h-5 border-2 border-black"
                                    />
                                    <span className="font-bold">Çok tercihli oylama (IRV) kullan</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="submit"
                            >
                                Oluştur
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setShowForm(false)}
                                variant="secondary"
                            >
                                İptal
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Election List */}
            <div className="bg-white border-4 border-black shadow-neo">
                {elections.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 font-bold text-lg">Henüz seçim bulunmuyor</p>
                        <p className="text-gray-400 mt-2">Yeni bir seçim oluşturmak için yukarıdaki butonu kullanın</p>
                    </div>
                ) : (
                    <div className="divide-y-4 divide-black">
                        {elections.map((election) => (
                            <div key={election._id} className={`p-6 flex items-center justify-between hover:bg-gray-50 gap-4 flex-wrap ${election.isSuspended ? 'bg-red-50' : ''}`}>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h3 className="text-lg font-black text-black">{election.title}</h3>
                                        <span className={`px-3 py-1 text-xs font-black border-2 border-black ${statusColors[election.status]}`}>
                                            {statusLabels[election.status]}
                                        </span>
                                        {election.useRankedChoice && (
                                            <span className="px-2 py-1 text-xs font-bold bg-neo-blue border border-black">
                                                IRV
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 font-medium mt-1">
                                        {election.type === 'president' ? 'Kulüp Başkanlığı' : 'Departman Başkanlığı'}
                                    </p>
                                    {election.description && (
                                        <p className="text-gray-500 text-sm mt-1">{election.description}</p>
                                    )}
                                    {election.isSuspended && election.suspensionReason && (
                                        <div className="mt-2 p-3 bg-red-100 border-2 border-red-500 text-red-700 text-sm">
                                            <strong>Askıya Alma Nedeni:</strong> {election.suspensionReason}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                                    <Link
                                        href={`/admin/elections/${election._id}`}
                                        className="px-4 py-2 bg-neo-blue text-black border-2 border-black font-black text-sm hover:bg-blue-300 transition-all"
                                    >
                                        Yönet
                                    </Link>

                                    {election.status === 'active' && !election.isSuspended && (
                                        <Button
                                            onClick={() => setSuspendModalId(election._id)}
                                            size="sm"
                                        >
                                            Askıya Al
                                        </Button>
                                    )}

                                    {election.isSuspended && (
                                        <Button
                                            onClick={() => handleResume(election._id)}
                                            disabled={actionLoading}
                                            variant="success"
                                            size="sm"
                                        >
                                            Devam Ettir
                                        </Button>
                                    )}

                                    {(election.status === 'draft' || election.status === 'suspended' || election.status === 'completed') && (
                                        <Button
                                            onClick={() => setDeleteModalId(election._id)}
                                            variant="danger"
                                            size="sm"
                                        >
                                            Sil
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteModalId}
                onClose={() => setDeleteModalId(null)}
                onConfirm={() => deleteModalId && handleDelete(deleteModalId)}
                title="Seçimi Sil"
                message="Bu seçimi silmek istediğinize emin misiniz? Tüm adaylar, üyeler ve oylar da silinecektir. Bu işlem geri alınamaz!"
                confirmText="Evet, Sil"
                cancelText="İptal"
                variant="danger"
                isLoading={actionLoading}
            />

            {/* Suspend Modal */}
            {suspendModalId && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-4 border-black shadow-neo max-w-lg w-full p-6">
                        <h3 className="text-xl font-black text-black mb-4 flex items-center gap-2"><AlertTriangle size={20} /> Seçimi Askıya Al</h3>
                        <p className="text-gray-700 mb-4">
                            Olağanüstü durumlarda seçimi askıya alabilirsiniz. Kullanıcılara gösterilecek bir neden girmeniz gerekmektedir.
                        </p>
                        <div className="mb-6">
                            <label className="block text-sm font-black text-black uppercase mb-2">
                                Askıya Alma Nedeni *
                            </label>
                            <textarea
                                value={suspensionReason}
                                onChange={(e) => setSuspensionReason(e.target.value)}
                                rows={4}
                                placeholder="Örn: Teknik sorunlar nedeniyle seçim askıya alınmıştır. En kısa sürede devam edilecektir."
                                className="w-full px-4 py-3 border-4 border-black font-medium focus:outline-none focus:shadow-neo"
                            />
                            <p className="text-xs text-gray-500 mt-1">En az 10 karakter girilmelidir. Bu mesaj oy kullanmaya çalışan üyelere gösterilecektir.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleSuspend(suspendModalId)}
                                disabled={actionLoading || suspensionReason.trim().length < 10}
                                className="flex-1 bg-orange-500 text-white py-3 font-bold border-2 border-black hover:bg-orange-600 transition-all disabled:opacity-50"
                            >
                                {actionLoading ? 'Askıya Alınıyor...' : 'Askıya Al'}
                            </button>
                            <button
                                onClick={() => { setSuspendModalId(null); setSuspensionReason(''); }}
                                disabled={actionLoading}
                                className="flex-1 bg-gray-200 text-black py-3 font-bold border-2 border-black hover:bg-gray-300 transition-all disabled:opacity-50"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
