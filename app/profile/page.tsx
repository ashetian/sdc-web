'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SkeletonForm, SkeletonPageHeader, SkeletonFullPage } from "@/app/_components/Skeleton";
import Image from 'next/image';
import Link from 'next/link';
import { FolderGit2, Bookmark, Home, LogOut } from 'lucide-react';
import { useLanguage } from '../_context/LanguageContext';
import { Button, Alert } from '../_components/ui';
import type { User } from '../lib/types/api';

// Pre-defined avatar options using DiceBear API
const AVATAR_STYLES = [
    'avataaars', 'bottts', 'pixel-art', 'lorelei', 'notionists', 'adventurer',
    'big-ears', 'croodles', 'fun-emoji', 'icons', 'identicon', 'miniavs'
];
const AVATAR_SEEDS = ['Felix', 'Aneka', 'Sasha', 'Milo', 'Luna', 'Oliver', 'Bella', 'Max'];

export default function ProfilePage() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);

    // Edit form state
    const [nickname, setNickname] = useState('');
    const [avatar, setAvatar] = useState('');
    const [visibility, setVisibility] = useState({
        showEmail: false,
        showPhone: false,
        showDepartment: true,
        showFullName: false,
    });
    const [emailConsent, setEmailConsent] = useState(false);
    const [nativeLanguage, setNativeLanguage] = useState('tr');
    const [bio, setBio] = useState('');
    const [socialLinks, setSocialLinks] = useState({
        github: '',
        linkedin: '',
        twitter: '',
        website: '',
        instagram: ''
    });

    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        const file = e.target.files[0];
        const uploadForm = new FormData();
        uploadForm.append("file", file);

        setUploading(true);
        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: uploadForm,
            });

            if (!res.ok) throw new Error("Yükleme başarısız");

            const data = await res.json();
            setAvatar(data.path);
            setMessage(t('profile.page.avatarUploaded') || "Fotoğraf yüklendi");
        } catch (error) {
            console.error("Görsel yükleme hatası:", error);
            setError(t('profile.page.uploadError') || "Fotoğraf yüklenirken bir hata oluştu");
        } finally {
            setUploading(false);
        }
    };

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
                setEmailConsent(data.user.emailConsent || false);
                setNativeLanguage(data.user.nativeLanguage || 'tr');
                setBio(data.user.bio || '');
                setSocialLinks({
                    github: data.user.socialLinks?.github || '',
                    linkedin: data.user.socialLinks?.linkedin || '',
                    twitter: data.user.socialLinks?.twitter || '',
                    website: data.user.socialLinks?.website || '',
                    instagram: data.user.socialLinks?.instagram || '',
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
                    emailConsent,
                    nativeLanguage,
                    bio,
                    socialLinks
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(t('profile.page.profileUpdated'));
                setUser(prev => prev ? { ...prev, nickname, avatar, profileVisibility: visibility, bio, socialLinks } : null);
            } else {
                setError(data.error || t('profile.page.error'));
            }
        } catch {
            setError(t('profile.page.error'));
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
            <SkeletonFullPage>
                <SkeletonPageHeader />
                <SkeletonForm />
            </SkeletonFullPage>
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
                                title={t('profile.page.changeAvatar')}
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
                                {t('profile.page.projects')}
                            </Link>
                            <Link
                                href="/profile/bookmarks"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-neo-yellow text-black font-bold border-2 border-black hover:shadow-neo whitespace-nowrap"
                            >
                                <Bookmark size={18} />
                                {t('profile.page.bookmarks')}
                            </Link>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-black font-bold border-2 border-black hover:bg-gray-300 whitespace-nowrap"
                            >
                                <Home size={18} />
                                {t('profile.page.home')}
                            </Link>
                            <Button
                                onClick={handleLogout}
                                variant="danger"
                                size="md"
                                className="whitespace-nowrap"
                            >
                                <LogOut size={18} />
                                {t('profile.page.logout')}
                            </Button>
                        </div>
                    </div>
                </div>



                {/* Avatar Picker */}
                {/* Avatar Picker */}
                {showAvatarPicker && (
                    <div className="bg-white border-4 border-black shadow-neo p-6 mb-6">
                        <h2 className="text-xl font-black text-black mb-4 border-b-2 border-black pb-2">
                            {t('profile.page.pickAvatar')}
                        </h2>

                        {/* Custom Upload Section */}
                        <div className="mb-6">
                            <h3 className="font-bold text-sm mb-2">{t('profile.page.uploadCustom') || "Kendi Fotoğrafını Yükle"}</h3>
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                {/* Upload Box */}
                                <label className={`
                                    flex-1 flex flex-col items-center justify-center w-full h-32 
                                    border-4 border-dashed rounded-lg cursor-pointer transition-all
                                    ${uploading ? 'bg-gray-100 border-gray-400' : 'bg-white border-gray-300 hover:border-black hover:bg-yellow-50'}
                                `}>
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {uploading ? (
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                                        ) : (
                                            <>
                                                <FolderGit2 className="w-8 h-8 mb-2 text-gray-500" />
                                                <p className="mb-1 text-sm text-gray-500 font-bold">
                                                    <span className="font-black text-black">Tıkla</span> veya sürükle
                                                </p>
                                                <p className="text-xs text-gray-400">JPEG, PNG, WEBP (Max 5MB)</p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                </label>

                                {/* Preview of Selected/Current Avatar */}
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase">ÖNİZLEME</span>
                                    <div className="w-24 h-24 rounded-full border-4 border-black overflow-hidden bg-gray-100 relative shadow-neo">
                                        <Image
                                            src={avatar || generateAvatarUrl('avataaars', 'preview')}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-px bg-gray-200 flex-1"></div>
                            <span className="text-xs text-gray-400 font-bold uppercase">VEYA HAZIR AVATAR SEÇ</span>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            {t('profile.page.pickAvatarDesc')}
                        </p>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-6">
                            {AVATAR_STYLES.flatMap(style =>
                                AVATAR_SEEDS.slice(0, 4).map(seed => {
                                    const url = generateAvatarUrl(style, seed);
                                    const isSelected = avatar === url;
                                    return (
                                        <button
                                            key={`${style}-${seed}`}
                                            onClick={() => setAvatar(url)}
                                            className={`w-12 h-12 rounded-full border-2 overflow-hidden transition-all ${isSelected
                                                ? 'border-yellow-400 ring-4 ring-yellow-200 scale-110'
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

                        <div className="flex justify-between items-center pt-4 border-t-2 border-gray-100">
                            <button
                                onClick={() => setAvatar('')}
                                className="text-xs text-red-500 font-bold hover:underline"
                            >
                                {t('profile.page.resetDefault')}
                            </button>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAvatarPicker(false)}
                                    className="px-4 py-2 bg-gray-200 text-black font-bold border-2 border-black hover:bg-gray-300 text-sm"
                                >
                                    {t('profile.page.close')}
                                </button>
                                <button
                                    onClick={() => {
                                        handleSave(); // Explicitly save when confirming from modal
                                        setShowAvatarPicker(false);
                                    }}
                                    className="px-6 py-2 bg-yellow-400 text-black font-black border-2 border-black hover:bg-yellow-500 text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all"
                                >
                                    KAYDET VE GÜNCELLE
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Profile Settings */}
                <div className="bg-white border-4 border-black shadow-neo p-6 mb-6">
                    <h2 className="text-xl font-black text-black mb-4 border-b-2 border-black pb-2">
                        {t('profile.page.profileSettings')}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-black text-black mb-2">
                                {t('profile.page.nickname')}
                            </label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                            <p className="text-xs text-gray-500 mt-1">{t('profile.page.nicknameDesc')}</p>
                        </div>
                    </div>
                </div>

                {/* Privacy Settings */}
                <div className="bg-white border-4 border-black shadow-neo p-6 mb-6">
                    <h2 className="text-xl font-black text-black mb-4 border-b-2 border-black pb-2">
                        {t('profile.page.privacySettings')}
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        {t('profile.page.privacyDesc')}
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
                                <span className="font-bold whitespace-nowrap">{t('profile.page.realName')}</span>
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
                                <span className="font-bold whitespace-nowrap">{t('profile.page.email')}</span>
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
                                <span className="font-bold whitespace-nowrap">{t('profile.page.phone')}</span>
                                <span className="text-gray-500 text-sm sm:ml-2 break-all">({user.phone || t('profile.page.notSpecified')})</span>
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
                                <span className="font-bold whitespace-nowrap">{t('profile.page.department')}</span>
                                <span className="text-gray-500 text-sm sm:ml-2 break-all">({user.department || t('profile.page.notSpecified')})</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Language Settings */}
                <div className="bg-white border-4 border-black shadow-neo p-6 mb-6">
                    <h2 className="text-xl font-black text-black mb-4 border-b-2 border-black pb-2">
                        {t('profile.page.languagePref')}
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        {t('profile.page.languageDesc')}
                    </p>
                    <select
                        value={nativeLanguage}
                        onChange={(e) => setNativeLanguage(e.target.value)}
                        className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                    >
                        <option value="tr">{t('profile.page.turkish')}</option>
                        <option value="en">{t('profile.page.english')}</option>
                    </select>
                </div>

                {/* Bio & Social */}
                <div className="bg-white border-4 border-black shadow-neo p-6 mb-6">
                    <h2 className="text-xl font-black text-black mb-4 border-b-2 border-black pb-2">
                        {t('profile.page.bio')} & {t('profile.page.social')}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-black text-black mb-2">{t('profile.page.bio')}</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                maxLength={500}
                                rows={3}
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                            <p className="text-xs text-gray-500 mt-1 text-right">{bio.length}/500</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-black text-black mb-1">GitHub</label>
                                <input
                                    type="url"
                                    value={socialLinks.github}
                                    onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                                    placeholder="https://github.com/..."
                                    className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-black mb-1">LinkedIn</label>
                                <input
                                    type="url"
                                    value={socialLinks.linkedin}
                                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                                    placeholder="https://linkedin.com/in/..."
                                    className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-black mb-1">Twitter / X</label>
                                <input
                                    type="url"
                                    value={socialLinks.twitter}
                                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                                    placeholder="https://x.com/..."
                                    className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-black mb-1">Website</label>
                                <input
                                    type="url"
                                    value={socialLinks.website}
                                    onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-black mb-1">Instagram</label>
                                <input
                                    type="url"
                                    value={socialLinks.instagram}
                                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                                    placeholder="https://instagram.com/..."
                                    className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white border-4 border-black shadow-neo p-6 mb-6">
                    <h2 className="text-xl font-black text-black mb-4 border-b-2 border-black pb-2">
                        {t('profile.page.notificationSettings')}
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        {t('profile.page.notificationDesc')}
                    </p>

                    <div className="space-y-3">
                        <label className="flex items-start gap-3 p-3 border-2 border-gray-200 hover:border-black cursor-pointer bg-gray-50/50 hover:bg-white transition-colors">
                            <input
                                type="checkbox"
                                checked={emailConsent}
                                onChange={(e) => setEmailConsent(e.target.checked)}
                                className="w-5 h-5 shrink-0 mt-0.5"
                            />
                            <span className="font-medium text-sm leading-relaxed">{t('profile.page.allowEmails')}</span>
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
                    {saving ? t('profile.page.saving') : t('profile.page.saveChanges')}
                </button>

                {/* Last Login Info */}
                {user.lastLogin && (
                    <p className="text-center text-gray-500 text-sm mt-4">
                        {t('profile.page.lastLogin')} {new Date(user.lastLogin).toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')}
                    </p>
                )}
            </div>
        </div>
    );
}

