'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingSpinner from '@/app/_components/LoadingSpinner';
import { useLanguage } from '@/app/_context/LanguageContext';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl');
    const { language } = useLanguage();

    const [studentNo, setStudentNo] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const labels = {
        tr: {
            title: 'Giriş Yap',
            subtitle: 'Üye hesabınıza giriş yapın',
            studentNo: 'Öğrenci Numarası',
            password: 'Şifre',
            submit: 'Giriş Yap',
            submitting: 'Giriş yapılıyor...',
            forgotPassword: 'Şifremi Unuttum',
            noAccount: 'Hesabınız yok mu?',
            register: 'Kayıt Ol',
            notRegistered: 'Hesabınız henüz oluşturulmamış. Önce kayıt olun.',
            loginFailed: 'Giriş başarısız',
            genericError: 'Bir hata oluştu. Lütfen tekrar deneyin.',
            noPermission: '⚠️ Giriş başarılı ancak Panel yetkiniz yok!',
            registerLink: 'Kayıt olmak için tıklayın'
        },
        en: {
            title: 'Login',
            subtitle: 'Sign in to your member account',
            studentNo: 'Student Number',
            password: 'Password',
            submit: 'Login',
            submitting: 'Logging in...',
            forgotPassword: 'Forgot Password',
            noAccount: "Don't have an account?",
            register: 'Register',
            notRegistered: 'Your account has not been created yet. Please register first.',
            loginFailed: 'Login failed',
            genericError: 'An error occurred. Please try again.',
            noPermission: '⚠️ Login successful but you do not have panel access!',
            registerLink: 'Click to register'
        }
    };

    const l = labels[language] || labels.tr;

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
                            setError(l.noPermission);
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
                    setError(l.notRegistered);
                } else {
                    setError(data.error || l.loginFailed);
                }
            }
        } catch {
            setError(l.genericError);
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
                <h1 className="text-2xl font-black text-black uppercase">{l.title}</h1>
                <p className="text-gray-600 mt-2">{l.subtitle}</p>
            </div>

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
                    <label htmlFor="password" className="block text-sm font-black text-black mb-2">
                        {l.password}
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
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
                    disabled={loading}
                    className="w-full bg-yellow-400 text-black font-black py-3 border-2 border-black hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? l.submitting : l.submit}
                </button>

                <div className="text-center text-sm">
                    <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
                        {l.forgotPassword}
                    </Link>
                </div>

                <div className="text-center text-sm text-gray-600 border-t pt-4">
                    <p>{l.noAccount}</p>
                    <Link href="/auth/signup" className="text-blue-600 hover:underline font-bold">
                        {l.register}
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

