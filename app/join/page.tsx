'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '../_context/LanguageContext';

export default function JoinPage() {
    const { language } = useLanguage();

    const labels = {
        tr: {
            title: 'KULÜBE NASIL ÜYE OLUNUR?',
            subtitle: 'Sadece 3 basit adımda KTÜ Yazılım Geliştirme Kulübü\'ne katılabilirsiniz!',
            step1Title: 'KTÜ Mobil Uygulamasını Açın',
            step1Desc: 'KTÜ mobil uygulamasından "Öğrenci Girişi" yapın ve ana sayfada "Kulüp Yönetim Sistemi\"ni seçin.',
            step2Title: 'Kulüp Listesine Gidin',
            step2Desc: 'Açılan sayfada "Kulüp Yönetim Sistemi"ne tıklayın. Kulüp listesinden "Yazılım Geliştirme Kulübü"nü bulun.',
            step3Title: 'Üye Olun',
            step3Desc: 'Kulüp detay sayfasında "ÜYE OL" butonuna tıklayarak kulübümüze katılın!',
            lastStep: 'Son Adım: WhatsApp Grubuna Katıl!',
            lastStepDesc: 'Yukarıdaki adımları tamamladıktan sonra WhatsApp grubumuza katılarak kulüp etkinliklerinden haberdar olun!',
            joinWhatsApp: 'WhatsApp Grubuna Katıl',
            backHome: 'Ana Sayfaya Dön',
            step: 'Adım'
        },
        en: {
            title: 'HOW TO JOIN THE CLUB?',
            subtitle: 'You can join KTÜ Software Development Club in just 3 simple steps!',
            step1Title: 'Open the KTÜ Mobile App',
            step1Desc: 'Log in as a student from the KTÜ mobile app and select "Club Management System" on the home page.',
            step2Title: 'Go to the Club List',
            step2Desc: 'Click on "Club Management System" on the opened page. Find "Software Development Club" in the club list.',
            step3Title: 'Become a Member',
            step3Desc: 'Click the "JOIN" button on the club detail page to join our club!',
            lastStep: 'Last Step: Join the WhatsApp Group!',
            lastStepDesc: 'After completing the steps above, join our WhatsApp group to stay updated on club activities!',
            joinWhatsApp: 'Join WhatsApp Group',
            backHome: 'Back to Home',
            step: 'Step'
        }
    };

    const l = labels[language];

    const steps = [
        {
            number: 1,
            title: l.step1Title,
            description: l.step1Desc,
            image: '/images/join-steps/step3.png',
        },
        {
            number: 2,
            title: l.step2Title,
            description: l.step2Desc,
            image: '/images/join-steps/step1.png',
        },
        {
            number: 3,
            title: l.step3Title,
            description: l.step3Desc,
            image: '/images/join-steps/step2.png',
        },
    ];

    const [whatsappGroupLink, setWhatsappGroupLink] = useState('https://chat.whatsapp.com/YOUR_GROUP_LINK');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    if (data.whatsappLink) {
                        setWhatsappGroupLink(data.whatsappLink);
                    }
                }
            } catch (error) {
                console.error('Ayarlar yüklenirken hata:', error);
            }
        };

        fetchSettings();
    }, []);

    return (
        <div className="min-h-screen bg-neo-yellow py-20 pt-40">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="inline-block text-4xl sm:text-6xl font-black text-black mb-6 bg-white border-4 border-black shadow-neo-lg px-8 py-4 transform -rotate-2">
                        {l.title}
                    </h1>
                    <p className="text-xl font-bold text-black max-w-3xl mx-auto mt-6 bg-neo-blue border-4 border-black p-4 shadow-neo transform rotate-1">
                        {l.subtitle}
                    </p>
                </div>

                {/* Steps */}
                <div className="space-y-12 mb-20">
                    {steps.map((step, index) => (
                        <div
                            key={step.number}
                            className={`bg-white border-4 border-black shadow-neo-lg p-8 transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'
                                }`}
                        >
                            <div className="flex flex-col lg:flex-row items-center gap-8">
                                {/* Step Number and Text */}
                                <div className="flex-1 order-2 lg:order-1">
                                    <div className="flex items-center mb-4">
                                        <div className="bg-neo-purple text-white border-4 border-black shadow-neo px-6 py-3 text-4xl font-black mr-4">
                                            {step.number}
                                        </div>
                                        <h2 className="text-3xl font-black text-black uppercase">
                                            {step.title}
                                        </h2>
                                    </div>
                                    <p className="text-xl font-bold text-black leading-relaxed border-l-4 border-neo-purple pl-4">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Step Image */}
                                <div className="flex-shrink-0 order-1 lg:order-2">
                                    <div className="bg-white border-4 border-black shadow-neo-lg p-4 w-[280px] sm:w-[320px]">
                                        <Image
                                            src={step.image}
                                            alt={`${l.step} ${step.number}`}
                                            width={320}
                                            height={600}
                                            className="w-full h-auto object-contain"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* WhatsApp CTA */}
                <div className="bg-neo-green border-4 border-black shadow-neo-lg p-12 text-center transform rotate-1">
                    <h2 className="text-3xl sm:text-4xl font-black text-black mb-6 uppercase">
                        {l.lastStep}
                    </h2>
                    <p className="text-xl font-bold text-black mb-8">
                        {l.lastStepDesc}
                    </p>
                    <a
                        href={whatsappGroupLink}

                        rel="noopener noreferrer"
                        className="inline-flex items-center px-12 py-6 bg-[#25D366] text-white border-4 border-black shadow-neo text-2xl font-black hover:bg-white hover:text-[#25D366] hover:shadow-none transition-all uppercase tracking-wider transform hover:-translate-y-2"
                    >
                        <svg
                            className="w-10 h-10 mr-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        {l.joinWhatsApp}
                    </a>
                </div>

                {/* Back Button */}
                <div className="mt-12 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center text-black font-black uppercase hover:underline decoration-4 decoration-neo-purple underline-offset-4 transition-all text-lg"
                    >
                        <svg
                            className="w-6 h-6 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={4}
                        >
                            <path
                                strokeLinecap="square"
                                strokeLinejoin="miter"
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        {l.backHome}
                    </Link>
                </div>
            </div>
        </div>
    );
}
