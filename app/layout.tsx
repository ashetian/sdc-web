"use client";
import "./globals.css";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import ScrollToTop from "./_components/ScrollToTop";
import CustomCursor from "./_components/CustomCursor";
import { LanguageProvider, useLanguage } from "./_context/LanguageContext";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Inner component that can access language context
function LayoutInner({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();

  return (
    <html lang={language} className="overflow-x-hidden">
      <body className={`${inter.variable} font-sans overflow-x-hidden`}>
        <Navbar />
        <CustomCursor />
        {children}
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <LayoutInner>{children}</LayoutInner>
    </LanguageProvider>
  );
}
