'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getDictionary, Language, Dictionary, TxKey } from '@/app/lib/i18n';

// Helper to resolve nested keys
function resolvePath(obj: any, path: string): string | undefined {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TxKey | string, fallback?: string) => string;
    dictionary: Dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('tr');
    const [isHydrated, setIsHydrated] = useState(false);

    // Default to 'tr' dictionary initially to prevent hydration mismatch
    const [dictionary, setDictionary] = useState<Dictionary>(getDictionary('tr'));

    useEffect(() => {
        const saved = localStorage.getItem('language') as Language;
        if (saved && (saved === 'tr' || saved === 'en')) {
            setLanguageState(saved);
            setDictionary(getDictionary(saved));
        }
        setIsHydrated(true);
    }, []);

    // Sync html lang attribute and update dictionary
    useEffect(() => {
        document.documentElement.lang = language;
        setDictionary(getDictionary(language));
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: TxKey | string, fallback?: string): string => {
        const value = resolvePath(dictionary, key);
        return value || fallback || key;
    };

    // Prevent hydration mismatch by returning default language translations on server
    if (!isHydrated) {
        return (
            <LanguageContext.Provider value={{
                language: 'tr',
                setLanguage,
                t: (key, fallback) => {
                    const dict = getDictionary('tr');
                    const value = resolvePath(dict, key);
                    return value || fallback || key;
                },
                dictionary: getDictionary('tr')
            }}>
                {children}
            </LanguageContext.Provider>
        );
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dictionary }}>
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
