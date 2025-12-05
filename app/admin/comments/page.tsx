'use client';

import { useState, useEffect } from 'react';

interface Comment {
    _id: string;
    contentType: 'project' | 'gallery' | 'announcement';
    contentId: string;
    contentTitle: string;
    content: string;
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
    const [password, setPassword] = useState('');
    const [authenticated, setAuthenticated] = useState(false);
    const [filter, setFilter] = useState<'all' | 'project' | 'gallery' | 'announcement'>('all');
    const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

    useEffect(() => {
        const savedPassword = localStorage.getItem('adminPassword');
        if (savedPassword) {
            setPassword(savedPassword);
            setAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        if (authenticated) {
            fetchComments();
        }
    }, [authenticated, filter]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const url = filter === 'all' ? '/api/admin/comments' : `/api/admin/comments?type=${filter}`;
            const res = await fetch(url, {
                headers: { 'x-admin-password': password },
            });

            if (res.ok) {
                const data = await res.json();
                setComments(data);
            } else if (res.status === 401) {
                setAuthenticated(false);
                localStorage.removeItem('adminPassword');
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('adminPassword', password);
        setAuthenticated(true);
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/comments?id=${id}`, {
                method: 'DELETE',
                headers: { 'x-admin-password': password },
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

    if (!authenticated) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="bg-gray-800 border-2 border-gray-700 p-8 w-full max-w-md">
                    <h1 className="text-2xl font-bold text-white mb-6">Yorum Yönetimi</h1>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Admin Şifresi"
                        className="w-full p-3 bg-gray-700 text-white border border-gray-600 mb-4"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 font-bold hover:bg-blue-700"
                    >
                        Giriş
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border-4 border-black shadow-neo p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-black text-black uppercase">Yorum Yönetimi</h1>
                <div className="flex gap-2 flex-wrap">
                    {(['all', 'project', 'gallery', 'announcement'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 font-bold border-2 border-black transition-all ${filter === f ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                                }`}
                        >
                            {f === 'all' ? 'Tümü' : getTypeLabel(f)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Comments List */}
            <div className="bg-white border-4 border-black shadow-neo">
                {loading ? (
                    <div className="p-12 text-center text-gray-500 font-bold">Yükleniyor...</div>
                ) : comments.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 font-bold">Yorum bulunamadı</div>
                ) : (
                    <ul className="divide-y-4 divide-black">
                        {comments.map((comment) => (
                            <li key={comment._id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        {/* Meta */}
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className={`px-2 py-1 text-xs font-black uppercase border-2 border-black ${getTypeColor(comment.contentType)}`}>
                                                {getTypeLabel(comment.contentType)}
                                            </span>
                                            <span className="text-sm font-bold text-gray-700">
                                                {comment.contentTitle}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <p className="text-black font-medium mb-2">{comment.content}</p>

                                        {/* Author & Date */}
                                        <div className="text-sm text-gray-500">
                                            <span className="font-bold">
                                                {comment.author.nickname || comment.author.fullName}
                                            </span>
                                            <span className="mx-2">•</span>
                                            <span>{comment.author.studentNo}</span>
                                            <span className="mx-2">•</span>
                                            <span>{formatDate(comment.createdAt)}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex-shrink-0">
                                        <button
                                            onClick={() => setDeleteModalId(comment._id)}
                                            className="px-4 py-2 bg-red-500 text-white font-bold border-2 border-black hover:bg-red-600 transition-all"
                                        >
                                            Sil
                                        </button>
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
                        <h3 className="text-xl font-black text-black mb-4">⚠️ Yorumu Sil</h3>
                        <p className="text-gray-700 mb-6">
                            Bu yorumu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
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
        </div>
    );
}
