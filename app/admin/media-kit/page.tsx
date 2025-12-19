'use client';

import { useState, useEffect } from 'react';
import { Plus, Copy, Trash2, Eye, EyeOff, ExternalLink, Clock, BarChart, Settings, X } from 'lucide-react';
import { Button, ConfirmModal } from '@/app/_components/ui';
import { SkeletonList, SkeletonPageHeader, SkeletonFullPage } from '@/app/_components/Skeleton';
import { useToast } from '@/app/_context/ToastContext';
import Image from 'next/image';

interface GalleryEvent {
    _id: string;
    title: string;
    titleEn?: string;
    galleryCover?: string;
}

interface MediaKitPage {
    _id?: string;
    title: string;
    titleEn?: string;
    eventIds: string[];
}

interface MediaKitToken {
    _id: string;
    token: string;
    sponsorName: string;
    email?: string;
    note?: string;
    isActive: boolean;
    expiresAt: string;
    viewCount: number;
    lastViewedAt?: string;
    createdBy: {
        fullName: string;
        nickname?: string;
    };
    createdAt: string;
}

export default function MediaKitAdminPage() {
    const { showToast } = useToast();
    const [tokens, setTokens] = useState<MediaKitToken[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Global Settings modal state
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [galleryEvents, setGalleryEvents] = useState<GalleryEvent[]>([]);
    const [loadingSettings, setLoadingSettings] = useState(false);

    // Form state
    const [sponsorName, setSponsorName] = useState('');
    const [email, setEmail] = useState('');
    const [note, setNote] = useState('');
    const [expiresInDays, setExpiresInDays] = useState(30);
    const [defaultLanguage, setDefaultLanguage] = useState<'tr' | 'en'>('tr');
    const [saving, setSaving] = useState(false);

    // Global settings form state
    const [settingsPageTitle, setSettingsPageTitle] = useState('');
    const [settingsPageTitleEn, setSettingsPageTitleEn] = useState('');
    const [settingsPages, setSettingsPages] = useState<MediaKitPage[]>([]);

    useEffect(() => {
        fetchTokens();
    }, []);

    const fetchTokens = async () => {
        try {
            const res = await fetch('/api/media-kit');
            if (res.ok) {
                const data = await res.json();
                setTokens(data);
            }
        } catch (error) {
            console.error('Tokens fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const openSettingsModal = async () => {
        setShowSettingsModal(true);
        setLoadingSettings(true);
        try {
            const res = await fetch('/api/media-kit/settings');
            if (res.ok) {
                const data = await res.json();
                setSettingsPageTitle(data.settings?.pageTitle || '');
                setSettingsPageTitleEn(data.settings?.pageTitleEn || '');
                setSettingsPages(data.settings?.pages || []);
                setGalleryEvents(data.galleryEvents || []);
            }
        } catch (error) {
            console.error('Settings fetch error:', error);
            showToast('Ayarlar yüklenemedi', 'error');
        } finally {
            setLoadingSettings(false);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/media-kit/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pageTitle: settingsPageTitle,
                    pageTitleEn: settingsPageTitleEn,
                    pages: settingsPages,
                }),
            });
            if (res.ok) {
                setShowSettingsModal(false);
                showToast('Ayarlar kaydedildi', 'success');
            } else {
                showToast('Kaydedilemedi', 'error');
            }
        } catch {
            showToast('Bir hata oluştu', 'error');
        } finally {
            setSaving(false);
        }
    };

    const addPage = () => {
        setSettingsPages(prev => [...prev, { title: '', titleEn: '', eventIds: [] }]);
    };

    const removePage = (index: number) => {
        setSettingsPages(prev => prev.filter((_, i) => i !== index));
    };

    const updatePageTitle = (index: number, title: string, isEn: boolean = false) => {
        setSettingsPages(prev => prev.map((page, i) =>
            i === index ? { ...page, [isEn ? 'titleEn' : 'title']: title } : page
        ));
    };

    const toggleEventInPage = (pageIndex: number, eventId: string) => {
        setSettingsPages(prev => prev.map((page, i) => {
            if (i !== pageIndex) return page;
            const eventIds = page.eventIds.includes(eventId)
                ? page.eventIds.filter(id => id !== eventId)
                : page.eventIds.length < 4
                    ? [...page.eventIds, eventId]
                    : page.eventIds; // Max 4 events
            return { ...page, eventIds };
        }));
    };

    const handleCreate = async () => {
        if (!sponsorName.trim()) {
            showToast('Sponsor adı zorunlu', 'error');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/media-kit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sponsorName, email, note, expiresInDays, defaultLanguage }),
            });

            if (res.ok) {
                const newToken = await res.json();
                setShowModal(false);
                setSponsorName('');
                setEmail('');
                setNote('');
                setExpiresInDays(30);
                setDefaultLanguage('tr');
                fetchTokens();

                // Auto-copy link
                const link = `${window.location.origin}/media-kit?token=${newToken.token}`;
                navigator.clipboard.writeText(link);
                showToast('Token oluşturuldu ve link kopyalandı!', 'success');
            } else {
                const data = await res.json();
                showToast(data.error || 'Token oluşturulamadı', 'error');
            }
        } catch (error) {
            showToast('Bir hata oluştu', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/media-kit/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setDeleteConfirm(null);
                fetchTokens();
                showToast('Token silindi', 'success');
            }
        } catch (error) {
            showToast('Silinemedi', 'error');
        }
    };

    const toggleActive = async (token: MediaKitToken) => {
        try {
            await fetch(`/api/media-kit/${token._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...token, isActive: !token.isActive }),
            });
            fetchTokens();
        } catch (error) {
            console.error('Toggle error:', error);
        }
    };

    const copyLink = (token: string) => {
        const link = `${window.location.origin}/media-kit?token=${token}`;
        navigator.clipboard.writeText(link);
        showToast('Link kopyalandı!', 'success');
    };

    const openLink = (token: string) => {
        const link = `${window.location.origin}/media-kit?token=${token}`;
        window.open(link, '_blank');
    };

    const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <SkeletonFullPage>
                <SkeletonPageHeader />
                <SkeletonList items={4} />
            </SkeletonFullPage>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black text-black">Media Kit Linkleri</h1>
                    <p className="text-gray-600 mt-1">Sponsorlar için özel media kit linkleri oluşturun</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={openSettingsModal} variant="secondary">
                        <Settings size={20} />
                        Sayfa Ayarları
                    </Button>
                    <Button onClick={() => setShowModal(true)} variant="success">
                        <Plus size={20} />
                        Yeni Link
                    </Button>
                </div>
            </div>

            {tokens.length === 0 ? (
                <div className="bg-white border-4 border-black p-8 text-center">
                    <p className="text-gray-500">Henüz media kit linki oluşturulmamış.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tokens.map((token) => {
                        const expired = isExpired(token.expiresAt);
                        return (
                            <div
                                key={token._id}
                                className={`bg-white border-4 border-black p-4 ${!token.isActive || expired ? 'opacity-60' : ''
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg">{token.sponsorName}</h3>
                                            {expired && (
                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">
                                                    Süresi Doldu
                                                </span>
                                            )}
                                            {!token.isActive && (
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">
                                                    Pasif
                                                </span>
                                            )}
                                        </div>
                                        {token.email && (
                                            <p className="text-sm text-gray-500">{token.email}</p>
                                        )}
                                        {token.note && (
                                            <p className="text-sm text-gray-400 italic mt-1">{token.note}</p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <BarChart size={14} />
                                                {token.viewCount} görüntüleme
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                Son: {token.lastViewedAt ? formatDate(token.lastViewedAt) : '-'}
                                            </span>
                                            <span>Bitiş: {formatDate(token.expiresAt)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => copyLink(token.token)}
                                            className="p-2 bg-blue-100 border-2 border-black hover:bg-blue-200"
                                            title="Linki Kopyala"
                                        >
                                            <Copy size={18} />
                                        </button>
                                        <button
                                            onClick={() => openLink(token.token)}
                                            className="p-2 bg-gray-100 border-2 border-black hover:bg-gray-200"
                                            title="Önizle"
                                        >
                                            <ExternalLink size={18} />
                                        </button>
                                        <button
                                            onClick={() => toggleActive(token)}
                                            className={`p-2 border-2 border-black ${token.isActive ? 'bg-green-100' : 'bg-gray-100'
                                                }`}
                                            title={token.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                                        >
                                            {token.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(token._id)}
                                            className="p-2 bg-red-100 border-2 border-black text-red-600 hover:bg-red-200"
                                            title="Sil"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white border-4 border-black shadow-neo max-w-md w-full p-6">
                        <h2 className="text-2xl font-black mb-4">Yeni Media Kit Linki</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block font-bold mb-1">Sponsor Adı *</label>
                                <input
                                    type="text"
                                    value={sponsorName}
                                    onChange={(e) => setSponsorName(e.target.value)}
                                    className="w-full p-2 border-2 border-black"
                                    placeholder="Örn: ABC Teknoloji"
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-1">E-posta (opsiyonel)</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-2 border-2 border-black"
                                    placeholder="iletisim@firma.com"
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-1">Not (opsiyonel)</label>
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full p-2 border-2 border-black"
                                    placeholder="Dahili not..."
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-1">Geçerlilik Süresi</label>
                                <select
                                    value={expiresInDays}
                                    onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
                                    className="w-full p-2 border-2 border-black"
                                >
                                    <option value={7}>7 gün</option>
                                    <option value={14}>14 gün</option>
                                    <option value={30}>30 gün</option>
                                    <option value={60}>60 gün</option>
                                    <option value={90}>90 gün</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold mb-1">Varsayılan Dil</label>
                                <select
                                    value={defaultLanguage}
                                    onChange={(e) => setDefaultLanguage(e.target.value as 'tr' | 'en')}
                                    className="w-full p-2 border-2 border-black"
                                >
                                    <option value="tr">🇹🇷 Türkçe</option>
                                    <option value="en">🇬🇧 English</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <Button onClick={() => setShowModal(false)} variant="secondary">
                                İptal
                            </Button>
                            <Button onClick={handleCreate} isLoading={saving} variant="success">
                                Oluştur ve Linki Kopyala
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
                title="Token'ı Sil"
                message="Bu media kit linkini silmek istediğinizden emin misiniz? Bu link artık çalışmayacak."
                confirmText="Sil"
                cancelText="İptal"
                variant="danger"
            />

            {/* Global Settings Modal */}
            {showSettingsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
                    <div className="bg-white border-4 border-black shadow-neo max-w-2xl w-full p-6 my-8">
                        <h2 className="text-2xl font-black mb-4">Media Kit Sayfa Ayarları</h2>
                        <p className="text-gray-600 mb-4">
                            Tüm media kit sayfalarında görünecek içerikleri düzenleyin
                        </p>

                        {loadingSettings ? (
                            <div className="py-8 text-center text-gray-500">Yükleniyor...</div>
                        ) : (
                            <div className="space-y-4">
                                {/* Main Page Title */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-bold mb-1">Ana Başlık (TR)</label>
                                        <input
                                            type="text"
                                            value={settingsPageTitle}
                                            onChange={(e) => setSettingsPageTitle(e.target.value)}
                                            className="w-full p-2 border-2 border-black"
                                            placeholder="Örn: SDC Media Kit"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold mb-1">Ana Başlık (EN)</label>
                                        <input
                                            type="text"
                                            value={settingsPageTitleEn}
                                            onChange={(e) => setSettingsPageTitleEn(e.target.value)}
                                            className="w-full p-2 border-2 border-black"
                                            placeholder="Örn: SDC Media Kit"
                                        />
                                    </div>
                                </div>

                                {/* Pages Management */}
                                <div className="border-t-2 border-gray-200 pt-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="font-bold text-lg">
                                            Etkinlik Sayfaları ({settingsPages.length})
                                        </label>
                                        <Button onClick={addPage} variant="secondary" className="text-sm">
                                            <Plus size={16} /> Sayfa Ekle
                                        </Button>
                                    </div>

                                    {settingsPages.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">
                                            Henüz sayfa eklenmemiş. &quot;Sayfa Ekle&quot; butonuna tıklayın.
                                        </p>
                                    ) : (
                                        <div className="space-y-6 max-h-[400px] overflow-y-auto">
                                            {settingsPages.map((page: MediaKitPage, pageIndex: number) => (
                                                <div key={pageIndex} className="border-2 border-gray-300 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="font-bold text-blue-600">Sayfa {pageIndex + 1}</span>
                                                        <button
                                                            onClick={() => removePage(pageIndex)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>

                                                    {/* Page Titles */}
                                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                                        <input
                                                            type="text"
                                                            value={page.title}
                                                            onChange={(e) => updatePageTitle(pageIndex, e.target.value)}
                                                            className="p-2 border-2 border-gray-300 rounded text-sm"
                                                            placeholder="Sayfa Başlığı (TR)"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={page.titleEn || ''}
                                                            onChange={(e) => updatePageTitle(pageIndex, e.target.value, true)}
                                                            className="p-2 border-2 border-gray-300 rounded text-sm"
                                                            placeholder="Page Title (EN)"
                                                        />
                                                    </div>

                                                    {/* Event Selection for this page */}
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-2">
                                                            Etkinlik seçin (max 4): {page.eventIds.length}/4
                                                        </p>
                                                        <div className="grid grid-cols-4 gap-2">
                                                            {galleryEvents.map((event) => {
                                                                const isSelected = page.eventIds.includes(event._id);
                                                                const isDisabled = !isSelected && page.eventIds.length >= 4;
                                                                return (
                                                                    <div
                                                                        key={event._id}
                                                                        onClick={() => !isDisabled && toggleEventInPage(pageIndex, event._id)}
                                                                        className={`cursor-pointer rounded p-1 transition-all text-center ${isSelected
                                                                            ? 'border-2 border-green-500 bg-green-50'
                                                                            : isDisabled
                                                                                ? 'border border-gray-200 opacity-40 cursor-not-allowed'
                                                                                : 'border border-gray-200 hover:border-gray-400'
                                                                            }`}
                                                                    >
                                                                        {event.galleryCover ? (
                                                                            <Image
                                                                                src={event.galleryCover}
                                                                                alt={event.title}
                                                                                width={80}
                                                                                height={50}
                                                                                className="w-full h-12 object-cover rounded"
                                                                                unoptimized
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                                                                                ?
                                                                            </div>
                                                                        )}
                                                                        <p className="text-xs truncate mt-1">{event.title}</p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 mt-6">
                            <Button onClick={() => setShowSettingsModal(false)} variant="secondary">
                                İptal
                            </Button>
                            <Button onClick={handleSaveSettings} isLoading={saving} variant="success">
                                Kaydet
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
