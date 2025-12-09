'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/app/_context/LanguageContext';

export default function ForgotPasswordPage() {
    const { language } = useLanguage();
    const [studentNo, setStudentNo] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [maskedEmail, setMaskedEmail] = useState('');
    const [error, setError] = useState('');

    const labels = {
        tr: {
            title: 'Şifremi Unuttum',
            subtitle: 'Şifre sıfırlama linki gönderin',
            studentNo: 'Öğrenci Numarası',
            submit: 'Sıfırlama Linki Gönder',
            sending: 'Gönderiliyor...',
            sentTo: 'Gönderildi:',
            checkEmail: 'E-postanızı kontrol edin ve şifrenizi sıfırlayın.',
            backToLogin: 'Giriş Sayfasına Dön',
            notRegistered: 'Bu hesap henüz oluşturulmamış. Önce kayıt olun.',
            genericError: 'Bir hata oluştu. Lütfen tekrar deneyin.',
            registerLink: 'Kayıt olmak için tıklayın'
        },
        en: {
            title: 'Forgot Password',
            subtitle: 'Send a password reset link',
            studentNo: 'Student Number',
            submit: 'Send Reset Link',
            sending: 'Sending...',
            sentTo: 'Sent to:',
            checkEmail: 'Check your email and reset your password.',
            backToLogin: 'Back to Login',
            notRegistered: 'This account has not been created yet. Please register first.',
            genericError: 'An error occurred. Please try again.',
            registerLink: 'Click to register'
        }
    };

    const l = labels[language] || labels.tr;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentNo: studentNo.trim() }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message);
                setMaskedEmail(data.email || '');
            } else {
                if (data.notRegistered) {
                    setError(l.notRegistered);
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

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
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
                            {maskedEmail && (
                                <p className="text-green-700 mt-2">
                                    {l.sentTo} <strong>{maskedEmail}</strong>
                                </p>
                            )}
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

                        {error && (
                            <div className="bg-red-100 border-2 border-red-500 p-3 text-red-700 text-sm">
                                {error}
                                {error === l.notRegistered && (
                                    <Link href="/auth/signup" className="block mt-2 text-blue-600 hover:underline">
                                        {l.registerLink}
                                    </Link>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !studentNo.trim()}
                            className="w-full bg-yellow-400 text-black font-black py-3 border-2 border-black hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? l.sending : l.submit}
                        </button>

                        <div className="text-center text-sm">
                            <Link href="/auth/login" className="text-blue-600 hover:underline">
                                ← {l.backToLogin}
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

