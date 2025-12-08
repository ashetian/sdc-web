"use client";

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
    animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Base Skeleton component for loading states
 */
export function Skeleton({
    className = "",
    variant = 'text',
    width,
    height,
    animation = 'pulse',
}: SkeletonProps) {
    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: '',
        rounded: 'rounded-lg',
    };

    const animationClasses = {
        pulse: 'animate-pulse',
        wave: 'animate-shimmer',
        none: '',
    };

    const style: React.CSSProperties = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1em' : undefined),
    };

    return (
        <div
            className={`bg-gray-200 ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
            style={style}
        />
    );
}

/**
 * Skeleton for text lines
 */
export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    variant="text"
                    width={i === lines - 1 ? '60%' : '100%'}
                    height="0.875rem"
                />
            ))}
        </div>
    );
}

/**
 * Skeleton for cards
 */
export function SkeletonCard({ className = "", showImage = true }: { className?: string; showImage?: boolean }) {
    return (
        <div className={`bg-white border-4 border-gray-200 p-6 ${className}`}>
            {showImage && <Skeleton variant="rectangular" height={160} className="mb-4" />}
            <Skeleton variant="text" width="70%" height="1.5rem" className="mb-2" />
            <SkeletonText lines={2} />
        </div>
    );
}

/**
 * Skeleton for avatar with text
 */
export function SkeletonAvatar({ size = 40, withText = false }: { size?: number; withText?: boolean }) {
    return (
        <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={size} height={size} />
            {withText && (
                <div className="flex-1">
                    <Skeleton variant="text" width="60%" height="1rem" className="mb-1" />
                    <Skeleton variant="text" width="40%" height="0.75rem" />
                </div>
            )}
        </div>
    );
}

/**
 * Skeleton for list items
 */
export function SkeletonList({ items = 5, className = "" }: { items?: number; className?: string }) {
    return (
        <div className={`space-y-4 ${className}`}>
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white border-4 border-gray-200">
                    <Skeleton variant="circular" width={48} height={48} />
                    <div className="flex-1">
                        <Skeleton variant="text" width="50%" height="1rem" className="mb-2" />
                        <Skeleton variant="text" width="80%" height="0.75rem" />
                    </div>
                    <Skeleton variant="rounded" width={80} height={32} />
                </div>
            ))}
        </div>
    );
}

/**
 * Skeleton for table rows
 */
export function SkeletonTable({ rows = 5, cols = 4, className = "" }: { rows?: number; cols?: number; className?: string }) {
    return (
        <div className={`bg-white border-4 border-gray-200 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="flex gap-4 p-4 bg-gray-50 border-b-2 border-gray-200">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} variant="text" width="100%" height="1rem" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex gap-4 p-4 border-b border-gray-100">
                    {Array.from({ length: cols }).map((_, colIdx) => (
                        <Skeleton key={colIdx} variant="text" width="100%" height="0.875rem" />
                    ))}
                </div>
            ))}
        </div>
    );
}

/**
 * Skeleton for admin dashboard menu
 */
export function SkeletonAdminMenu({ items = 6 }: { items?: number }) {
    return (
        <div className="flex flex-col gap-4 max-w-3xl mx-auto">
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="flex items-center gap-6 p-6 bg-white border-4 border-gray-200">
                    <Skeleton variant="circular" width={48} height={48} />
                    <div className="flex-1">
                        <Skeleton variant="text" width="40%" height="1.25rem" className="mb-2" />
                        <Skeleton variant="text" width="70%" height="0.875rem" />
                    </div>
                    <Skeleton variant="circular" width={24} height={24} />
                </div>
            ))}
        </div>
    );
}

/**
 * Skeleton for page header
 */
export function SkeletonPageHeader() {
    return (
        <div className="bg-white border-4 border-gray-200 p-8 mb-8">
            <Skeleton variant="text" width="40%" height="2rem" className="mb-2" />
            <Skeleton variant="text" width="60%" height="1rem" />
        </div>
    );
}

/**
 * Skeleton for forms
 */
export function SkeletonForm({ fields = 5, className = "" }: { fields?: number; className?: string }) {
    return (
        <div className={`bg-white border-4 border-gray-200 p-6 space-y-6 ${className}`}>
            {Array.from({ length: fields }).map((_, i) => (
                <div key={i}>
                    <Skeleton variant="text" width="30%" height="0.875rem" className="mb-2" />
                    <Skeleton variant="rounded" width="100%" height={44} />
                </div>
            ))}
            <Skeleton variant="rounded" width="100%" height={48} className="mt-4" />
        </div>
    );
}

