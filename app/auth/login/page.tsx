'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
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
                router.push('/profile');
            } else {
                if (data.notRegistered) {
                    setError('Hesabınız henüz oluşturulmamış. Önce kayıt olun.');
                } else {
                    setError(data.error || 'Giriş başarısız');
                }
            }
        } catch {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
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
                    <h1 className="text-2xl font-black text-black uppercase">Giriş Yap</h1>
                    <p className="text-gray-600 mt-2">Üye hesabınıza giriş yapın</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="studentNo" className="block text-sm font-black text-black mb-2">
                            Öğrenci Numarası
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
                            Şifre
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
                            {error.includes('Önce kayıt') && (
                                <Link href="/auth/signup" className="block mt-2 text-blue-600 hover:underline">
                                    Kayıt olmak için tıklayın
                                </Link>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-yellow-400 text-black font-black py-3 border-2 border-black hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                    </button>

                    <div className="text-center text-sm">
                        <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
                            Şifremi Unuttum
                        </Link>
                    </div>

                    <div className="text-center text-sm text-gray-600 border-t pt-4">
                        <p>Hesabınız yok mu?</p>
                        <Link href="/auth/signup" className="text-blue-600 hover:underline font-bold">
                            Kayıt Ol
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
