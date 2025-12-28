'use client';

import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';

interface TurnstileProps {
    onVerify: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
    className?: string;
}

export interface TurnstileRef {
    reset: () => void;
}

declare global {
    interface Window {
        turnstile: {
            render: (container: HTMLElement, options: {
                sitekey: string;
                callback: (token: string) => void;
                'error-callback'?: () => void;
                'expired-callback'?: () => void;
                theme?: 'light' | 'dark' | 'auto';
                language?: string;
            }) => string;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
        };
        onloadTurnstileCallback?: () => void;
    }
}

const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(({ onVerify, onError, onExpire, className }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const scriptLoadedRef = useRef(false);

    const renderWidget = useCallback(() => {
        if (!containerRef.current || widgetIdRef.current) return;

        const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
        if (!siteKey) {
            console.error('Turnstile site key is not configured');
            return;
        }

        try {
            widgetIdRef.current = window.turnstile.render(containerRef.current, {
                sitekey: siteKey,
                callback: onVerify,
                'error-callback': onError,
                'expired-callback': onExpire,
                theme: 'light',
            });
        } catch (error) {
            console.error('Turnstile render error:', error);
        }
    }, [onVerify, onError, onExpire]);

    // Expose reset method to parent components
    useImperativeHandle(ref, () => ({
        reset: () => {
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.reset(widgetIdRef.current);
                } catch (e) {
                    console.error('Failed to reset Turnstile widget:', e);
                }
            }
        }
    }), []);

    useEffect(() => {
        // If script is already loaded, render immediately
        if (window.turnstile) {
            renderWidget();
            return;
        }

        // If script is loading, wait for callback
        if (scriptLoadedRef.current) return;

        // Load the Turnstile script
        scriptLoadedRef.current = true;

        window.onloadTurnstileCallback = () => {
            renderWidget();
        };

        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        return () => {
            // Cleanup widget on unmount
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                } catch (e) {
                    // Widget might already be removed
                }
                widgetIdRef.current = null;
            }
        };
    }, [renderWidget]);

    return <div ref={containerRef} className={className} />;
});

Turnstile.displayName = 'Turnstile';

export default Turnstile;