/**
 * Skeleton for notifications
 */
export function SkeletonNotifications({ items = 5, className = "" }: { items?: number; className?: string }) {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-white border-2 border-gray-200">
                    <Skeleton variant="circular" width={40} height={40} />
                    <div className="flex-1">
                        <Skeleton variant="text" width="70%" height="1rem" className="mb-2" />
                        <Skeleton variant="text" width="90%" height="0.75rem" className="mb-1" />
                        <Skeleton variant="text" width="30%" height="0.625rem" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Skeleton for calendar
 */
export function SkeletonCalendar({ className = "" }: { className?: string }) {
    return (
        <div className={`bg-white border-4 border-gray-200 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-gray-100 border-b-4 border-gray-200">
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width={200} height="1.5rem" />
                <Skeleton variant="circular" width={40} height={40} />
            </div>
            {/* Days header */}
            <div className="grid grid-cols-7 gap-0 border-b-2 border-gray-200">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="p-3 text-center border-r border-gray-200 last:border-r-0">
                        <Skeleton variant="text" width="100%" height="1rem" />
                    </div>
                ))}
            </div>
            {/* Calendar grid */}
            {Array.from({ length: 5 }).map((_, weekIdx) => (
                <div key={weekIdx} className="grid grid-cols-7 gap-0 border-b border-gray-100">
                    {Array.from({ length: 7 }).map((_, dayIdx) => (
                        <div key={dayIdx} className="p-2 h-24 border-r border-gray-100 last:border-r-0">
                            <Skeleton variant="text" width={24} height={24} className="mb-2" />
                            {dayIdx % 3 === 0 && <Skeleton variant="rounded" width="90%" height={20} />}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

/**
 * Skeleton for stats/dashboard cards
 */
export function SkeletonStats({ cards = 4, className = "" }: { cards?: number; className?: string }) {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
            {Array.from({ length: cards }).map((_, i) => (
                <div key={i} className="bg-white border-4 border-gray-200 p-6">
                    <Skeleton variant="text" width="50%" height="0.875rem" className="mb-4" />
                    <Skeleton variant="text" width="60%" height="2.5rem" className="mb-2" />
                    <Skeleton variant="text" width="40%" height="0.75rem" />
                </div>
            ))}
        </div>
    );
}

/**
 * Skeleton for gallery/image grid
 */
export function SkeletonGallery({ items = 6, className = "" }: { items?: number; className?: string }) {
    return (
        <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="bg-white border-4 border-gray-200 aspect-square">
                    <Skeleton variant="rectangular" width="100%" height="100%" />
                </div>
            ))}
        </div>
    );
}

/**
 * Skeleton for cards grid
 */
export function SkeletonCardGrid({ items = 6, cols = 3, className = "" }: { items?: number; cols?: number; className?: string }) {
    const colsClass = {
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-2 lg:grid-cols-3',
        4: 'md:grid-cols-2 lg:grid-cols-4',
    }[cols] || 'md:grid-cols-2 lg:grid-cols-3';

    return (
        <div className={`grid grid-cols-1 ${colsClass} gap-6 ${className}`}>
            {Array.from({ length: items }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}

/**
 * Full page skeleton with header and content
 */
export function SkeletonPage({ type = 'list' }: { type?: 'list' | 'cards' | 'table' | 'menu' | 'form' | 'calendar' | 'stats' }) {
    return (
        <div className="space-y-8 animate-pulse">
            <SkeletonPageHeader />
            {type === 'list' && <SkeletonList items={5} />}
            {type === 'cards' && <SkeletonCardGrid items={6} />}
            {type === 'table' && <SkeletonTable rows={8} cols={5} />}
            {type === 'menu' && <SkeletonAdminMenu items={8} />}
            {type === 'form' && <SkeletonForm fields={6} />}
            {type === 'calendar' && <SkeletonCalendar />}
            {type === 'stats' && (
                <>
                    <SkeletonStats cards={4} />
                    <SkeletonTable rows={5} cols={4} />
                </>
            )}
        </div>
    );
}

/**
 * Full screen skeleton wrapper for public pages
 */
export function SkeletonFullPage({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`min-h-screen bg-neo-yellow pt-32 pb-20 px-4 sm:px-6 lg:px-8 ${className}`}>
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </div>
    );
}

export default Skeleton;

