'use client';

import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useLanguage } from '../_context/LanguageContext';

interface BookmarkButtonProps {
    contentType: 'event' | 'project' | 'announcement' | 'gallery' | 'comment';
    contentId: string;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export default function BookmarkButton({
    contentType,
    contentId,
    size = 'md',
    showLabel = false,
}: BookmarkButtonProps) {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const { language } = useLanguage();

    const labels = {
        tr: {
            save: 'Kaydet',
            saved: 'Kaydedildi',
            removeFromSaved: 'Kayıtlılardan kaldır',
            loginRequired: 'Kaydetmek için giriş yapmalısınız'
        },
        en: {
            save: 'Save',
            saved: 'Saved',
            removeFromSaved: 'Remove from saved',
            loginRequired: 'You must log in to save'
        }
    };

    const l = labels[language];

    const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24;
    const buttonPadding = size === 'sm' ? 'p-1.5' : size === 'md' ? 'p-2' : 'p-3';

    // Check bookmark status on mount
    useEffect(() => {
        const checkBookmark = async () => {
            try {
                const res = await fetch(
                    `/api/bookmarks/check?contentType=${contentType}&contentId=${contentId}`
                );
                if (res.ok) {
                    const data = await res.json();
                    setIsBookmarked(data.isBookmarked);
                }
            } catch (error) {
                console.error('Check bookmark error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkBookmark();
    }, [contentType, contentId]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isProcessing) return;

        setIsProcessing(true);

        try {
            if (isBookmarked) {
                // Remove bookmark
                const res = await fetch(
                    `/api/bookmarks/check?contentType=${contentType}&contentId=${contentId}`,
                    { method: 'DELETE' }
                );
                if (res.ok) {
                    setIsBookmarked(false);
                }
            } else {
                // Add bookmark
                const res = await fetch('/api/bookmarks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contentType, contentId }),
                });
                if (res.ok) {
                    setIsBookmarked(true);
                } else if (res.status === 401) {
                    // Not logged in - could redirect to login
                    alert(l.loginRequired);
                }
            }
        } catch (error) {
            console.error('Toggle bookmark error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <button
                disabled
                className={`${buttonPadding} border-2 border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed`}
            >
                <Bookmark size={iconSize} className="text-gray-400" />
            </button>
        );
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isProcessing}
            className={`${buttonPadding} border-2 border-black transition-all ${isBookmarked
                ? 'bg-neo-yellow hover:bg-yellow-300'
                : 'bg-white hover:bg-gray-100'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-neo'}`}
            title={isBookmarked ? l.removeFromSaved : l.save}
        >
            <div className="flex items-center gap-2">
                {isBookmarked ? (
                    <BookmarkCheck size={iconSize} className="text-black" />
                ) : (
                    <Bookmark size={iconSize} className="text-black" />
                )}
                {showLabel && (
                    <span className="font-bold text-sm">
                        {isBookmarked ? l.saved : l.save}
                    </span>
                )}
            </div>
        </button>
    );
}
