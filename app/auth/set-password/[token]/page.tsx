'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const router = useRouter();
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
                setError(data.error || 'Geçersiz link');
            }
        } catch {
            setError('Bir hata oluştu');
        } finally {
            setValidating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Şifreler eşleşmiyor');
            return;
        }

        if (password.length < 6) {
            setError('Şifre en az 6 karakter olmalı');
            return;
        }

        if (tokenInfo?.requiresNickname && nickname.trim().length < 2) {
            setError('Nickname en az 2 karakter olmalı');
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
                setError(data.error || 'Bir hata oluştu');
            }
        } catch {
            setError('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-gray-600">Link doğrulanıyor...</p>
                </div>
            </div>
        );
    }

    if (error && !tokenInfo) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-56 pb-8 px-4">
                <div className="bg-white border-4 border-black shadow-neo p-8 w-full max-w-md text-center">
                    <div className="text-red-500 text-6xl mb-4">✗</div>
                    <h1 className="text-xl font-black text-black mb-4">Geçersiz Link</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        href="/auth/signup"
                        className="inline-block bg-yellow-400 text-black font-black py-3 px-6 border-2 border-black hover:bg-yellow-500"
                    >
                        Tekrar Kayıt Ol
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
                        {tokenInfo?.type === 'signup' ? 'Hesap Oluştur' : 'Şifre Sıfırla'}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Merhaba, <strong>{tokenInfo?.fullName}</strong>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {tokenInfo?.requiresNickname && (
                        <div>
                            <label htmlFor="nickname" className="block text-sm font-black text-black mb-2">
                                Nickname (Sitede görünecek isminiz)
                            </label>
                            <input
                                type="text"
                                id="nickname"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="Örn: AhmetY"
                                required
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Bu isim sitede görünecek. Gerçek adınız gizli kalır.
                            </p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="password" className="block text-sm font-black text-black mb-2">
                            Şifre
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="En az 6 karakter"
                            required
                            minLength={6}
                            className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-black text-black mb-2">
                            Şifre Tekrar
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Şifreyi tekrar girin"
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
                        {loading ? 'Kaydediliyor...' : tokenInfo?.type === 'signup' ? 'Hesabı Oluştur' : 'Şifreyi Güncelle'}
                    </button>
                </form>
            </div>
        </div>
    );
}
