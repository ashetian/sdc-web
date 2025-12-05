import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import ClientLayout from "./_components/ClientLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ktusdc.com'),
  title: {
    default: 'SDC - Software Development Club | KTÜ',
    template: '%s | SDC KTÜ',
  },
  description: 'Karadeniz Teknik Üniversitesi Yazılım Geliştirme Kulübü - Software Development Club. Yazılım geliştirme, programlama, etkinlikler ve daha fazlası.',
  keywords: ['SDC', 'Software Development Club', 'KTÜ', 'Karadeniz Teknik Üniversitesi', 'yazılım', 'programlama', 'kulüp', 'öğrenci topluluğu'],
  authors: [{ name: 'SDC - Software Development Club' }],
  creator: 'SDC KTÜ',
  publisher: 'SDC KTÜ',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    alternateLocale: 'en_US',
    url: 'https://ktusdc.com',
    siteName: 'SDC - Software Development Club',
    title: 'SDC - Software Development Club | KTÜ',
    description: 'Karadeniz Teknik Üniversitesi Yazılım Geliştirme Kulübü',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SDC - Software Development Club',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SDC - Software Development Club | KTÜ',
    description: 'Karadeniz Teknik Üniversitesi Yazılım Geliştirme Kulübü',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'google-site-verification-code', // Replace with actual code
  },
  alternates: {
    canonical: 'https://ktusdc.com',
  },
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://ktusdc.com/#organization',
      name: 'SDC - Software Development Club',
      alternateName: 'KTÜ Yazılım Geliştirme Kulübü',
      url: 'https://ktusdc.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ktusdc.com/sdclogo.png',
        width: 512,
        height: 512,
      },
      sameAs: [
        'https://www.instagram.com/ktusdc',
        'https://www.linkedin.com/company/ktusdc',
        'https://github.com/ktusdc',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'sdc@ktu.edu.tr',
        contactType: 'customer service',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://ktusdc.com/#website',
      url: 'https://ktusdc.com',
      name: 'SDC - Software Development Club',
      publisher: {
        '@id': 'https://ktusdc.com/#organization',
      },
      inLanguage: ['tr', 'en'],
    },
    {
      '@type': 'EducationalOrganization',
      '@id': 'https://ktusdc.com/#educational',
      name: 'SDC - Software Development Club',
      description: 'Karadeniz Teknik Üniversitesi bünyesinde faaliyet gösteren yazılım geliştirme kulübü',
      parentOrganization: {
        '@type': 'CollegeOrUniversity',
        name: 'Karadeniz Teknik Üniversitesi',
        alternateName: 'KTÜ',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="overflow-x-hidden">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans overflow-x-hidden`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
