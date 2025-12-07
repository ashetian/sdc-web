"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminNavbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await fetch("/api/admin/check-auth");
                if (res.ok) {
                    const data = await res.json();
                    setUserInfo(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        checkAuth();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/auth/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Force redirect even on error
            router.push('/auth/login');
        }
    };

    // Helper to determine active state for the main dashboard link
    const isDashboardActive = pathname === '/admin';

    if (loading) return null;

    return (
        <nav className="bg-neo-yellow border-b-4 border-black fixed w-full top-0 z-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <Link href="/admin" className="text-2xl font-black text-black tracking-tighter hover:text-gray-700 transition-colors uppercase">
                                SDC Admin
                            </Link>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link
                                    href="/admin"
                                    className={`px-4 py-2 text-sm font-bold border-2 transition-all uppercase ${isDashboardActive
                                        ? "bg-black text-white border-black shadow-neo"
                                        : "bg-white text-black border-black hover:bg-black hover:text-white"
                                        }`}
                                >
                                    {userInfo?.isSuperAdmin ? 'SÜPERADMİN PANELİ' : 'ADMİN PANELİ'}
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6 gap-4">
                            <Link
                                href="/"
                                className="px-4 py-2 bg-white text-black font-bold border-2 border-black hover:bg-gray-100 hover:shadow-neo transition-all uppercase text-sm"
                            >
                                Siteye Dön
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white font-bold border-2 border-black hover:bg-red-700 hover:shadow-neo transition-all uppercase text-sm"
                            >
                                Çıkış Yap
                            </button>
                        </div>
                    </div>
                    {/* Mobile: User Info and buttons */}
                    <div className="flex items-center gap-3 md:hidden">
                        <div className="text-right">
                            <div className="text-sm font-bold truncate max-w-[100px]">
                                {userInfo?.name || 'Kullanıcı'}
                            </div>
                            <div className="text-xs text-gray-600 font-bold uppercase">
                                {userInfo?.isSuperAdmin ? 'Süper Admin' : 'Admin'}
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-2 bg-red-500 text-white border-2 border-black font-black text-xs uppercase hover:bg-red-600 transition-all"
                        >
                            Çıkış
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

