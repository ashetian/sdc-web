'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SkeletonForm, SkeletonFullPage } from "@/app/_components/Skeleton";
import { useLanguage } from '@/app/_context/LanguageContext';

export default function SetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const router = useRouter();
    const { language } = useLanguage();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [error, setError] = useState('');
    const [tokenInfo, setTokenInfo] = useState<{
        valid: boolean;
        type: 'signup' | 'reset';
        fullName: string;
        requiresNickname: boolean;
    } | null>(null);

    const labels = {
        tr: {
            createAccount: 'Hesap Oluştur',
            resetPassword: 'Şifre Sıfırla',
            hello: 'Merhaba,',
            invalidLink: 'Geçersiz Link',
            registerAgain: 'Tekrar Kayıt Ol',
            nicknameLabel: 'Nickname (Sitede görünecek isminiz)',
            nicknamePlaceholder: 'Örn: AhmetY',
            nicknameHelp: 'Bu isim sitede görünecek. Gerçek adınız gizli kalır.',
            passwordLabel: 'Şifre',
            passwordPlaceholder: 'En az 6 karakter',
            confirmLabel: 'Şifre Tekrar',
            confirmPlaceholder: 'Şifreyi tekrar girin',
            submit: 'Hesabı Oluştur',
            submitReset: 'Şifreyi Güncelle',
            submitting: 'Kaydediliyor...',
            passwordMismatch: 'Şifreler eşleşmiyor',
            passwordShort: 'Şifre en az 6 karakter olmalı',
            nicknameShort: 'Nickname en az 2 karakter olmalı',
            genericError: 'Bir hata oluştu'
        },
        en: {
            createAccount: 'Create Account',
            resetPassword: 'Reset Password',
            hello: 'Hello,',
            invalidLink: 'Invalid Link',
            registerAgain: 'Register Again',
            nicknameLabel: 'Nickname (Your display name on the site)',
            nicknamePlaceholder: 'E.g.: JohnD',
            nicknameHelp: 'This name will be displayed on the site. Your real name stays private.',
            passwordLabel: 'Password',
            passwordPlaceholder: 'At least 6 characters',
            confirmLabel: 'Confirm Password',
            confirmPlaceholder: 'Enter password again',
            submit: 'Create Account',
            submitReset: 'Update Password',
            submitting: 'Saving...',
            passwordMismatch: 'Passwords do not match',
            passwordShort: 'Password must be at least 6 characters',
            nicknameShort: 'Nickname must be at least 2 characters',
            genericError: 'An error occurred'
        }
    };

    const l = labels[language] || labels.tr;

    useEffect(() => {
        validateToken();
    }, [token]);

    const validateToken = async () => {
        try {
            const res = await fetch(`/api/auth/set-password?token=${token}`);
            const data = await res.json();

            if (res.ok && data.valid) {
                setTokenInfo(data);
            } else {
                setError(data.error || l.invalidLink);
            }
        } catch {
            setError(l.genericError);
        } finally {
            setValidating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError(l.passwordMismatch);
            return;
        }

        if (password.length < 6) {
            setError(l.passwordShort);
            return;
        }

        if (tokenInfo?.requiresNickname && nickname.trim().length < 2) {
            setError(l.nicknameShort);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/set-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    password,
                    nickname: tokenInfo?.requiresNickname ? nickname.trim() : undefined,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/auth/login?success=' + (data.isSignup ? 'signup' : 'reset'));
            } else {
                setError(data.error || l.genericError);
            }
        } catch {
            setError(l.genericError);
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <SkeletonFullPage>
                <SkeletonForm />
            </SkeletonFullPage>
        );
    }

    if (error && !tokenInfo) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-56 pb-8 px-4">
                <div className="bg-white border-4 border-black shadow-neo p-8 w-full max-w-md text-center">
                    <div className="text-red-500 text-6xl mb-4">✗</div>
                    <h1 className="text-xl font-black text-black mb-4">{l.invalidLink}</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        href="/auth/signup"
                        className="inline-block bg-yellow-400 text-black font-black py-3 px-6 border-2 border-black hover:bg-yellow-500"
                    >
                        {l.registerAgain}
                    </Link>
                </div>
            </div>
        );
    }

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
                    <h1 className="text-2xl font-black text-black uppercase">
                        {tokenInfo?.type === 'signup' ? l.createAccount : l.resetPassword}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {l.hello} <strong>{tokenInfo?.fullName}</strong>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {tokenInfo?.requiresNickname && (
                        <div>
                            <label htmlFor="nickname" className="block text-sm font-black text-black mb-2">
                                {l.nicknameLabel}
                            </label>
                            <input
                                type="text"
                                id="nickname"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder={l.nicknamePlaceholder}
                                required
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {l.nicknameHelp}
                            </p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="password" className="block text-sm font-black text-black mb-2">
                            {l.passwordLabel}
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={l.passwordPlaceholder}
                            required
                            minLength={6}
                            className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-black text-black mb-2">
                            {l.confirmLabel}
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={l.confirmPlaceholder}
                            required
                            className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-100 border-2 border-red-500 p-3 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-yellow-400 text-black font-black py-3 border-2 border-black hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? l.submitting : tokenInfo?.type === 'signup' ? l.submit : l.submitReset}
                    </button>
                </form>
            </div>
        </div>
    );
}

