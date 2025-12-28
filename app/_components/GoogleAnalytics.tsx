'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

interface GoogleAnalyticsProps {
    measurementId: string;
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
    const pathname = usePathname();

    // Don't track admin panel
    if (!measurementId || pathname?.startsWith('/admin')) return null;

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${measurementId}', {
                        page_path: window.location.pathname,
                    });
                `}
            </Script>
        </>
    );
}
