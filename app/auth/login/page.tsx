'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/app/_components/LoadingSpinner';
import { useLanguage } from '@/app/_context/LanguageContext';
import { Button, Card, Input, Alert } from '@/app/_components/ui';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || searchParams.get('redirect');
    const { t } = useLanguage();

    const [studentNo, setStudentNo] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentNo: studentNo.trim(), password }),
            });

            const data = await res.json();

            if (res.ok) {
                // If attempting to access admin panel, check permissions before redirecting
                if (returnUrl && returnUrl.startsWith('/admin')) {
                    try {
                        const authCheck = await fetch('/api/admin/check-auth');
                        if (authCheck.ok) {
                            window.location.href = returnUrl;
                        } else {
                            setError(t('auth.noPermission'));
                            // Optional: Redirect to profile after short delay or let user choose
                            setTimeout(() => router.push('/profile'), 2000);
                        }
                    } catch (e) {
                        window.location.href = returnUrl; // Fallback to guard
                    }
                } else if (returnUrl && returnUrl.startsWith('/')) {
                    window.location.href = returnUrl;
                } else {
                    router.push('/profile');
                }
            } else {
                if (data.notRegistered) {
                    setError(t('auth.notRegistered'));
                } else {
                    setError(data.error || t('auth.loginFailed'));
                }
            }
        } catch {
            setError(t('auth.genericError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border-4 border-black shadow-neo p-8 w-full max-w-md">
            <div className="text-center mb-6">
                <Image
                    src="/sdclogo.png"
                    alt="SDC Logo"
                    width={80}
                    height={80}
                    className="mx-auto mb-4"
                />
                <h1 className="text-2xl font-black text-black uppercase">{t('auth.login')}</h1>
                <p className="text-gray-600 mt-2">{t('auth.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    type="text"
                    id="studentNo"
                    label={t('auth.studentNo')}
                    value={studentNo}
                    onChange={(e) => setStudentNo(e.target.value)}
                    required
                />

                <Input
                    type="password"
                    id="password"
                    label={t('auth.password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                />

                {error && (
                    <Alert variant="danger">
                        {error}
                        {error === t('auth.notRegistered') && (
                            <Link href="/auth/signup" className="block mt-2 text-blue-600 hover:underline">
                                {t('auth.registerLink')}
                            </Link>
                        )}
                    </Alert>
                )}

                <Button
                    type="submit"
                    isLoading={loading}
                    fullWidth
                >
                    {t('auth.login')}
                </Button>

                <div className="text-center text-sm">
                    <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
                        {t('auth.forgotPassword')}
                    </Link>
                </div>

                <div className="text-center text-sm text-gray-600 border-t pt-4">
                    <p>{t('auth.noAccount')}</p>
                    <Link href="/auth/signup" className="text-blue-600 hover:underline font-bold">
                        {t('auth.register')}
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-56 pb-8 px-4">
            <Suspense fallback={<LoadingSpinner size="lg" />}>
                <LoginForm />
            </Suspense>
        </div>
    );
}

