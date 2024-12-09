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
  title: "KTU Software Development Club",
  description:
    "KTU SDC"
,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`${inter.variable} font-sans overflow-x-hidden`}>
        <Navbar/>
        {children}
        <Footer/>
        <ScrollToTop />
      </body>
    </html>
  );
}