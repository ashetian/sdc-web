'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SkeletonForm, SkeletonFullPage } from "@/app/_components/Skeleton";
import { useLanguage } from '@/app/_context/LanguageContext';
import { getPasswordStrength } from '@/app/lib/utils/passwordValidation';
import { Button, Alert } from '@/app/_components/ui';

export default function SetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const router = useRouter();
    const { t } = useLanguage();
    const [tokenInfo, setTokenInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [error, setError] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nickname, setNickname] = useState('');

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
                setError(data.error || t('auth.invalidLink'));
            }
        } catch {
            setError(t('auth.genericError'));
        } finally {
            setValidating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError(t('auth.passwordMismatch'));
            return;
        }

        const strength = getPasswordStrength(password);
        if (strength.score < 1) {
            setError(t('auth.passwordWeak'));
            return;
        }

        if (tokenInfo?.requiresNickname && nickname.trim().length < 2) {
            setError(t('auth.nicknameShort'));
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
                setError(data.error || t('auth.genericError'));
            }
        } catch {
            setError(t('auth.genericError'));
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
                    <h1 className="text-xl font-black text-black mb-4">{t('auth.invalidLink')}</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        href="/auth/signup"
                        className="inline-block bg-yellow-400 text-black font-black py-3 px-6 border-2 border-black hover:bg-yellow-500"
                    >
                        {t('auth.registerAgain')}
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
                        {tokenInfo?.type === 'signup' ? t('auth.createAccount') : t('auth.resetPassword')}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {t('auth.hello')} <strong>{tokenInfo?.fullName}</strong>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {tokenInfo?.requiresNickname && (
                        <div>
                            <label htmlFor="nickname" className="block text-sm font-black text-black mb-2">
                                {t('auth.nicknameLabel')}
                            </label>
                            <input
                                type="text"
                                id="nickname"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder={t('auth.nicknamePlaceholder')}
                                required
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {t('auth.nicknameHelp')}
                            </p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="password" className="block text-sm font-black text-black mb-2">
                            {t('auth.passwordLabel')}
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('auth.passwordPlaceholder')}
                            required
                            minLength={8}
                            className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                        {/* Password Strength Indicator */}
                        {password && (
                            <div className="mt-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="flex-1 h-2 bg-gray-200 border border-black overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-300"
                                            style={{
                                                width: `${getPasswordStrength(password).percentage}%`,
                                                backgroundColor: getPasswordStrength(password).color
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold" style={{ color: getPasswordStrength(password).color }}>
                                        {getPasswordStrength(password).label === 'weak' && t('auth.strengthWeak')}
                                        {getPasswordStrength(password).label === 'medium' && t('auth.strengthMedium')}
                                        {getPasswordStrength(password).label === 'strong' && t('auth.strengthStrong')}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 space-y-0.5">
                                    <p className={password.length >= 8 ? 'text-green-600' : ''}>• {t('auth.req8chars')}</p>
                                    <p className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>• {t('auth.reqUppercase')}</p>
                                    <p className={/[a-z]/.test(password) ? 'text-green-600' : ''}>• {t('auth.reqLowercase')}</p>
                                    <p className={/[0-9]/.test(password) ? 'text-green-600' : ''}>• {t('auth.reqNumber')}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-black text-black mb-2">
                            {t('auth.confirmLabel')}
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={t('auth.confirmPlaceholder')}
                            required
                            className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>

                    {error && (
                        <Alert variant="danger">
                            {error}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        isLoading={loading}
                    >
                        {tokenInfo?.type === 'signup' ? t('auth.submitCreate') : t('auth.submitUpdate')}
                    </Button>
                </form>
            </div>
        </div>
    );
}

