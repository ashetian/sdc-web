'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/app/_components/LoadingSpinner';

interface Election {
    _id: string;
    title: string;
    description?: string;
    type: 'president' | 'department_head';
    status: 'draft' | 'active' | 'completed';
    startDate?: string;
    endDate?: string;
    useRankedChoice: boolean;
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
};

const statusColors: Record<string, string> = {
    draft: 'bg-gray-300',
    active: 'bg-neo-green',
    completed: 'bg-neo-purple text-white',
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
        if (!confirm('Bu seçimi ve tüm verilerini silmek istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`/api/elections/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchElections();
            }
        } catch (error) {
            console.error('Seçim silinemedi:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
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
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-neo-green text-black border-4 border-black shadow-neo px-6 py-3 font-black uppercase hover:bg-white hover:shadow-none transition-all"
                >
                    {showForm ? 'İptal' : '+ Yeni Seçim'}
                </button>
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
                            <button
                                type="submit"
                                className="bg-black text-white border-4 border-black px-6 py-3 font-black uppercase hover:bg-white hover:text-black transition-all"
                            >
                                Oluştur
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="bg-gray-200 text-black border-4 border-black px-6 py-3 font-black uppercase hover:bg-gray-300 transition-all"
                            >
                                İptal
                            </button>
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
                            <div key={election._id} className="p-6 flex items-center justify-between hover:bg-gray-50 gap-4 flex-wrap">
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
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <Link
                                        href={`/admin/elections/${election._id}`}
                                        className="px-4 py-2 bg-neo-blue text-black border-2 border-black font-black text-sm hover:bg-blue-300 transition-all"
                                    >
                                        Yönet
                                    </Link>
                                    {election.status === 'draft' && (
                                        <button
                                            onClick={() => handleDelete(election._id)}
                                            className="px-4 py-2 bg-red-500 text-white border-2 border-black font-black text-sm hover:bg-red-600 transition-all"
                                        >
                                            Sil
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
