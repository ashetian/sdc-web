'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'tr' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, fallback?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    tr: {
        // Navbar
        'nav.home': 'Ana Sayfa',
        'nav.about': 'Hakkımızda',
        'nav.team': 'Ekip',
        'nav.events': 'Etkinlikler',
        'nav.announcements': 'Duyurular',
        'nav.gallery': 'Galeri',
        'nav.apply': 'Başvur',
        'nav.contact': 'İletişim',

        // Hero Section
        'hero.title': 'Yazılım Geliştirme Kulübü',
        'hero.subtitle': 'Geleceği birlikte kodluyoruz',
        'hero.cta': 'Bize Katıl',

        // Stats
        'stats.members': 'Üye',
        'stats.events': 'Etkinlik',
        'stats.projects': 'Proje',
        'stats.years': 'Yıl',

        // About Section
        'about.title': 'Hakkımızda',
        'about.subtitle': 'Biz Kimiz?',
        'about.description': 'KTÜ Yazılım Geliştirme Kulübü, yazılım ve teknolojiye ilgi duyan öğrencileri bir araya getiren aktif bir topluluktur.',
        'about.mission': 'Misyonumuz',
        'about.vision': 'Vizyonumuz',

        // Team Section
        'team.title': 'Ekibimiz',
        'team.subtitle': 'SDC Ailesini Tanıyın',
        'team.viewAll': 'Tümünü Gör',

        // Events Section
        'events.title': 'Etkinlikler',
        'events.subtitle': 'Yaklaşan Etkinliklerimiz',
        'events.upcoming': 'Yaklaşan Etkinlikler',
        'events.past': 'Geçmiş Etkinlikler',
        'events.register': 'Kayıt Ol',
        'events.details': 'Detaylar',
        'events.date': 'Tarih',
        'events.location': 'Konum',
        'events.free': 'Ücretsiz',
        'events.paid': 'Ücretli',
        'events.noEvents': 'Henüz etkinlik bulunmuyor',
        'events.calendar': 'Etkinlik Takvimi',
        'events.viewCalendar': 'Takvimi Görüntüle',

        // Announcements
        'announcements.title': 'Duyurular',
        'announcements.subtitle': 'Son Duyurularımız',
        'announcements.readMore': 'Devamını Oku',
        'announcements.noAnnouncements': 'Henüz duyuru bulunmuyor',

        // Apply / Registration
        'apply.title': 'Başvuru',
        'apply.subtitle': 'SDC Ailesine Katıl',
        'apply.description': 'Yazılım dünyasında kendini geliştirmek, projeler üretmek ve harika bir ekibin parçası olmak ister misin?',
        'apply.form.name': 'Ad Soyad',
        'apply.form.email': 'E-posta',
        'apply.form.phone': 'Telefon',
        'apply.form.studentNo': 'Öğrenci Numarası',
        'apply.form.department': 'Departman',
        'apply.form.motivation': 'Motivasyonunuz',
        'apply.form.submit': 'Başvur',
        'apply.form.github': 'GitHub',
        'apply.form.linkedin': 'LinkedIn',
        'apply.success': 'Başvurunuz alındı!',
        'apply.error': 'Bir hata oluştu',

        // Event Registration
        'register.title': 'Etkinlik Kaydı',
        'register.alreadyRegistered': 'Bu etkinliğe zaten kayıtlısınız',
        'register.success': 'Kaydınız başarıyla tamamlandı!',
        'register.paymentInfo': 'Ödeme Bilgileri',
        'register.uploadReceipt': 'Dekont Yükle',
        'register.iban': 'IBAN',
        'register.fee': 'Katılım Ücreti',

        // Contact Section
        'contact.title': 'İletişim',
        'contact.subtitle': 'Bize Ulaşın',
        'contact.email': 'E-posta',
        'contact.address': 'Adres',
        'contact.followUs': 'Bizi Takip Edin',
        'contact.sendMessage': 'Mesaj Gönder',

        // Footer
        'footer.rights': 'Tüm hakları saklıdır.',
        'footer.madeWith': 'ile yapıldı',
        'footer.quickLinks': 'Hızlı Bağlantılar',
        'footer.social': 'Sosyal Medya',
        'footer.privacy': 'Gizlilik Politikası',
        'footer.kvkk': 'KVKK',

        // Common
        'common.loading': 'Yükleniyor...',
        'common.error': 'Bir hata oluştu',
        'common.success': 'Başarılı',
        'common.submit': 'Gönder',
        'common.cancel': 'İptal',
        'common.save': 'Kaydet',
        'common.delete': 'Sil',
        'common.edit': 'Düzenle',
        'common.back': 'Geri',
        'common.next': 'İleri',
        'common.search': 'Ara',
        'common.noResults': 'Sonuç bulunamadı',
        'common.showMore': 'Daha Fazla',
        'common.showLess': 'Daha Az',
        'common.close': 'Kapat',
        'common.required': 'Zorunlu alan',

        // Voting
        'vote.title': 'Oylama',
        'vote.verify': 'Kimlik Doğrulama',
        'vote.enterCode': 'Doğrulama Kodu',
        'vote.sendCode': 'Kod Gönder',
        'vote.submitVote': 'Oyumu Gönder',
        'vote.success': 'Oyunuz kaydedildi!',
        'vote.dragHint': 'Adayları sürükleyerek tercih sıranızı belirleyin',
        'vote.thankYou': 'Katılımınız için teşekkür ederiz',
    },
    en: {
        // Navbar
        'nav.home': 'Home',
        'nav.about': 'About',
        'nav.team': 'Team',
        'nav.events': 'Events',
        'nav.announcements': 'Announcements',
        'nav.gallery': 'Gallery',
        'nav.apply': 'Apply',
        'nav.contact': 'Contact',

        // Hero Section
        'hero.title': 'Software Development Club',
        'hero.subtitle': 'Coding the future together',
        'hero.cta': 'Join Us',

        // Stats
        'stats.members': 'Members',
        'stats.events': 'Events',
        'stats.projects': 'Projects',
        'stats.years': 'Years',

        // About Section
        'about.title': 'About Us',
        'about.subtitle': 'Who We Are?',
        'about.description': 'KTU Software Development Club is an active community that brings together students interested in software and technology.',
        'about.mission': 'Our Mission',
        'about.vision': 'Our Vision',

        // Team Section
        'team.title': 'Our Team',
        'team.subtitle': 'Meet the SDC Family',
        'team.viewAll': 'View All',

        // Events Section
        'events.title': 'Events',
        'events.subtitle': 'Upcoming Events',
        'events.upcoming': 'Upcoming Events',
        'events.past': 'Past Events',
        'events.register': 'Register',
        'events.details': 'Details',
        'events.date': 'Date',
        'events.location': 'Location',
        'events.free': 'Free',
        'events.paid': 'Paid',
        'events.noEvents': 'No events available',
        'events.calendar': 'Event Calendar',
        'events.viewCalendar': 'View Calendar',

        // Announcements
        'announcements.title': 'Announcements',
        'announcements.subtitle': 'Latest Announcements',
        'announcements.readMore': 'Read More',
        'announcements.noAnnouncements': 'No announcements available',

        // Apply / Registration
        'apply.title': 'Application',
        'apply.subtitle': 'Join the SDC Family',
        'apply.description': 'Do you want to develop yourself in the software world, create projects and be part of an amazing team?',
        'apply.form.name': 'Full Name',
        'apply.form.email': 'Email',
        'apply.form.phone': 'Phone',
        'apply.form.studentNo': 'Student Number',
        'apply.form.department': 'Department',
        'apply.form.motivation': 'Your Motivation',
        'apply.form.submit': 'Apply',
        'apply.form.github': 'GitHub',
        'apply.form.linkedin': 'LinkedIn',
        'apply.success': 'Your application has been received!',
        'apply.error': 'An error occurred',

        // Event Registration
        'register.title': 'Event Registration',
        'register.alreadyRegistered': 'You are already registered for this event',
        'register.success': 'Registration completed successfully!',
        'register.paymentInfo': 'Payment Information',
        'register.uploadReceipt': 'Upload Receipt',
        'register.iban': 'IBAN',
        'register.fee': 'Registration Fee',

        // Contact Section
        'contact.title': 'Contact',
        'contact.subtitle': 'Get in Touch',
        'contact.email': 'Email',
        'contact.address': 'Address',
        'contact.followUs': 'Follow Us',
        'contact.sendMessage': 'Send Message',

        // Footer
        'footer.rights': 'All rights reserved.',
        'footer.madeWith': 'Made with',
        'footer.quickLinks': 'Quick Links',
        'footer.social': 'Social Media',
        'footer.privacy': 'Privacy Policy',
        'footer.kvkk': 'GDPR',

        // Common
        'common.loading': 'Loading...',
        'common.error': 'An error occurred',
        'common.success': 'Success',
        'common.submit': 'Submit',
        'common.cancel': 'Cancel',
        'common.save': 'Save',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.back': 'Back',
        'common.next': 'Next',
        'common.search': 'Search',
        'common.noResults': 'No results found',
        'common.showMore': 'Show More',
        'common.showLess': 'Show Less',
        'common.close': 'Close',
        'common.required': 'Required field',

        // Voting
        'vote.title': 'Voting',
        'vote.verify': 'Identity Verification',
        'vote.enterCode': 'Verification Code',
        'vote.sendCode': 'Send Code',
        'vote.submitVote': 'Submit Vote',
        'vote.success': 'Your vote has been recorded!',
        'vote.dragHint': 'Drag candidates to set your preference order',
        'vote.thankYou': 'Thank you for participating',
    },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('tr');
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('language') as Language;
        if (saved && (saved === 'tr' || saved === 'en')) {
            setLanguageState(saved);
        }
        setIsHydrated(true);
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string, fallback?: string): string => {
        return translations[language][key] || fallback || key;
    };

    // Prevent hydration mismatch by returning default language translations on server
    if (!isHydrated) {
        return (
            <LanguageContext.Provider value={{ language: 'tr', setLanguage, t: (key, fallback) => translations['tr'][key] || fallback || key }}>
                {children}
            </LanguageContext.Provider>
        );
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
