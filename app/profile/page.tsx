'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FolderGit2, Bookmark, Home, LogOut } from 'lucide-react';
import { useLanguage } from '../_context/LanguageContext';

interface User {
    id: string;
    studentNo: string;
    fullName: string;
    nickname: string;
    avatar?: string;
    email: string;
    phone?: string;
    department?: string;
    profileVisibility: {
        showEmail: boolean;
        showPhone: boolean;
        showDepartment: boolean;
        showFullName: boolean;
    };
    lastLogin?: string;
}

// Pre-defined avatar options using DiceBear API
const AVATAR_STYLES = [
    'avataaars', 'bottts', 'pixel-art', 'lorelei', 'notionists', 'adventurer',
    'big-ears', 'croodles', 'fun-emoji', 'icons', 'identicon', 'miniavs'
];
const AVATAR_SEEDS = ['Felix', 'Aneka', 'Sasha', 'Milo', 'Luna', 'Oliver', 'Bella', 'Max'];

export default function ProfilePage() {
    const router = useRouter();
    const { language } = useLanguage();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);

    const labels = {
        tr: {
            projects: 'Projelerim',
            bookmarks: 'Kaydedilenler',
            home: 'Ana Sayfa',
            logout: 'Çıkış',
            changeAvatar: 'Avatar\'ı değiştirmek için tıklayın',
            pickAvatar: 'Avatar Seç',
            pickAvatarDesc: 'Profilinizde ve yorumlarınızda görünecek avatarı seçin:',
            resetDefault: 'Varsayılana Dön',
            close: 'Kapat',
            profileSettings: 'Profil Ayarları',
            nickname: 'Nickname (Görünen İsim)',
            nicknameDesc: 'Sitede bu isim görünür',
            privacySettings: 'Gizlilik Ayarları',
            privacyDesc: 'Profilinizde hangi bilgilerin görüneceğini seçin:',
            realName: 'Gerçek İsim',
            email: 'E-posta',
            phone: 'Telefon',
            department: 'Bölüm',
            notSpecified: 'Belirtilmemiş',
            saveChanges: 'Değişiklikleri Kaydet',
            saving: 'Kaydediliyor...',
            lastLogin: 'Son giriş:',
            profileUpdated: 'Profil güncellendi!',
            error: 'Bir hata oluştu',
            logoutError: 'Çıkış yapılamadı'
        },
        en: {
            projects: 'My Projects',
            bookmarks: 'Bookmarks',
            home: 'Home',
            logout: 'Logout',
            changeAvatar: 'Click to change avatar',
            pickAvatar: 'Choose Avatar',
            pickAvatarDesc: 'Choose an avatar to appear on your profile and comments:',
            resetDefault: 'Reset to Default',
            close: 'Close',
            profileSettings: 'Profile Settings',
            nickname: 'Nickname (Display Name)',
            nicknameDesc: 'This name appears on the site',
            privacySettings: 'Privacy Settings',
            privacyDesc: 'Choose what information appears on your profile:',
            realName: 'Real Name',
            email: 'Email',
            phone: 'Phone',
            department: 'Department',
            notSpecified: 'Not Specified',
            saveChanges: 'Save Changes',
            saving: 'Saving...',
            lastLogin: 'Last login:',
            profileUpdated: 'Profile updated!',
            error: 'An error occurred',
            logoutError: 'Logout failed'
        }
    };

    const l = labels[language];

    // Edit form state
    const [nickname, setNickname] = useState('');
    const [avatar, setAvatar] = useState('');
    const [visibility, setVisibility] = useState({
        showEmail: false,
        showPhone: false,
        showDepartment: true,
        showFullName: false,
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setNickname(data.user.nickname || '');
                setAvatar(data.user.avatar || '');
                setVisibility(data.user.profileVisibility || {
                    showEmail: false,
                    showPhone: false,
                    showDepartment: true,
                    showFullName: false,
                });
            } else {
                router.push('/auth/login');
            }
        } catch {
            router.push('/auth/login');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/api/auth/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nickname,
                    avatar,
                    profileVisibility: visibility,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(l.profileUpdated);
                setUser(prev => prev ? { ...prev, nickname, avatar, profileVisibility: visibility } : null);
            } else {
                setError(data.error || l.error);
            }
        } catch {
            setError(l.error);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/auth/login');
    };

    const generateAvatarUrl = (style: string, seed: string) => {
        return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`;
    };

    const getCurrentAvatar = () => {
        if (avatar) return avatar;
        return generateAvatarUrl('avataaars', user?.nickname || 'user');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-100 pt-36 pb-24 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-white border-4 border-black shadow-neo p-6 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
                        <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
                            <div
                                className="w-16 h-16 relative rounded-full border-2 border-black overflow-hidden bg-gray-100 cursor-pointer hover:ring-4 hover:ring-yellow-400 transition-all shrink-0"
                                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                                title={l.changeAvatar}
                            >
                                <Image
                                    src={getCurrentAvatar()}
                                    alt="Avatar"
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                />
                            </div>
                            <div className="text-left">
                                <h1 className="text-2xl font-black text-black">{user.nickname}</h1>
                                <p className="text-gray-500 text-sm">@{user.studentNo}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 flex-wrap justify-center md:justify-end w-full md:w-auto">
                            <Link
                                href="/profile/projects"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-neo-purple text-white font-bold border-2 border-black hover:shadow-neo whitespace-nowrap"
                            >
                                <FolderGit2 size={18} />
                                {l.projects}
                            </Link>
                            <Link
                                href="/profile/bookmarks"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-neo-yellow text-black font-bold border-2 border-black hover:shadow-neo whitespace-nowrap"
                            >
                                <Bookmark size={18} />
                                {l.bookmarks}
                            </Link>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-black font-bold border-2 border-black hover:bg-gray-300 whitespace-nowrap"
                            >
                                <Home size={18} />
                                {l.home}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-bold border-2 border-black hover:bg-red-600 whitespace-nowrap"
                            >
                                <LogOut size={18} />
                                {l.logout}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Avatar Picker */}
                {showAvatarPicker && (
                    <div className="bg-white border-4 border-black shadow-neo p-6 mb-6">
                        <h2 className="text-xl font-black text-black mb-4 border-b-2 border-black pb-2">
                            {l.pickAvatar}
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">
                            {l.pickAvatarDesc}
                        </p>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                            {AVATAR_STYLES.flatMap(style =>
                                AVATAR_SEEDS.slice(0, 4).map(seed => {
                                    const url = generateAvatarUrl(style, seed);
                                    const isSelected = avatar === url;
                                    return (
                                        <button
                                            key={`${style}-${seed}`}
                                            onClick={() => setAvatar(url)}
                                            className={`w-12 h-12 rounded-full border-2 overflow-hidden transition-all ${isSelected
                                                ? 'border-yellow-400 ring-4 ring-yellow-200'
                                                : 'border-black hover:border-yellow-400'
                                                }`}
                                        >
                                            <Image
                                                src={url}
                                                alt={`${style} avatar`}
                                                width={48}
                                                height={48}
                                                className="object-cover"
                                            />
                                        </button>
                                    );
                                })
                            )}
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => setAvatar('')}
                                className="px-4 py-2 bg-gray-200 text-black font-bold border-2 border-black hover:bg-gray-300 text-sm"
                            >
                                {l.resetDefault}
                            </button>
                            <button
                                onClick={() => setShowAvatarPicker(false)}
                                className="px-4 py-2 bg-black text-white font-bold border-2 border-black hover:bg-gray-800 text-sm"
                            >
                                {l.close}
                            </button>
                        </div>
                    </div>
                )}

                {/* Profile Settings */}
                <div className="bg-white border-4 border-black shadow-neo p-6 mb-6">
                    <h2 className="text-xl font-black text-black mb-4 border-b-2 border-black pb-2">
                        {l.profileSettings}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-black text-black mb-2">
                                {l.nickname}
                            </label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                            <p className="text-xs text-gray-500 mt-1">{l.nicknameDesc}</p>
                        </div>
                    </div>
                </div>

                {/* Privacy Settings */}
                <div className="bg-white border-4 border-black shadow-neo p-6 mb-6">
                    <h2 className="text-xl font-black text-black mb-4 border-b-2 border-black pb-2">
                        {l.privacySettings}
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        {l.privacyDesc}
                    </p>

                    <div className="space-y-3">
                        <label className="flex items-start sm:items-center gap-3 p-3 border-2 border-gray-200 hover:border-black cursor-pointer bg-gray-50/50 hover:bg-white transition-colors">
                            <input
                                type="checkbox"
                                checked={visibility.showFullName}
                                onChange={(e) => setVisibility(v => ({ ...v, showFullName: e.target.checked }))}
                                className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0"
                            />
                            <div className="flex flex-col sm:flex-row sm:items-baseline">
                                <span className="font-bold whitespace-nowrap">{l.realName}</span>
                                <span className="text-gray-500 text-sm sm:ml-2 break-all">({user.fullName})</span>
                            </div>
                        </label>

                        <label className="flex items-start sm:items-center gap-3 p-3 border-2 border-gray-200 hover:border-black cursor-pointer bg-gray-50/50 hover:bg-white transition-colors">
                            <input
                                type="checkbox"
                                checked={visibility.showEmail}
                                onChange={(e) => setVisibility(v => ({ ...v, showEmail: e.target.checked }))}
                                className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0"
                            />
                            <div className="flex flex-col sm:flex-row sm:items-baseline">
                                <span className="font-bold whitespace-nowrap">{l.email}</span>
                                <span className="text-gray-500 text-sm sm:ml-2 break-all">({user.email})</span>
                            </div>
                        </label>

                        <label className="flex items-start sm:items-center gap-3 p-3 border-2 border-gray-200 hover:border-black cursor-pointer bg-gray-50/50 hover:bg-white transition-colors">
                            <input
                                type="checkbox"
                                checked={visibility.showPhone}
                                onChange={(e) => setVisibility(v => ({ ...v, showPhone: e.target.checked }))}
                                className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0"
                            />
                            <div className="flex flex-col sm:flex-row sm:items-baseline">
                                <span className="font-bold whitespace-nowrap">{l.phone}</span>
                                <span className="text-gray-500 text-sm sm:ml-2 break-all">({user.phone || l.notSpecified})</span>
                            </div>
                        </label>

                        <label className="flex items-start sm:items-center gap-3 p-3 border-2 border-gray-200 hover:border-black cursor-pointer bg-gray-50/50 hover:bg-white transition-colors">
                            <input
                                type="checkbox"
                                checked={visibility.showDepartment}
                                onChange={(e) => setVisibility(v => ({ ...v, showDepartment: e.target.checked }))}
                                className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0"
                            />
                            <div className="flex flex-col sm:flex-row sm:items-baseline">
                                <span className="font-bold whitespace-nowrap">{l.department}</span>
                                <span className="text-gray-500 text-sm sm:ml-2 break-all">({user.department || l.notSpecified})</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="bg-red-100 border-2 border-red-500 p-4 mb-4 text-red-700">
                        {error}
                    </div>
                )}
                {message && (
                    <div className="bg-green-100 border-2 border-green-500 p-4 mb-4 text-green-700">
                        {message}
                    </div>
                )}

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-yellow-400 text-black font-black py-4 border-4 border-black hover:bg-yellow-500 disabled:opacity-50 transition-colors"
                >
                    {saving ? l.saving : l.saveChanges}
                </button>

                {/* Last Login Info */}
                {user.lastLogin && (
                    <p className="text-center text-gray-500 text-sm mt-4">
                        {l.lastLogin} {new Date(user.lastLogin).toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')}
                    </p>
                )}
            </div>
        </div>
    );
}
