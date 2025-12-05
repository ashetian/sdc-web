'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
    { href: '/admin', label: 'Duyurular', color: 'bg-white' },
    { href: '/admin/events', label: 'Etkinlikler', color: 'bg-neo-green' },
    { href: '/admin/applicants', label: 'Başvurular', color: 'bg-neo-blue' },
    { href: '/admin/departments', label: 'Departmanlar', color: 'bg-neo-pink' },
    { href: '/admin/team', label: 'Ekip', color: 'bg-neo-orange' },
    { href: '/admin/projects', label: 'Projeler', color: 'bg-neo-blue' },
    { href: '/admin/comments', label: 'Yorumlar', color: 'bg-neo-purple text-white' },
    { href: '/admin/elections', label: 'Seçimler', color: 'bg-neo-yellow' },
    { href: '/admin/stats', label: 'İstatistikler', color: 'bg-neo-purple text-white' },
    { href: '/admin/settings', label: 'Ayarlar', color: 'bg-gray-700 text-white' },
];

export default function AdminNavbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            <header className="fixed inset-x-0 top-0 z-50">
                <nav className="bg-black border-b-4 border-black">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            {/* Menu Button */}
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="p-2 bg-white border-2 border-white hover:bg-neo-yellow transition-all"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    {menuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>

                            {/* Centered Logo */}
                            <Link
                                href="/admin"
                                className="flex items-center space-x-2 absolute left-1/2 transform -translate-x-1/2"
                            >
                                <span className="bg-neo-purple text-white px-3 py-1 text-xl font-black border-2 border-white">
                                    SDC
                                </span>
                                <span className="text-white font-black text-lg">
                                    ADMIN
                                </span>
                            </Link>

                            {/* Back to Site */}
                            <Link
                                href="/"
                                className="p-2 bg-neo-green border-2 border-neo-green hover:bg-white transition-all"
                                title="Siteye Dön"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Slide-out Menu */}
            {menuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setMenuOpen(false)}
                    />

                    {/* Menu Panel */}
                    <div className="fixed left-0 top-16 bottom-0 w-72 bg-white border-r-4 border-black z-50 overflow-y-auto">
                        <div className="p-4 space-y-2">
                            <h2 className="font-black text-lg uppercase border-b-4 border-black pb-2 mb-4">
                                Yönetim Menüsü
                            </h2>

                            {menuItems.map((item) => {
                                const isActive = pathname === item.href ||
                                    (item.href !== '/admin' && pathname.startsWith(item.href));

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMenuOpen(false)}
                                        className={`block px-4 py-3 font-black uppercase border-4 border-black transition-all ${isActive
                                            ? `${item.color} shadow-neo`
                                            : 'bg-white hover:shadow-neo'
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}

                            <div className="pt-4 mt-4 border-t-4 border-black">
                                <Link
                                    href="/"
                                    onClick={() => setMenuOpen(false)}
                                    className="block px-4 py-3 font-black uppercase border-4 border-black bg-neo-green hover:shadow-neo transition-all text-center"
                                >
                                    ← Siteye Dön
                                </Link>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
