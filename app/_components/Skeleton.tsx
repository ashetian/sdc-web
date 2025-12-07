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
export function SkeletonCard({ className = "" }: { className?: string }) {
    return (
        <div className={`bg-white border-4 border-gray-200 p-6 ${className}`}>
            <Skeleton variant="rectangular" height={160} className="mb-4" />
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
 * Full page skeleton with header and content
 */
export function SkeletonPage({ type = 'list' }: { type?: 'list' | 'cards' | 'table' | 'menu' }) {
    return (
        <div className="space-y-8 animate-pulse">
            <SkeletonPageHeader />
            {type === 'list' && <SkeletonList items={5} />}
            {type === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            )}
            {type === 'table' && <SkeletonTable rows={8} cols={5} />}
            {type === 'menu' && <SkeletonAdminMenu items={8} />}
        </div>
    );
}

export default Skeleton;
