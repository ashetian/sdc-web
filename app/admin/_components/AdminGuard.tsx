"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import LoadingSpinner from "@/app/_components/LoadingSpinner";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);
    const [forbidden, setForbidden] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const check = async () => {
            try {
                const res = await fetch("/api/admin/check-auth");
                if (res.ok) {
                    setAuthorized(true);
                } else if (res.status === 403) {
                    // Logged in but not admin
                    setForbidden(true);
                    setAuthorized(false);
                } else {
                    // Not logged in (401)
                    setAuthorized(false);
                    router.replace(`/auth/login?returnUrl=${encodeURIComponent(pathname)}`);
                }
            } catch (e) {
                console.error("Auth check failed", e);
                setAuthorized(false);
                router.replace("/auth/login");
            } finally {
                setChecking(false);
            }
        };

        check();
    }, [pathname, router]);

    if (checking) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <LoadingSpinner size="lg" />
                <span className="ml-4 font-bold text-gray-500">Yetki Kontrolü...</span>
            </div>
        );
    }

    if (forbidden) {
        return (
            <div className="flex h-screen flex-col items-center justify-center bg-neo-yellow text-center p-4">
                <div className="bg-white border-4 border-black shadow-neo p-8 max-w-md">
                    <h1 className="text-4xl font-black mb-4">🚫 YETKİSİZ GİRİŞ</h1>
                    <p className="text-lg font-bold mb-6">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => router.push('/profile')}
                            className="bg-neo-blue border-2 border-black p-3 font-black uppercase text-white shadow-neo hover:shadow-none transition-all"
                        >
                            Profilime Dön
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-white border-2 border-black p-3 font-black uppercase text-black hover:bg-gray-100 transition-all"
                        >
                            Anasayfaya Dön
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!authorized) {
        return null; // Will redirect
    }

    return <>{children}</>;
}
