"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

interface LikeButtonProps {
    contentType: 'announcement' | 'gallery' | 'project' | 'comment';
    contentId: string;
    initialCount?: number;
    initialLiked?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showCount?: boolean;
}

export default function LikeButton({
    contentType,
    contentId,
    initialCount = 0,
    initialLiked = false,
    size = 'md',
    showCount = true,
}: LikeButtonProps) {
    const router = useRouter();
    const [count, setCount] = useState(initialCount);
    const [hasLiked, setHasLiked] = useState(initialLiked);
    const [isLoading, setIsLoading] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Fetch initial state
    useEffect(() => {
        async function fetchLikeStatus() {
            try {
                const res = await fetch(`/api/likes?contentType=${contentType}&contentId=${contentId}`);
                if (res.ok) {
                    const data = await res.json();
                    setCount(data.count);
                    setHasLiked(data.hasLiked);
                }
            } catch (error) {
                console.error("Like status fetch error:", error);
            }
        }
        fetchLikeStatus();
    }, [contentType, contentId]);

    const handleLike = async () => {
        if (isLoading) return;

        setIsLoading(true);
        setIsAnimating(true);

        // Optimistic update
        const wasLiked = hasLiked;
        setHasLiked(!hasLiked);
        setCount(prev => wasLiked ? prev - 1 : prev + 1);

        try {
            const res = await fetch('/api/likes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contentType, contentId }),
            });

            if (res.status === 401) {
                // Revert optimistic update
                setHasLiked(wasLiked);
                setCount(prev => wasLiked ? prev + 1 : prev - 1);
                // Show login prompt or redirect
                router.push(`/auth/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setCount(data.count);
                setHasLiked(data.hasLiked);
            } else {
                // Revert on error
                setHasLiked(wasLiked);
                setCount(prev => wasLiked ? prev + 1 : prev - 1);
            }
        } catch (error) {
            // Revert on error
            setHasLiked(wasLiked);
            setCount(prev => wasLiked ? prev + 1 : prev - 1);
            console.error("Like error:", error);
        } finally {
            setIsLoading(false);
            setTimeout(() => setIsAnimating(false), 300);
        }
    };

    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-9 h-9',
        lg: 'w-12 h-12',
    };

    const textSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    return (
        <button
            onClick={handleLike}
            disabled={isLoading}
            className={`flex items-center gap-1.5 group transition-all !border-none !shadow-none !bg-transparent hover:!bg-transparent active:!translate-x-0 active:!translate-y-0 ${isLoading ? 'opacity-50' : ''}`}
            aria-label={hasLiked ? 'Unlike' : 'Like'}
        >
            <Heart
                className={`
                    ${sizeClasses[size]}
                    transition-all duration-200
                    ${hasLiked
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400 group-hover:text-red-400'
                    }
                    ${isAnimating ? 'scale-125' : 'scale-100'}
                `}
            />
            {showCount && count > 0 && (
                <span className={`${textSizes[size]} font-bold ${hasLiked ? 'text-red-500' : 'text-gray-500'}`}>
                    {count}
                </span>
            )}
        </button>
    );
}
