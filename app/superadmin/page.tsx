"use client";

import { useState } from "react";
import { Button } from '@/app/_components/ui';

export default function SuperAdminPage() {
    const [studentNo, setStudentNo] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGrant = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch("/api/superadmin/emergency", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentNo }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage(`✅ ${data.message}`);
            } else {
                setMessage(`❌ ${data.error}`);
            }
        } catch (err) {
            setMessage("❌ Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neo-yellow flex flex-col items-center justify-center p-4">
            <div className="bg-white border-4 border-black shadow-neo p-8 w-full max-w-md">
                <h1 className="text-3xl font-black mb-2 uppercase text-red-600">🚨 OLAĞANÜSTÜ DURUM</h1>
                <p className="text-gray-600 font-bold mb-6">Sistem Erişim Kurtarma Paneli</p>

                <form onSubmit={handleGrant} className="space-y-4">
                    <div>
                        <label className="block font-black mb-1">Yetki Verilecek Öğrenci No</label>
                        <input
                            type="text"
                            className="w-full border-2 border-black p-3 font-bold"
                            value={studentNo}
                            onChange={(e) => setStudentNo(e.target.value)}
                            placeholder="Örn: 2026852"
                        />
                        <p className="text-xs text-gray-500 mt-1 font-bold">
                            Bu kullanıcıya tüm admin yetkileri verilecektir. Kullanıcı siteye giriş yaptıktan sonra admin paneline erişebilir.
                        </p>
                    </div>

                    <Button
                        disabled={loading}
                        isLoading={loading}
                        variant="danger"
                        fullWidth
                    >
                        TAM YETKİ TANIMLA
                    </Button>

                    {message && (
                        <div className="p-3 border-2 border-black bg-gray-100 font-bold text-sm">
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
