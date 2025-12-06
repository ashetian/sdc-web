"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminNavbar() {
    const pathname = usePathname();
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

    // Helper to determine active state for the main dashboard link
    const isDashboardActive = pathname === '/admin';

    if (loading) return null; // Or a small skeleton

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
                                {/* Assuming 'navigation' and 'handleLogout' are defined elsewhere or will be added */}
                                {/* For now, using a placeholder for navigation items */}
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
                        <div className="ml-4 flex items-center md:ml-6">
                            {/* Placeholder for logout button, assuming handleLogout will be defined */}
                            <button
                                onClick={() => console.log("Logout clicked")} // Replace with actual handleLogout
                                className="px-4 py-2 bg-red-600 text-white font-bold border-2 border-black hover:bg-red-700 hover:shadow-neo transition-all uppercase text-sm"
                            >
                                Çıkış Yap
                            </button>
                        </div>
                    </div>
                    {/* User Info and Siteye Dön link, adapted from original structure */}
                    <div className="flex items-center gap-4 md:hidden"> {/* Show on small screens if needed */}
                        <div className="text-right">
                            <div className="text-sm font-bold truncate">
                                {userInfo?.name || 'Kullanıcı'}
                            </div>
                            <div className="text-xs text-gray-500 font-bold uppercase mb-2">
                                {userInfo?.isSuperAdmin ? 'Süper Admin' : (userInfo?.role || 'Üye')}
                            </div>
                        </div>
                        <Link href="/" className="px-4 py-2 bg-red-500 text-white border-2 border-black font-black text-xs uppercase hover:bg-red-600 hover:shadow-neo transition-all">
                            SİTEYE DÖN
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
