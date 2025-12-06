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
        <nav className="fixed top-0 left-0 right-0 bg-white border-b-4 border-black z-50 flex items-center justify-between px-6 py-4 shadow-neo-sm h-20">
            {/* Logo Area - REMOVED per user request for empty navbar with single button */}
            <div className="hidden md:block w-32">
                {/* Spacer to balance flex layout if needed, or just empty */}
            </div>

            {/* Menu Items - Just the Main Dashboard Link */}
            <div className="hidden md:flex flex-1 justify-center px-8">
                <Link
                    href="/admin"
                    className={`
                        inline-flex items-center px-8 py-2 font-black text-lg uppercase transition-all border-4 border-black shadow-neo-sm
                        ${isDashboardActive
                            ? 'bg-neo-blue text-white translate-x-1 translate-y-1 shadow-none'
                            : 'bg-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-gray-50'
                        }
                    `}
                >
                    {userInfo?.isSuperAdmin ? 'SÜPERADMİN PANELİ' : 'ADMİN PANELİ'}
                </Link>
            </div>

            {/* Footer / User Info */}
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold truncate">
                        {userInfo?.name || 'Kullanıcı'}
                    </div>
                    <div className="text-xs text-gray-500 font-bold uppercase">
                        {userInfo?.isSuperAdmin ? 'Süper Admin' : (userInfo?.role || 'Üye')}
                    </div>
                </div>
                <Link href="/" className="px-4 py-2 bg-red-500 text-white border-2 border-black font-black text-xs uppercase hover:bg-red-600 hover:shadow-neo transition-all">
                    SİTEYE DÖN
                </Link>
            </div>
        </nav>
    );
}
