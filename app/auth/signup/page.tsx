'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SignupPage() {
    const [studentNo, setStudentNo] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [maskedEmail, setMaskedEmail] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentNo: studentNo.trim() }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message);
                setMaskedEmail(data.email);
            } else {
                if (data.isRegistered) {
                    setError('Bu hesap zaten kayıtlı.');
                } else if (data.isNotFound) {
                    setError('not_found');
                } else {
                    setError(data.error || 'Bir hata oluştu');
                }
            }
        } catch {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.');
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
                    <h1 className="text-2xl font-black text-black uppercase">Kayıt Ol</h1>
                    <p className="text-gray-600 mt-2">Kulüp üyesi olarak kayıt olun</p>
                </div>

                {message ? (
                    <div className="text-center">
                        <div className="bg-green-100 border-2 border-green-500 p-4 mb-4">
                            <p className="text-green-800 font-bold">{message}</p>
                            <p className="text-green-700 mt-2">
                                Gönderildi: <strong>{maskedEmail}</strong>
                            </p>
                        </div>
                        <p className="text-gray-600 text-sm">
                            E-postanızı kontrol edin ve şifrenizi oluşturun.
                        </p>
                        <Link
                            href="/auth/login"
                            className="inline-block mt-4 text-blue-600 hover:underline font-bold"
                        >
                            Giriş Sayfasına Dön
                        </Link>
                    </div>
                ) : (
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

                        {error && (
                            <div className={`bg-red-100 border-2 border-red-500 p-3 text-red-700 text-sm ${error === 'not_found' ? 'border-neo-yellow bg-yellow-50 text-black' : ''}`}>
                                {error === 'not_found' ? (
                                    <div className="text-center">
                                        <p className="font-bold mb-3">Bu numara ile kayıtlı üye bulunamadı.</p>
                                        <button
                                            type="button"
                                            onClick={handleJoinClick}
                                            className="w-full bg-black text-white px-4 py-2 font-bold border-2 border-black hover:bg-white hover:text-black hover:shadow-neo transition-all uppercase"
                                        >
                                            Kulübe Üye Ol
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {error}
                                        {error.includes('zaten kayıtlı') && (
                                            <Link href="/auth/login" className="block mt-2 text-blue-600 hover:underline">
                                                Giriş Yap
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !studentNo.trim()}
                            className="w-full bg-yellow-400 text-black font-black py-3 border-2 border-black hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Gönderiliyor...' : 'Kayıt Ol'}
                        </button>

                        <div className="text-center text-sm text-gray-600">
                            <p>Zaten hesabınız var mı?</p>
                            <Link href="/auth/login" className="text-blue-600 hover:underline font-bold">
                                Giriş Yap
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
