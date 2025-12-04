import "./globals.css";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import ScrollToTop from "./_components/ScrollToTop";
import CustomCursor from "./_components/CustomCursor";
import { LanguageProvider } from "./_context/LanguageContext";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "KTÜ Yazılım Geliştirme Kulübü | Software Development Club",
  description:
    "KTÜ Yazılım Geliştirme Kulübü (KTÜ SDC), Karadeniz Teknik Üniversitesi'nde yazılım, teknoloji ve inovasyon odaklı etkinlikler, atölyeler ve projeler düzenleyen aktif bir öğrenci topluluğudur.",
  keywords:
    "KTÜ, SDC, yazılım kulübü, yazılım geliştirme, software development, Karadeniz Teknik Üniversitesi",
  authors: [
    { name: "KTÜ Yazılım Geliştirme Kulübü", url: "https://ktusdc.com" },
  ],
  creator: "KTÜ Yazılım Geliştirme Kulübü",
  publisher: "KTÜ Yazılım Geliştirme Kulübü",
  openGraph: {
    title: "KTÜ Yazılım Geliştirme Kulübü | KTÜ SDC",
    description: "KTÜ SDC, yazılım ve teknolojiye ilgi duyan öğrencileri bir araya getiren bir topluluktur.",
    url: "https://ktusdc.com",
    siteName: "KTÜ Yazılım Geliştirme Kulübü",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "https://ktusdc.com/sdclogo.jpg",
        width: 1200,
        height: 630,
        alt: "KTÜ Yazılım Geliştirme Kulübü Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ktusdc",
    title: "KTÜ Yazılım Geliştirme Kulübü | KTÜ SDC",
    description: "KTÜ SDC, yazılım ve teknolojiye ilgi duyan öğrencileri bir araya getiren bir topluluktur.",
    images: ["https://ktusdc.com/sdclogo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      maxSnippet: -1,
      maxImagePreview: "large" as const,
      maxVideoPreview: -1,
    },
  },
  alternates: {
    canonical: "https://ktusdc.com",
  },
  metadataBase: new URL("https://ktusdc.com"),
  category: "Education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="overflow-x-hidden">
      <body className={`${inter.variable} font-sans overflow-x-hidden`}>
        <LanguageProvider>
          <Navbar />
          <CustomCursor />
          {children}
          <Footer />
          <ScrollToTop />
        </LanguageProvider>
      </body>
    </html>
  );
}
