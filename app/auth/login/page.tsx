'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/app/_components/LoadingSpinner';
import { useLanguage } from '@/app/_context/LanguageContext';
import { Button, Card, Input } from '@/app/_components/ui';
import { useToast } from '@/app/_context/ToastContext';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || searchParams.get('redirect');
    const { t } = useLanguage();
    const { showToast } = useToast();

    const [studentNo, setStudentNo] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const success = searchParams.get('success');
        if (success === 'signup') {
            showToast(t('auth.accountCreated'), 'success');
            // Clear param to avoid showing again on refresh? Hard with next router replace without reload.
            // Just leaving it is fine or use window.history.replaceState
            window.history.replaceState({}, '', '/auth/login');
        } else if (success === 'reset') {
            showToast(t('auth.passwordResetSuccess'), 'success');
            window.history.replaceState({}, '', '/auth/login');
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

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
                            showToast(t('auth.noPermission'), 'error');
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
                    showToast(
                        <div>
                            {t('auth.notRegistered')}
                            <Link href="/auth/signup" className="block mt-1 text-black underline font-bold">
                                {t('auth.registerLink')}
                            </Link>
                        </div>,
                        'error'
                    );
                } else {
                    showToast(data.error || t('auth.loginFailed'), 'error');
                }
            }
        } catch {
            showToast(t('auth.genericError'), 'error');
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

