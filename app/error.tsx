"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useLanguage } from "./_context/LanguageContext";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const { language } = useLanguage();

    useEffect(() => {
        console.error(error);
    }, [error]);

    const l = {
        tr: {
            title: 'Bir Hata Oluştu',
            description: 'Üzgünüz, bir şeyler ters gitti. Lütfen tekrar deneyin veya ana sayfaya dönün.',
            tryAgain: 'Tekrar Dene',
            backHome: 'Ana Sayfaya Dön'
        },
        en: {
            title: 'Something Went Wrong',
            description: 'Sorry, something went wrong. Please try again or return to the home page.',
            tryAgain: 'Try Again',
            backHome: 'Back to Home'
        }
    };

    return (
        <div className="min-h-screen bg-neo-orange flex items-center justify-center pt-40 relative overflow-hidden py-20">
            <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
                <div className="bg-white border-4 border-black shadow-neo-lg p-12 transform -rotate-1">
                    <h1 className="text-9xl font-black text-black mb-4 select-none">
                        500
                    </h1>
                    <h2 className="text-4xl sm:text-5xl font-black text-black mb-6 uppercase bg-neo-blue text-white inline-block px-4 py-2 border-2 border-black shadow-neo-sm transform rotate-1">
                        {l[language].title}
                    </h2>

                    <p className="mt-6 text-xl font-bold text-black mb-10">
                        {l[language].description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => reset()}
                            className="inline-block px-8 py-4 bg-neo-green text-black text-xl font-black uppercase border-4 border-black hover:shadow-neo transition-all transform hover:-translate-y-1"
                        >
                            {l[language].tryAgain}
                        </button>
                        <Link
                            href="/"
                            className="inline-block px-8 py-4 bg-black text-white text-xl font-black uppercase border-4 border-transparent hover:bg-white hover:text-black hover:border-black hover:shadow-neo transition-all transform hover:-translate-y-1"
                        >
                            {l[language].backHome}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
