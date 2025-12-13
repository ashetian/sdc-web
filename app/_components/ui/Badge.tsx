'use client';

import { ReactNode, HTMLAttributes } from 'react';

// ========== Badge ==========
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
}

const variantStyles = {
    default: 'bg-gray-200 text-gray-800 border-gray-400',
    success: 'bg-neo-green text-black border-black',
    warning: 'bg-neo-yellow text-black border-black',
    danger: 'bg-red-100 text-red-700 border-red-300',
    info: 'bg-neo-blue text-black border-black',
    purple: 'bg-neo-purple text-white border-black',
};

const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
};

export function Badge({
    variant = 'default',
    size = 'md',
    children,
    className = '',
    ...props
}: BadgeProps) {
    return (
        <span
            className={`
                inline-flex items-center font-bold uppercase
                border-2 ${variantStyles[variant]} ${sizeStyles[size]}
                ${className}
            `.trim()}
            {...props}
        >
            {children}
        </span>
    );
}

// ========== Tag (Close button ile) ==========
export interface TagProps {
    children: ReactNode;
    onRemove?: () => void;
    color?: 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const tagColors = {
    default: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
};

export function Tag({ children, onRemove, color = 'default' }: TagProps) {
    return (
        <span
            className={`
                inline-flex items-center gap-1 px-2 py-1 
                text-xs font-bold border border-current
                ${tagColors[color]}
            `}
        >
            {children}
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="hover:bg-black/10 rounded-full p-0.5"
                    aria-label="Kaldır"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </span>
    );
}

// ========== Alert ==========
export interface AlertProps {
    variant?: 'info' | 'success' | 'warning' | 'danger';
    title?: string;
    children: ReactNode;
    onClose?: () => void;
}

const alertStyles = {
    info: 'bg-blue-50 border-blue-500 text-blue-700',
    success: 'bg-green-50 border-neo-green text-green-700',
    warning: 'bg-yellow-50 border-neo-yellow text-yellow-700',
    danger: 'bg-red-50 border-red-500 text-red-700',
};

const alertIcons = {
    info: '💡',
    success: '✅',
    warning: '⚠️',
    danger: '❌',
};

export function Alert({ variant = 'info', title, children, onClose }: AlertProps) {
    return (
        <div
            className={`
                border-l-4 p-4 ${alertStyles[variant]}
                relative
            `}
            role="alert"
        >
            <div className="flex gap-2">
                <span className="text-lg">{alertIcons[variant]}</span>
                <div className="flex-1">
                    {title && <p className="font-black uppercase mb-1">{title}</p>}
                    <div className="text-sm">{children}</div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="self-start hover:opacity-70">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}

// ========== Empty State ==========
export interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            {icon && <div className="text-gray-400 mb-4">{icon}</div>}
            <h3 className="text-lg font-black text-gray-700 uppercase mb-2">{title}</h3>
            {description && <p className="text-sm text-gray-500 mb-4 max-w-md">{description}</p>}
            {action}
        </div>
    );
}

// ========== Divider ==========
export interface DividerProps {
    label?: string;
}

export function Divider({ label }: DividerProps) {
    if (label) {
        return (
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-black" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-sm font-bold uppercase text-gray-500">
                        {label}
                    </span>
                </div>
            </div>
        );
    }

    return <hr className="my-6 border-t-2 border-black" />;
}

// ========== Avatar ==========
export interface AvatarProps {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const avatarSizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
};

export function Avatar({ src, alt = 'Avatar', fallback, size = 'md' }: AvatarProps) {
    const initials = fallback?.slice(0, 2).toUpperCase() || '?';

    return (
        <div
            className={`
                ${avatarSizes[size]}
                rounded-full border-2 border-black overflow-hidden
                bg-gray-200 flex items-center justify-center font-bold
            `}
        >
            {src ? (
                <img src={src} alt={alt} className="w-full h-full object-cover" />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );
}

// ========== Tooltip ==========
export interface TooltipProps {
    content: string;
    children: ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
    const positionStyles = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div className="relative group inline-block">
            {children}
            <div
                className={`
                    absolute ${positionStyles[position]} z-50
                    px-2 py-1 bg-black text-white text-xs font-bold
                    opacity-0 group-hover:opacity-100 transition-opacity
                    pointer-events-none whitespace-nowrap
                `}
            >
                {content}
            </div>
        </div>
    );
}
