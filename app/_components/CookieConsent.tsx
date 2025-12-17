'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../_context/LanguageContext';
import { X } from 'lucide-react';

export default function CookieConsent() {
    const { t } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already accepted cookies
        const hasAccepted = localStorage.getItem('cookie-consent');

        // Check if user is logged in (has auth token cookie)
        const isLoggedIn = document.cookie.includes('auth-token');

        // Don't show if already accepted OR if user is logged in
        if (!hasAccepted && !isLoggedIn) {
            // Small delay for better UX
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-slide-up">
            <div className="max-w-4xl mx-auto bg-neo-black border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    {/* Cookie Icon */}
                    <div className="hidden md:flex items-center justify-center w-12 h-12 bg-neo-yellow border-2 border-white text-2xl flex-shrink-0">
                        🍪
                    </div>

                    {/* Text Content */}
                    <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-1">
                            {t('cookie.title')}
                        </h3>
                        <p className="text-white/80 text-sm">
                            {t('cookie.message')}
                        </p>
                        <p className="text-neo-green text-xs mt-1 font-medium">
                            {t('cookie.noThirdParty')}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 w-full md:w-auto flex-shrink-0">
                        <button
                            onClick={handleAccept}
                            className="flex-1 md:flex-none px-6 py-2 bg-neo-green text-black font-bold border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all"
                        >
                            {t('cookie.accept')}
                        </button>
                    </div>

                    {/* Close Button (mobile) */}
                    <button
                        onClick={handleAccept}
                        className="absolute top-2 right-2 md:hidden text-white/60 hover:text-white"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
