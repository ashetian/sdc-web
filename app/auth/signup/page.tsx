'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { KVKK_CONTENT } from '@/app/lib/constants/kvkk';
import { useLanguage } from '@/app/_context/LanguageContext';
import { Button, Alert, Modal } from '@/app/_components/ui';

export default function SignupPage() {
    const { t } = useLanguage();
    const [studentNo, setStudentNo] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [maskedEmail, setMaskedEmail] = useState('');
    const [error, setError] = useState('');
    const [kvkkAccepted, setKvkkAccepted] = useState(false);
    const [emailConsent, setEmailConsent] = useState(false);
    const [nativeLanguage, setNativeLanguage] = useState('tr');
    const [showKvkkModal, setShowKvkkModal] = useState(false);

    // Email verification states
    const [verificationStep, setVerificationStep] = useState<'initial' | 'verify'>('initial');
    const [emailVerification, setEmailVerification] = useState('');


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            // Step 1: Get masked email
            if (verificationStep === 'initial') {
                const res = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentNo: studentNo.trim()
                    }),
                });

                const data = await res.json();

                if (res.ok && data.step === 'verify') {
                    setMaskedEmail(data.maskedEmail);
                    setVerificationStep('verify');
                } else {
                    if (data.isRegistered) {
                        setError(t('auth.alreadyRegistered'));
                    } else if (data.isNotFound) {
                        setError('not_found');
                    } else {
                        setError(data.error || t('auth.genericError'));
                    }
                }
            } else {
                // Step 2: Verify email and complete signup
                const res = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentNo: studentNo.trim(),
                        emailVerification: emailVerification.trim(),
                        kvkkAccepted,
                        emailConsent,
                        nativeLanguage,
                        step: 'confirm'
                    }),
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    setMessage(data.message);
                    setMaskedEmail(data.email);
                } else {
                    if (data.emailMismatch) {
                        setError(t('auth.emailMismatch'));
                    } else {
                        setError(data.error || t('auth.genericError'));
                    }
                }
            }
        } catch {
            setError(t('auth.genericError'));
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
                    <h1 className="text-2xl font-black text-black uppercase">{t('auth.signup')}</h1>
                    <p className="text-gray-600 mt-2">{t('auth.subtitle')}</p>
                </div>

                {message ? (
                    <div className="text-center">
                        <div className="mb-4">
                            <Alert variant="success">
                                <p className="font-bold">{message}</p>
                                <p className="mt-2">
                                    {t('auth.sentTo')} <strong>{maskedEmail}</strong>
                                </p>
                            </Alert>
                            <p className="text-gray-600 text-sm">
                                {t('auth.checkEmail')}
                            </p>
                            <Link
                                href="/auth/login"
                                className="inline-block mt-4 text-blue-600 hover:underline font-bold"
                            >
                                {t('auth.backToLogin')}
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="studentNo" className="block text-sm font-black text-black mb-2">
                                {t('auth.studentNo')}
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
                                {t('auth.languageLabel')}
                            </label>
                            <select
                                id="nativeLanguage"
                                value={nativeLanguage}
                                onChange={(e) => setNativeLanguage(e.target.value)}
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                                required
                            >
                                <option value="tr">{t('auth.languageTr')}</option>
                                <option value="en">{t('auth.languageEn')}</option>
                            </select>
                        </div>

                        {/* Email Verification Step */}
                        {verificationStep === 'verify' && (
                            <div className="bg-neo-yellow border-4 border-black p-4">
                                <p className="font-bold text-black mb-2">
                                    {t('auth.verifyEmailTitle')}
                                </p>
                                <p className="text-sm text-black mb-3">
                                    {t('auth.registeredEmail')} {maskedEmail}
                                </p>
                                <input
                                    type="email"
                                    value={emailVerification}
                                    onChange={(e) => setEmailVerification(e.target.value)}
                                    placeholder={t('auth.emailPlaceholder')}
                                    required
                                    className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black"
                                />
                                <p className="text-xs text-black/70 mt-2">
                                    {t('auth.verifyEmailDesc')}
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className={`bg-red-100 border-2 border-red-500 p-3 text-red-700 text-sm ${error === 'not_found' ? 'border-neo-yellow bg-yellow-50 text-black' : ''}`}>
                                {error === 'not_found' ? (
                                    <div className="text-center">
                                        <p className="font-bold mb-3">{t('auth.notFound')}</p>
                                        <button
                                            type="button"
                                            onClick={handleJoinClick}
                                            className="w-full bg-black text-white px-4 py-2 font-bold border-2 border-black hover:bg-white hover:text-black hover:shadow-neo transition-all uppercase"
                                        >
                                            {t('auth.joinClub')}
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {error}
                                        {error === t('auth.alreadyRegistered') && (
                                            <Link href="/auth/login" className="block mt-2 text-blue-600 hover:underline">
                                                {t('auth.login')}
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
                                    {t('auth.kvkkLink')}
                                </Link>
                                {t('auth.kvkkAccept')}
                                <Link href="/gizlilik" target="_blank" className="font-bold text-blue-600 hover:underline">
                                    {t('auth.privacyLink')}
                                </Link>
                                {t('auth.kvkkAnd')}
                                <Link href="/uyelik-sozlesmesi" target="_blank" className="font-bold text-blue-600 hover:underline">
                                    {t('auth.termsLink')}
                                </Link>
                                {t('auth.kvkkEnd')}
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
                                {t('auth.emailConsentText')} ({' '}
                                <Link href="/acik-riza" target="_blank" className="font-bold text-blue-600 hover:underline">
                                    {t('auth.consentLink')}
                                </Link>
                                )
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !studentNo.trim() || !kvkkAccepted}
                            className="w-full bg-yellow-400 text-black font-black py-3 border-2 border-black hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? t('auth.submitting') : t('auth.submitRegister')}
                        </button>

                        <div className="text-center text-sm text-gray-600">
                            <p>{t('auth.hasAccount')}</p>
                            <Link href="/auth/login" className="text-blue-600 hover:underline font-bold">
                                {t('auth.login')}
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
                                {t('auth.readAndUnderstood')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

