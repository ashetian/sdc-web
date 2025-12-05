"use client";

import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import CustomCursor from "./CustomCursor";
import { LanguageProvider } from "../_context/LanguageContext";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <LanguageProvider>
            <Navbar />
            <CustomCursor />
            {children}
            <Footer />
            <ScrollToTop />
        </LanguageProvider>
    );
}
