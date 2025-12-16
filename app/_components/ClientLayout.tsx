"use client";

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
    return (
        <LanguageProvider>
            <ToastProvider>
                <Navbar />
                <CustomCursor />
                <ErrorBoundary>
                    {children}
                </ErrorBoundary>
                <Footer />
                <ScrollToTop />
                <CookieConsent />
            </ToastProvider>
        </LanguageProvider>
    );
}

