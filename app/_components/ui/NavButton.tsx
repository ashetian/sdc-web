'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface NavButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    direction: 'left' | 'right';
    /** Optional size variant, defaults to 'md' */
    size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
};

const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
};

/**
 * Navigation button with neo-brutalist press animation.
 * Used for carousel/slider navigation (left/right).
 * 
 * Features:
 * - shadow-neo → shadow-neo-sm → shadow-none press effect
 * - Smooth translateY animation on hover/active
 * - Hidden on mobile, visible on md+ screens
 */
export const NavButton = forwardRef<HTMLButtonElement, NavButtonProps>(
    ({ direction, size = 'md', className = '', ...props }, ref) => {
        const Icon = direction === 'left' ? ChevronLeft : ChevronRight;

        return (
            <button
                ref={ref}
                className={`
                    hidden md:flex items-center justify-center
                    ${sizeStyles[size]}
                    bg-white border-4 border-black
                    shadow-neo hover:shadow-neo-sm active:shadow-none
                    hover:translate-y-[2px] active:translate-y-[4px]
                    transition-all duration-150
                    font-black z-20
                    ${className}
                `.trim().replace(/\s+/g, ' ')}
                {...props}
            >
                <Icon className={iconSizes[size]} />
            </button>
        );
    }
);

NavButton.displayName = 'NavButton';
