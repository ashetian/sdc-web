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
    default: 'KTÜ Yazılım Geliştirme Kulübü | Software Development Club',
    template: '%s | KTÜ Yazılım Geliştirme Kulübü',
  },
  description: 'KTÜ Yazılım Geliştirme Kulübü (SDC) - Karadeniz Teknik Üniversitesi\'nin resmi yazılım ve programlama topluluğu. Etkinlikler, workshoplar, projeler ve daha fazlası.',
  keywords: [
    'KTÜ Yazılım Geliştirme Kulübü',
    'SDC',
    'Software Development Club',
    'KTÜ',
    'Karadeniz Teknik Üniversitesi',
    'yazılım kulübü',
    'programlama kulübü',
    'öğrenci topluluğu',
    'yazılım geliştirme',
    'kodlama',
    'Trabzon',
    'üniversite kulübü'
  ],
  authors: [{ name: 'KTÜ Yazılım Geliştirme Kulübü' }],
  creator: 'KTÜ Yazılım Geliştirme Kulübü',
  publisher: 'KTÜ Yazılım Geliştirme Kulübü',
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
    siteName: 'KTÜ Yazılım Geliştirme Kulübü',
    title: 'KTÜ Yazılım Geliştirme Kulübü | Software Development Club',
    description: 'Karadeniz Teknik Üniversitesi\'nin resmi yazılım ve programlama topluluğu. Etkinlikler, workshoplar ve projeler.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KTÜ Yazılım Geliştirme Kulübü',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KTÜ Yazılım Geliştirme Kulübü',
    description: 'Karadeniz Teknik Üniversitesi\'nin resmi yazılım ve programlama topluluğu.',
    images: ['/og-image.png'],
    creator: '@ktusdc',
  },
  verification: {
    google: 'google-site-verification-code', // Replace with actual code from Google Search Console
  },
  alternates: {
    canonical: 'https://ktusdc.com',
    languages: {
      'tr-TR': 'https://ktusdc.com',
      'en-US': 'https://ktusdc.com',
    },
  },
  category: 'education',
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://ktusdc.com/#organization',
      name: 'KTÜ Yazılım Geliştirme Kulübü',
      alternateName: ['SDC', 'Software Development Club', 'KTÜ SDC'],
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
        availableLanguage: ['Turkish', 'English'],
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Trabzon',
        addressCountry: 'TR',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://ktusdc.com/#website',
      url: 'https://ktusdc.com',
      name: 'KTÜ Yazılım Geliştirme Kulübü',
      alternateName: 'SDC - Software Development Club',
      publisher: {
        '@id': 'https://ktusdc.com/#organization',
      },
      inLanguage: ['tr-TR', 'en-US'],
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://ktusdc.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'EducationalOrganization',
      '@id': 'https://ktusdc.com/#educational',
      name: 'KTÜ Yazılım Geliştirme Kulübü',
      description: 'Karadeniz Teknik Üniversitesi bünyesinde faaliyet gösteren resmi yazılım geliştirme kulübü',
      parentOrganization: {
        '@type': 'CollegeOrUniversity',
        name: 'Karadeniz Teknik Üniversitesi',
        alternateName: 'KTÜ',
        url: 'https://www.ktu.edu.tr',
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
