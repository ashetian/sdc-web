'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { KVKK_CONTENT } from '@/app/lib/constants/kvkk';
import { useLanguage } from '@/app/_context/LanguageContext';

export default function SignupPage() {
    const { language } = useLanguage();
    const [studentNo, setStudentNo] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [maskedEmail, setMaskedEmail] = useState('');
    const [error, setError] = useState('');
    const [kvkkAccepted, setKvkkAccepted] = useState(false);
    const [emailConsent, setEmailConsent] = useState(false);
    const [nativeLanguage, setNativeLanguage] = useState('tr');
    const [showKvkkModal, setShowKvkkModal] = useState(false);

    const labels = {
        tr: {
            title: 'Kayıt Ol',
            subtitle: 'Kulüp üyesi olarak kayıt olun',
            studentNo: 'Öğrenci Numarası',
            languageLabel: 'Dil Seçimi / Language Preference *',
            languageTr: 'Türkçe (İletişim dili Türkçe olacak)',
            languageEn: 'English (Communication will be in English)',
            alreadyRegistered: 'Bu hesap zaten kayıtlı.',
            notFound: 'Bu numara ile kayıtlı üye bulunamadı.',
            genericError: 'Bir hata oluştu. Lütfen tekrar deneyin.',
            joinClub: 'Kulübe Üye Ol',
            login: 'Giriş Yap',
            kvkkLink: 'KVKK Aydınlatma Metni',
            privacyLink: 'Gizlilik Politikası',
            termsLink: 'Üyelik Sözleşmesi',
            kvkkAccept: "'ni okudum, ",
            kvkkAnd: ' ve ',
            kvkkEnd: "'ni kabul ediyorum. *",
            emailConsentText: 'Kulüp tarafından e-posta/SMS yoluyla etkinlik ve duyuru bilgilendirmeleri yapılmasına açık rıza veriyorum.',
            consentLink: 'Açık Rıza Metni',
            submit: 'Kayıt Ol',
            submitting: 'Gönderiliyor...',
            hasAccount: 'Zaten hesabınız var mı?',
            sentTo: 'Gönderildi:',
            checkEmail: 'E-postanızı kontrol edin ve şifrenizi oluşturun.',
            backToLogin: 'Giriş Sayfasına Dön',
            readAndUnderstood: 'Okudum ve Anladım / I have read and understood'
        },
        en: {
            title: 'Register',
            subtitle: 'Register as a club member',
            studentNo: 'Student Number',
            languageLabel: 'Language Preference *',
            languageTr: 'Türkçe (Communication will be in Turkish)',
            languageEn: 'English (Communication will be in English)',
            alreadyRegistered: 'This account is already registered.',
            notFound: 'No member found with this student number.',
            genericError: 'An error occurred. Please try again.',
            joinClub: 'Join the Club',
            login: 'Login',
            kvkkLink: 'GDPR Clarification Text',
            privacyLink: 'Privacy Policy',
            termsLink: 'Membership Agreement',
            kvkkAccept: " I have read ",
            kvkkAnd: ' and ',
            kvkkEnd: " and I accept. *",
            emailConsentText: 'I consent to receiving event and announcement notifications via email/SMS from the club.',
            consentLink: 'Consent Form',
            submit: 'Register',
            submitting: 'Sending...',
            hasAccount: 'Already have an account?',
            sentTo: 'Sent to:',
            checkEmail: 'Check your email and create your password.',
            backToLogin: 'Back to Login',
            readAndUnderstood: 'I have read and understood'
        }
    };

    const l = labels[language] || labels.tr;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentNo: studentNo.trim(),
                    kvkkAccepted,
                    emailConsent,
                    nativeLanguage
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message);
                setMaskedEmail(data.email);
            } else {
                if (data.isRegistered) {
                    setError(l.alreadyRegistered);
                } else if (data.isNotFound) {
                    setError('not_found');
                } else {
                    setError(data.error || l.genericError);
                }
            }
        } catch {
            setError(l.genericError);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinClick = () => {
        window.location.href = "/join";
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-56 pb-8 px-4">
            <div className="bg-white border-4 border-black shadow-neo p-8 w-full max-w-md">
                <div className="text-center mb-6">
                    <Image
                        src="/sdclogo.png"
                        alt="SDC Logo"
                        width={80}
                        height={80}
                        className="mx-auto mb-4"
                    />
                    <h1 className="text-2xl font-black text-black uppercase">{l.title}</h1>
                    <p className="text-gray-600 mt-2">{l.subtitle}</p>
                </div>

                {message ? (
                    <div className="text-center">
                        <div className="bg-green-100 border-2 border-green-500 p-4 mb-4">
                            <p className="text-green-800 font-bold">{message}</p>
                            <p className="text-green-700 mt-2">
                                {l.sentTo} <strong>{maskedEmail}</strong>
                            </p>
                        </div>
                        <p className="text-gray-600 text-sm">
                            {l.checkEmail}
                        </p>
                        <Link
                            href="/auth/login"
                            className="inline-block mt-4 text-blue-600 hover:underline font-bold"
                        >
                            {l.backToLogin}
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="studentNo" className="block text-sm font-black text-black mb-2">
                                {l.studentNo}
                            </label>
                            <input
                                type="text"
                                id="studentNo"
                                value={studentNo}
                                onChange={(e) => setStudentNo(e.target.value)}
                                placeholder="412345"
                                required
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>

                        <div>
                            <label htmlFor="nativeLanguage" className="block text-sm font-black text-black mb-2">
                                {l.languageLabel}
                            </label>
                            <select
                                id="nativeLanguage"
                                value={nativeLanguage}
                                onChange={(e) => setNativeLanguage(e.target.value)}
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                                required
                            >
                                <option value="tr">{l.languageTr}</option>
                                <option value="en">{l.languageEn}</option>
                            </select>
                        </div>

                        {error && (
                            <div className={`bg-red-100 border-2 border-red-500 p-3 text-red-700 text-sm ${error === 'not_found' ? 'border-neo-yellow bg-yellow-50 text-black' : ''}`}>
                                {error === 'not_found' ? (
                                    <div className="text-center">
                                        <p className="font-bold mb-3">{l.notFound}</p>
                                        <button
                                            type="button"
                                            onClick={handleJoinClick}
                                            className="w-full bg-black text-white px-4 py-2 font-bold border-2 border-black hover:bg-white hover:text-black hover:shadow-neo transition-all uppercase"
                                        >
                                            {l.joinClub}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {error}
                                        {error === l.alreadyRegistered && (
                                            <Link href="/auth/login" className="block mt-2 text-blue-600 hover:underline">
                                                {l.login}
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                id="kvkk"
                                checked={kvkkAccepted}
                                onChange={(e) => setKvkkAccepted(e.target.checked)}
                                className="mt-1 w-4 h-4 text-black border-2 border-black rounded focus:ring-0 cursor-pointer"
                            />
                            <label htmlFor="kvkk" className="text-sm text-gray-700">
                                <Link href="/kvkk" target="_blank" className="font-bold text-blue-600 hover:underline">
                                    {l.kvkkLink}
                                </Link>
                                {l.kvkkAccept}
                                <Link href="/gizlilik" target="_blank" className="font-bold text-blue-600 hover:underline">
                                    {l.privacyLink}
                                </Link>
                                {l.kvkkAnd}
                                <Link href="/uyelik-sozlesmesi" target="_blank" className="font-bold text-blue-600 hover:underline">
                                    {l.termsLink}
                                </Link>
                                {l.kvkkEnd}
                            </label>
                        </div>

                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                id="emailConsent"
                                checked={emailConsent}
                                onChange={(e) => setEmailConsent(e.target.checked)}
                                className="mt-1 w-4 h-4 text-black border-2 border-black rounded focus:ring-0 cursor-pointer"
                            />
                            <label htmlFor="emailConsent" className="text-sm text-gray-700">
                                {l.emailConsentText} ({' '}
                                <Link href="/acik-riza" target="_blank" className="font-bold text-blue-600 hover:underline">
                                    {l.consentLink}
                                </Link>
                                )
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !studentNo.trim() || !kvkkAccepted}
                            className="w-full bg-yellow-400 text-black font-black py-3 border-2 border-black hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? l.submitting : l.submit}
                        </button>

                        <div className="text-center text-sm text-gray-600">
                            <p>{l.hasAccount}</p>
                            <Link href="/auth/login" className="text-blue-600 hover:underline font-bold">
                                {l.login}
                            </Link>
                        </div>
                    </form>
                )}
            </div>

            {/* KVKK Modal */}
            {showKvkkModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white border-4 border-black shadow-neo max-w-lg w-full max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b-2 border-gray-200 flex justify-between items-center">
                            <h3 className="font-bold text-lg">{KVKK_CONTENT[nativeLanguage as 'tr' | 'en'].title}</h3>
                            <button onClick={() => setShowKvkkModal(false)} className="text-xl font-bold">&times;</button>
                        </div>
                        <div className="p-4 overflow-y-auto text-sm text-gray-700 space-y-2">
                            <p className="font-bold mb-2">
                                {KVKK_CONTENT[nativeLanguage as 'tr' | 'en'].controller} {KVKK_CONTENT[nativeLanguage as 'tr' | 'en'].controllerName}
                            </p>
                            <p>{KVKK_CONTENT[nativeLanguage as 'tr' | 'en'].intro}</p>

                            <h4 className="font-bold mt-2">{KVKK_CONTENT[nativeLanguage as 'tr' | 'en'].section1}</h4>
                            <ul className="list-disc list-inside">
                                {KVKK_CONTENT[nativeLanguage as 'tr' | 'en'].section1List.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>

                            <h4 className="font-bold mt-2">{KVKK_CONTENT[nativeLanguage as 'tr' | 'en'].section2}</h4>
                            <ul className="list-disc list-inside">
                                {KVKK_CONTENT[nativeLanguage as 'tr' | 'en'].section2List.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>

                            <h4 className="font-bold mt-2">{KVKK_CONTENT[nativeLanguage as 'tr' | 'en'].section3}</h4>
                            <ul className="list-disc list-inside">
                                {KVKK_CONTENT[nativeLanguage as 'tr' | 'en'].section3List.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>

                            <h4 className="font-bold mt-2">{KVKK_CONTENT[nativeLanguage as 'tr' | 'en'].section4}</h4>
                            <p>{KVKK_CONTENT[nativeLanguage as 'tr' | 'en'].section4Text}</p>

                            <h4 className="font-bold mt-2">{KVKK_CONTENT[nativeLanguage as 'tr' | 'en'].section5}</h4>
                            <ul className="list-disc list-inside">
                                {KVKK_CONTENT[nativeLanguage as 'tr' | 'en'].section5List.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-4 border-t-2 border-gray-200 text-right">
                            <button
                                onClick={() => {
                                    setKvkkAccepted(true);
                                    setShowKvkkModal(false);
                                }}
                                className="bg-black text-white px-4 py-2 font-bold hover:bg-gray-800"
                            >
                                {l.readAndUnderstood}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

