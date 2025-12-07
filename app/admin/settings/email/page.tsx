"use client";

import { useEffect, useState } from "react";
import GlobalLoading from '@/app/_components/GlobalLoading';
import Link from 'next/link';
import { Mail, AlertCircle, CheckCircle, Send, Info } from 'lucide-react';

type EmailProvider = 'resend' | 'nodemailer-gmail';

export default function EmailSettingsPage() {
    const [provider, setProvider] = useState<EmailProvider>('resend');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [gmailConfigured, setGmailConfigured] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                if (data.emailProvider) {
                    setProvider(data.emailProvider as EmailProvider);
                }
            }

            // Check if Gmail is configured via env
            const envCheck = await fetch('/api/admin/email-settings/check');
            if (envCheck.ok) {
                const envData = await envCheck.json();
                setGmailConfigured(envData.gmailConfigured);
            }
        } catch (error) {
            console.error('Ayarlar yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'emailProvider', value: provider }),
            });

            if (!res.ok) {
                throw new Error('Ayar kaydedilemedi');
            }

            // Clear email settings cache
            await fetch('/api/admin/email-settings/clear-cache', { method: 'POST' });

            setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi.' });
        } catch (error) {
            console.error('Hata:', error);
            setMessage({ type: 'error', text: 'Bir hata oluştu.' });
        } finally {
            setSaving(false);
        }
    };

    const handleTestEmail = async () => {
        if (!testEmail) {
            setMessage({ type: 'error', text: 'Lütfen test e-posta adresi girin.' });
            return;
        }

        setTesting(true);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/email-settings/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: testEmail }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: `Test e-postası ${testEmail} adresine gönderildi!` });
            } else {
                setMessage({ type: 'error', text: data.error || 'Test e-postası gönderilemedi.' });
            }
        } catch (error) {
            console.error('Test error:', error);
            setMessage({ type: 'error', text: 'Bir hata oluştu.' });
        } finally {
            setTesting(false);
        }
    };

    if (loading) return <GlobalLoading />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border-4 border-black shadow-neo p-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Mail size={28} strokeWidth={2} />
                    <h1 className="text-2xl font-black text-black uppercase">E-posta Ayarları</h1>
                </div>
                <Link href="/admin/settings" className="font-bold text-gray-500 hover:text-black hover:underline">
                    &larr; Geri Dön
                </Link>
            </div>

            {/* Provider Selection */}
            <div className="bg-white border-4 border-black shadow-neo p-6">
                <h2 className="text-lg font-black uppercase mb-4">E-posta Sağlayıcısı</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Resend Option */}
                    <button
                        type="button"
                        onClick={() => setProvider('resend')}
                        className={`p-4 border-4 border-black text-left transition-all ${provider === 'resend'
                            ? 'bg-neo-blue shadow-neo'
                            : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                    >
                        <div className="font-black text-lg">Resend (Domain)</div>
                        <p className="text-sm font-bold text-gray-600 mt-1">
                            noreply@ktusdc.com adresinden gönderir
                        </p>
                        <p className="text-xs font-bold text-gray-500 mt-2">
                            ⚠️ Domain DNS ayarları gerekli
                        </p>
                    </button>

                    {/* Gmail Option */}
                    <button
                        type="button"
                        onClick={() => setProvider('nodemailer-gmail')}
                        className={`p-4 border-4 border-black text-left transition-all ${provider === 'nodemailer-gmail'
                            ? 'bg-neo-yellow shadow-neo'
                            : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                    >
                        <div className="font-black text-lg">Gmail SMTP</div>
                        <p className="text-sm font-bold text-gray-600 mt-1">
                            Gmail hesabından gönderir
                        </p>
                        <p className="text-xs font-bold mt-2">
                            {gmailConfigured ? (
                                <span className="text-green-600">✅ Yapılandırılmış</span>
                            ) : (
                                <span className="text-red-600">❌ Env değişkenleri gerekli</span>
                            )}
                        </p>
                    </button>
                </div>
            </div>

            {/* Gmail Configuration Info */}
            {provider === 'nodemailer-gmail' && (
                <div className={`border-4 border-black shadow-neo p-6 ${gmailConfigured ? 'bg-green-100' : 'bg-neo-yellow'}`}>
                    <div className="flex items-start gap-3">
                        <Info size={24} className="flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-black text-lg mb-2">Gmail Yapılandırması</h3>

                            {gmailConfigured ? (
                                <p className="font-bold text-green-800">
                                    ✅ Gmail SMTP yapılandırılmış ve kullanıma hazır.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    <p className="font-bold">
                                        Gmail kullanmak için Vercel&apos;de şu ortam değişkenlerini tanımlayın:
                                    </p>
                                    <div className="bg-white border-2 border-black p-3 font-mono text-sm">
                                        <div>GMAIL_USER=sdckulubu@gmail.com</div>
                                        <div>GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx</div>
                                    </div>
                                    <p className="text-sm font-bold text-gray-700">
                                        App Password oluşturmak için{' '}
                                        <a
                                            href="https://myaccount.google.com/apppasswords"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                            Google App Passwords
                                        </a>
                                        {' '}sayfasını ziyaret edin.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="bg-white border-4 border-black shadow-neo p-6">
                <form onSubmit={handleSave}>
                    <button
                        type="submit"
                        disabled={saving || (provider === 'nodemailer-gmail' && !gmailConfigured)}
                        className="bg-neo-green text-black border-4 border-black px-8 py-3 font-black uppercase hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Kaydediliyor...' : 'Sağlayıcıyı Kaydet'}
                    </button>
                    {provider === 'nodemailer-gmail' && !gmailConfigured && (
                        <p className="text-sm font-bold text-red-600 mt-2">
                            Gmail seçmek için önce ortam değişkenlerini yapılandırın.
                        </p>
                    )}
                </form>
            </div>

            {/* Test Email */}
            <div className="bg-white border-4 border-black shadow-neo p-6">
                <h2 className="text-lg font-black uppercase mb-4">Test E-postası Gönder</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="test@example.com"
                        className="flex-1 p-3 border-4 border-black bg-gray-50 font-bold focus:shadow-neo focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={handleTestEmail}
                        disabled={testing || !testEmail}
                        className="flex items-center gap-2 bg-neo-pink text-black border-4 border-black px-6 py-3 font-black uppercase hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
                    >
                        <Send size={18} />
                        {testing ? 'Gönderiliyor...' : 'Test Gönder'}
                    </button>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 border-4 border-black font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </div>
            )}
        </div>
    );
}
