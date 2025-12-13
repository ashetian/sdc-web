'use client';

import { ReactNode, HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'outlined' | 'highlighted';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    children: ReactNode;
    header?: ReactNode;
    footer?: ReactNode;
}

const variantStyles = {
    default: 'bg-white border-4 border-black shadow-neo',
    elevated: 'bg-white border-4 border-black shadow-neo-lg',
    outlined: 'bg-white border-2 border-black',
    highlighted: 'bg-neo-yellow border-4 border-black shadow-neo',
};

const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
};

export function Card({
    variant = 'default',
    padding = 'md',
    children,
    header,
    footer,
    className = '',
    ...props
}: CardProps) {
    return (
        <div
            className={`
                ${variantStyles[variant]}
                ${className}
            `.trim()}
            {...props}
        >
            {header && (
                <div className="border-b-2 border-black p-4 font-black uppercase">
                    {header}
                </div>
            )}
            <div className={paddingStyles[padding]}>
                {children}
            </div>
            {footer && (
                <div className="border-t-2 border-black p-4">
                    {footer}
                </div>
            )}
        </div>
    );
}

// Alt bileşenler
export function CardHeader({
    children,
    className = ''
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={`font-black text-lg uppercase ${className}`}>
            {children}
        </div>
    );
}

export function CardDescription({
    children,
    className = ''
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <p className={`text-sm text-gray-600 font-medium ${className}`}>
            {children}
        </p>
    );
}
