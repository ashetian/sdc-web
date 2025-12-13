'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bookmark, Trash2, ArrowLeft, Calendar, FileText, Image, MessageSquare, FolderGit2 } from 'lucide-react';
import { SkeletonList, SkeletonPageHeader, SkeletonFullPage, SkeletonCardGrid } from '@/app/_components/Skeleton';
import { useLanguage } from '../../_context/LanguageContext';
import { Button } from '../../_components/ui';

interface BookmarkItem {
    _id: string;
    contentType: 'event' | 'project' | 'announcement' | 'gallery' | 'comment';
    contentId: string;
    contentTitle: string;
    contentUrl: string;
    createdAt: string;
}



export default function BookmarksPage() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [deleting, setDeleting] = useState<string | null>(null);

    const CONTENT_TYPE_LABELS = {
        event: { label: t('profile.bookmarks.types.event'), icon: Calendar, color: 'bg-neo-purple text-white' },
        project: { label: t('profile.bookmarks.types.project'), icon: FolderGit2, color: 'bg-neo-green text-black' },
        announcement: { label: t('profile.bookmarks.types.announcement'), icon: FileText, color: 'bg-neo-blue text-black' },
        gallery: { label: t('profile.bookmarks.types.gallery'), icon: Image, color: 'bg-neo-yellow text-black' },
        comment: { label: t('profile.bookmarks.types.comment'), icon: MessageSquare, color: 'bg-gray-200 text-black' },
    };

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => {
                if (!res.ok) throw new Error('Not logged in');
                return res.json();
            })
            .then(() => fetchBookmarks())
            .catch(() => {
                router.push('/auth/login?redirect=/profile/bookmarks');
            });
    }, [router]);

    const fetchBookmarks = async () => {
        try {
            const res = await fetch('/api/bookmarks');
            if (res.ok) {
                const data = await res.json();
                setBookmarks(data);
            }
        } catch (error) {
            console.error('Fetch bookmarks error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (bookmarkId: string) => {
        setDeleting(bookmarkId);
        try {
            const res = await fetch(`/api/bookmarks/${bookmarkId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setBookmarks(prev => prev.filter(b => b._id !== bookmarkId));
            }
        } catch (error) {
            console.error('Delete bookmark error:', error);
        } finally {
            setDeleting(null);
        }
    };

    const filteredBookmarks = filter === 'all'
        ? bookmarks
        : bookmarks.filter(b => b.contentType === filter);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <SkeletonList items={5} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-20 pt-40">
            {/* Dotted background */}
            <div
                className="fixed inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#000 2px, transparent 2px)',
                    backgroundSize: '24px 24px',
                }}
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/profile"
                        className="inline-flex items-center gap-2 text-black font-bold hover:underline mb-4"
                    >
                        <ArrowLeft size={20} />
                        {t('profile.bookmarks.backToProfile')}
                    </Link>
                    <h1 className="text-4xl font-black text-black uppercase flex items-center gap-3">
                        <Bookmark size={36} />
                        {t('profile.bookmarks.title')}
                    </h1>
                    <p className="text-gray-600 font-medium mt-2">
                        {t('profile.bookmarks.desc')}
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 border-2 border-black font-bold uppercase text-sm transition-all ${filter === 'all'
                            ? 'bg-black text-white'
                            : 'bg-white text-black hover:shadow-neo'
                            }`}
                    >
                        {t('profile.bookmarks.all')} ({bookmarks.length})
                    </button>
                    {Object.entries(CONTENT_TYPE_LABELS).map(([type, { label }]) => {
                        const count = bookmarks.filter(b => b.contentType === type).length;
                        if (count === 0) return null;
                        return (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-4 py-2 border-2 border-black font-bold uppercase text-sm transition-all ${filter === type
                                    ? 'bg-black text-white'
                                    : 'bg-white text-black hover:shadow-neo'
                                    }`}
                            >
                                {label} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Bookmarks List */}
                {filteredBookmarks.length === 0 ? (
                    <div className="bg-white border-4 border-black shadow-neo p-8 text-center">
                        <Bookmark size={48} className="mx-auto mb-4 text-gray-400" />
                        <p className="text-xl font-bold text-gray-600">
                            {filter === 'all'
                                ? t('profile.bookmarks.noBookmarks')
                                : t('profile.bookmarks.noCategoryBookmarks')}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredBookmarks.map(bookmark => {
                            const typeInfo = CONTENT_TYPE_LABELS[bookmark.contentType as keyof typeof CONTENT_TYPE_LABELS];
                            const Icon = typeInfo.icon;

                            return (
                                <div
                                    key={bookmark._id}
                                    className="bg-white border-4 border-black shadow-neo p-4 flex items-center justify-between gap-4 hover:shadow-neo-lg transition-all"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className={`p-3 border-2 border-black ${typeInfo.color}`}>
                                            <Icon size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={bookmark.contentUrl}
                                                className="font-bold text-black hover:underline block truncate"
                                            >
                                                {bookmark.contentTitle}
                                            </Link>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2 py-0.5 text-xs font-bold uppercase border border-black ${typeInfo.color}`}>
                                                    {typeInfo.label}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {formatDate(bookmark.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleDelete(bookmark._id)}
                                        disabled={deleting === bookmark._id}
                                        variant="danger"
                                        size="sm"
                                        isLoading={deleting === bookmark._id}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}


