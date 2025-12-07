'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, RotateCcw } from 'lucide-react';

interface Comment {
    _id: string;
    contentType: 'project' | 'gallery' | 'announcement';
    contentId: string;
    contentTitle: string;
    content: string;
    isDeleted?: boolean;
    deletedAt?: string;
    createdAt: string;
    author: {
        fullName: string;
        nickname?: string;
        studentNo: string;
    };
}

export default function AdminCommentsPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'project' | 'gallery' | 'announcement'>('all');
    const [showDeleted, setShowDeleted] = useState(false);
    const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
    const [actionModalId, setActionModalId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'restore' | 'permanentDelete' | null>(null);

    useEffect(() => {
        fetchComments();
    }, [filter, showDeleted]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            let url = '/api/admin/comments';
            const params = new URLSearchParams();
            if (filter !== 'all') params.append('type', filter);
            if (showDeleted) params.append('deleted', 'true');
            if (params.toString()) url += '?' + params.toString();

            const res = await fetch(url);

            if (res.ok) {
                const data = await res.json();
                setComments(data);
            } else {
                console.error('Fetch failed:', res.status);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/comments?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setComments(comments.filter(c => c._id !== id));
            }
        } catch (err) {
            console.error('Delete error:', err);
        } finally {
            setDeleteModalId(null);
        }
    };

    const handleAction = async (id: string, action: 'restore' | 'permanentDelete') => {
        try {
            const res = await fetch('/api/admin/comments', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ commentId: id, action }),
            });

            if (res.ok) {
                setComments(comments.filter(c => c._id !== id));
            }
        } catch (err) {
            console.error('Action error:', err);
        } finally {
            setActionModalId(null);
            setActionType(null);
        }
    };

    const handleCleanup = async () => {
        if (!confirm('30 günden eski tüm silinmiş yorumlar kalıcı olarak silinecek. Devam etmek istiyor musunuz?')) return;

        try {
            const res = await fetch('/api/admin/comments', {
                method: 'DELETE',
            });

            if (res.ok) {
                const data = await res.json();
                alert(data.message);
                fetchComments();
            }
        } catch (err) {
            console.error('Cleanup error:', err);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'project': return 'bg-neo-purple text-white';
            case 'gallery': return 'bg-neo-blue text-black';
            case 'announcement': return 'bg-neo-green text-black';
            default: return 'bg-gray-200';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'project': return 'Proje';
            case 'gallery': return 'Galeri';
            case 'announcement': return 'Duyuru';
            default: return type;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('tr-TR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getDaysRemaining = (deletedAt: string) => {
        const deleted = new Date(deletedAt);
        const expiry = new Date(deleted);
        expiry.setDate(expiry.getDate() + 30);
        const now = new Date();
        const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, days);
    };


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border-4 border-black shadow-neo p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-black text-black uppercase">Yorum Yönetimi</h1>
                <div className="flex flex-wrap gap-2">
                    {/* Active/Deleted Toggle */}
                    <button
                        onClick={() => setShowDeleted(false)}
                        className={`px-4 py-2 font-bold border-2 border-black transition-all ${!showDeleted ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                            }`}
                    >
                        Aktif ({!showDeleted ? comments.length : '...'})
                    </button>
                    <button
                        onClick={() => setShowDeleted(true)}
                        className={`px-4 py-2 font-bold border-2 border-black transition-all ${showDeleted ? 'bg-red-500 text-white' : 'bg-white text-black hover:bg-gray-100'
                            }`}
                    >
                        Silinen ({showDeleted ? comments.length : '...'})
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border-4 border-black shadow-neo p-4">
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="font-bold text-black">Filtre:</span>
                    {(['all', 'project', 'gallery', 'announcement'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-3 py-1 font-bold border-2 border-black transition-all text-sm ${filter === type ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                                }`}
                        >
                            {type === 'all' ? 'Tümü' : getTypeLabel(type)}
                        </button>
                    ))}

                    {showDeleted && (
                        <button
                            onClick={handleCleanup}
                            className="ml-auto px-4 py-1 bg-red-600 text-white font-bold border-2 border-black hover:bg-red-700 text-sm"
                        >
                            30 Gün+ Olanları Temizle
                        </button>
                    )}
                </div>
            </div>

            {/* Comments List */}
            <div className="bg-white border-4 border-black shadow-neo p-6">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-black border-t-transparent mx-auto"></div>
                    </div>
                ) : comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        {showDeleted ? 'Silinmiş yorum bulunamadı.' : 'Yorum bulunamadı.'}
                    </p>
                ) : (
                    <ul className="space-y-4">
                        {comments.map((comment) => (
                            <li key={comment._id} className={`border-2 border-black p-4 ${showDeleted ? 'bg-red-50' : ''}`}>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Content Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className={`px-2 py-0.5 text-xs font-bold border border-black ${getTypeColor(comment.contentType)}`}>
                                                {getTypeLabel(comment.contentType)}
                                            </span>
                                            <span className="font-bold text-black truncate">{comment.contentTitle}</span>
                                        </div>

                                        <p className="text-gray-800 mb-2 break-words">{comment.content}</p>

                                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                                            <span>
                                                <strong>{comment.author.nickname || comment.author.fullName}</strong>
                                                {' '}({comment.author.studentNo})
                                            </span>
                                            <span>{formatDate(comment.createdAt)}</span>
                                            {showDeleted && comment.deletedAt && (
                                                <span className="text-red-600 font-bold">
                                                    Kalıcı silmeye: {getDaysRemaining(comment.deletedAt)} gün
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex-shrink-0 flex gap-2">
                                        {showDeleted ? (
                                            <>
                                                <button
                                                    onClick={() => { setActionModalId(comment._id); setActionType('restore'); }}
                                                    className="px-4 py-2 bg-green-500 text-white font-bold border-2 border-black hover:bg-green-600 transition-all"
                                                >
                                                    Geri Yükle
                                                </button>
                                                <button
                                                    onClick={() => { setActionModalId(comment._id); setActionType('permanentDelete'); }}
                                                    className="px-4 py-2 bg-red-600 text-white font-bold border-2 border-black hover:bg-red-700 transition-all"
                                                >
                                                    Kalıcı Sil
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => setDeleteModalId(comment._id)}
                                                className="px-4 py-2 bg-red-500 text-white font-bold border-2 border-black hover:bg-red-600 transition-all"
                                            >
                                                Sil
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModalId && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-4 border-black shadow-neo max-w-md w-full p-6">
                        <h3 className="text-xl font-black text-black mb-4 flex items-center gap-2"><AlertTriangle size={20} /> Yorumu Sil</h3>
                        <p className="text-gray-700 mb-6">
                            Bu yorumu silmek istediğinize emin misiniz? Silinen yorumlar 30 gün boyunca geri alınabilir.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleDelete(deleteModalId)}
                                className="flex-1 bg-red-500 text-white py-3 font-bold border-2 border-black hover:bg-red-600 transition-all"
                            >
                                Evet, Sil
                            </button>
                            <button
                                onClick={() => setDeleteModalId(null)}
                                className="flex-1 bg-gray-200 text-black py-3 font-bold border-2 border-black hover:bg-gray-300 transition-all"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Modal (Restore/Permanent Delete) */}
            {actionModalId && actionType && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-4 border-black shadow-neo max-w-md w-full p-6">
                        <h3 className="text-xl font-black text-black mb-4">
                            {actionType === 'restore' ? <><RotateCcw size={16} className="inline" /> Yorumu Geri Yükle</> : <><Trash2 size={16} className="inline" /> Kalıcı Silme</>}
                        </h3>
                        <p className="text-gray-700 mb-6">
                            {actionType === 'restore'
                                ? 'Bu yorum geri yüklenecek ve tekrar görünür olacak.'
                                : 'Bu yorum kalıcı olarak silinecek ve geri alınamayacak!'}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleAction(actionModalId, actionType)}
                                className={`flex-1 py-3 font-bold border-2 border-black transition-all ${actionType === 'restore'
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                            >
                                {actionType === 'restore' ? 'Geri Yükle' : 'Kalıcı Sil'}
                            </button>
                            <button
                                onClick={() => { setActionModalId(null); setActionType(null); }}
                                className="flex-1 bg-gray-200 text-black py-3 font-bold border-2 border-black hover:bg-gray-300 transition-all"
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
