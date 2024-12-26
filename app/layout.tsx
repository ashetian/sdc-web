import "./globals.css";
import Navbar from './_components/Navbar';
import Footer from './_components/Footer';
import ScrollToTop from './_components/ScrollToTop';
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})


export const metadata = {
  title: "KTU Software Development Club | Yazılım Geliştirme Topluluğu",
  description: "Karadeniz Teknik Üniversitesi Yazılım Geliştirme Topluluğu (KTU SDC), öğrencilerin yazılım geliştirme becerilerini geliştirmelerine yardımcı olan, workshop'lar, etkinlikler ve projeler düzenleyen bir öğrenci topluluğudur.",
  keywords: "KTU, SDC, yazılım geliştirme, software development, Karadeniz Teknik Üniversitesi, öğrenci topluluğu, programlama, coding, workshop, hackathon, Trabzon",
  authors: [{ name: "KTU Software Development Club" }],
  creator: "KTU Software Development Club",
  publisher: "KTU Software Development Club",
  openGraph: {
    title: "KTU Software Development Club | Yazılım Geliştirme Topluluğu",
    description: "Karadeniz Teknik Üniversitesi Yazılım Geliştirme Topluluğu (KTU SDC), öğrencilerin yazılım geliştirme becerilerini geliştirmelerine yardımcı olan bir öğrenci topluluğudur.",
    url: "https://ktusdc.com",
    siteName: "KTU Software Development Club",
    locale: "tr_TR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://ktusdc.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="overflow-x-hidden">
      <body className={`${inter.variable} font-sans overflow-x-hidden`}>
        <Navbar/>
        {children}
        <Footer/>
        <ScrollToTop />
      </body>
    </html>
  );
}