import localFont from "next/font/local";
import "./globals.css";
import Navbar from './_components/Navbar';
import Footer from './_components/Footer';
import ScrollToTop from './_components/ScrollToTop';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Navbar/>
        {children}
        <Footer/>
        <ScrollToTop/>
      </body>
    </html>
  );
}