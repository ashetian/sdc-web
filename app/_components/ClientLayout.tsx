"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import CustomCursor from "./CustomCursor";
import ErrorBoundary from "./ErrorBoundary";
import CookieConsent from "./CookieConsent";
import { LanguageProvider } from "../_context/LanguageContext";
import { ToastProvider } from "../_context/ToastContext";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Pages that should have standalone layout (no navbar/footer)
    const isStandalonePage = pathname?.startsWith('/media-kit');

    return (
        <LanguageProvider>
            <ToastProvider>
                {!isStandalonePage && <Navbar />}
                <CustomCursor />
                <ErrorBoundary>
                    {children}
                </ErrorBoundary>
                {!isStandalonePage && <Footer />}
                {!isStandalonePage && <ScrollToTop />}
                {!isStandalonePage && <CookieConsent />}
            </ToastProvider>
        </LanguageProvider>
    );
}
