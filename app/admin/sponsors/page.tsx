'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Edit2, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import { SkeletonList, SkeletonPageHeader, SkeletonFullPage } from "@/app/_components/Skeleton";
import { Button, ConfirmModal } from '@/app/_components/ui';

interface Sponsor {
    _id: string;
    name: string;
    nameEn?: string;
    description: string;
    descriptionEn?: string;
    logo: string;
    order: number;
    isActive: boolean;
}

export default function SponsorsAdminPage() {
    const router = useRouter();
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [nameEn, setNameEn] = useState('');
    const [description, setDescription] = useState('');
    const [descriptionEn, setDescriptionEn] = useState('');
    const [logo, setLogo] = useState('');
    const [order, setOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchSponsors();
    }, []);

    const fetchSponsors = async () => {
        try {
            const res = await fetch('/api/sponsors');
            if (res.ok) {
                const data = await res.json();
                setSponsors(data);
            }
        } catch (error) {
            console.error('Sponsors fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingSponsor(null);
        setName('');
        setNameEn('');
        setDescription('');
        setDescriptionEn('');
        setLogo('');
        setOrder(sponsors.length);
        setIsActive(true);
        setShowModal(true);
    };

    const openEditModal = (sponsor: Sponsor) => {
        setEditingSponsor(sponsor);
        setName(sponsor.name);
        setNameEn(sponsor.nameEn || '');
        setDescription(sponsor.description);
        setDescriptionEn(sponsor.descriptionEn || '');
        setLogo(sponsor.logo);
        setOrder(sponsor.order);
        setIsActive(sponsor.isActive);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!name || !description || !logo) {
            alert('İsim, açıklama ve logo gerekli');
            return;
        }

        setSaving(true);
        try {
            const url = editingSponsor
                ? `/api/sponsors/${editingSponsor._id}`
                : '/api/sponsors';
            const method = editingSponsor ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, nameEn, description, descriptionEn, logo, order, isActive }),
            });

            if (res.ok) {
                setShowModal(false);
                fetchSponsors();
            } else {
                const data = await res.json();
                alert(data.error || 'Bir hata oluştu');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('Bir hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/sponsors/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setDeleteConfirm(null);
                fetchSponsors();
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const toggleActive = async (sponsor: Sponsor) => {
        try {
            await fetch(`/api/sponsors/${sponsor._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...sponsor, isActive: !sponsor.isActive }),
            });
            fetchSponsors();
        } catch (error) {
            console.error('Toggle error:', error);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('folder', 'sdc-sponsors');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData,
            });

            if (res.ok) {
                const data = await res.json();
                setLogo(data.path || data.url);
            } else {
                alert('Logo yüklenemedi');
            }
        } catch (error) {
            console.error('Logo yükleme hatası:', error);
            alert('Logo yüklenirken bir hata oluştu');
        } finally {
            setUploading(false);
        }
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
                <h1 className="text-3xl font-black text-black">Sponsorlar</h1>
                <Button
                    onClick={openCreateModal}
                    variant="success"
                >
                    <Plus size={20} />
                    Yeni Sponsor
                </Button>
            </div>

            {sponsors.length === 0 ? (
                <div className="bg-white border-4 border-black p-8 text-center">
                    <p className="text-gray-500">Henüz sponsor eklenmemiş.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {sponsors.map((sponsor) => (
                        <div
                            key={sponsor._id}
                            className={`bg-white border-4 border-black p-4 flex items-center gap-4 ${!sponsor.isActive ? 'opacity-50' : ''
                                }`}
                        >
                            <GripVertical className="text-gray-400 cursor-grab" />
                            <div className="w-16 h-16 relative border-2 border-black bg-gray-100">
                                <Image
                                    src={sponsor.logo}
                                    alt={sponsor.name}
                                    fill
                                    className="object-contain p-1"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">{sponsor.name}</h3>
                                <p className="text-sm text-gray-600 line-clamp-1">{sponsor.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggleActive(sponsor)}
                                    className={`p-2 border-2 border-black ${sponsor.isActive ? 'bg-green-100' : 'bg-gray-100'
                                        }`}
                                    title={sponsor.isActive ? 'Aktif' : 'Pasif'}
                                >
                                    {sponsor.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                                <button
                                    onClick={() => openEditModal(sponsor)}
                                    className="p-2 bg-neo-blue border-2 border-black"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(sponsor._id)}
                                    className="p-2 bg-red-100 border-2 border-black text-red-600"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white border-4 border-black shadow-neo max-w-xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-2xl font-black mb-4">
                            {editingSponsor ? 'Sponsor Düzenle' : 'Yeni Sponsor'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block font-bold mb-1">Sponsor İsmi *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-2 border-2 border-black"
                                    placeholder="Örn: ABC Teknoloji"
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-1">Sponsor İsmi (EN)</label>
                                <input
                                    type="text"
                                    value={nameEn}
                                    onChange={(e) => setNameEn(e.target.value)}
                                    className="w-full p-2 border-2 border-black"
                                    placeholder="e.g. ABC Technology"
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-1">Açıklama *</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-2 border-2 border-black h-24"
                                    placeholder="Sponsor hakkında kısa açıklama..."
                                    maxLength={500}
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-1">Açıklama (EN)</label>
                                <textarea
                                    value={descriptionEn}
                                    onChange={(e) => setDescriptionEn(e.target.value)}
                                    className="w-full p-2 border-2 border-black h-24"
                                    placeholder="Short description about sponsor..."
                                    maxLength={500}
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-1">Logo *</label>
                                {logo ? (
                                    <div className="relative w-32 h-32 border-2 border-black mb-2">
                                        <Image src={logo} alt="Logo" fill className="object-contain p-2" />
                                        <button
                                            type="button"
                                            onClick={() => setLogo('')}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 flex items-center justify-center border-2 border-black"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                                            onChange={handleLogoUpload}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:text-sm file:font-bold file:bg-neo-yellow file:text-black hover:file:bg-yellow-300"
                                        />
                                        {uploading && <span className="text-sm text-blue-500 font-bold">Yükleniyor...</span>}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block font-bold mb-1">Sıra</label>
                                    <input
                                        type="number"
                                        value={order}
                                        onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                                        className="w-full p-2 border-2 border-black"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block font-bold mb-1">Durum</label>
                                    <label className="flex items-center gap-2 p-2 border-2 border-black cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isActive}
                                            onChange={(e) => setIsActive(e.target.checked)}
                                            className="w-5 h-5"
                                        />
                                        <span>Aktif</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <Button
                                onClick={() => setShowModal(false)}
                                variant="secondary"
                            >
                                İptal
                            </Button>
                            <Button
                                onClick={handleSave}
                                isLoading={saving}
                                variant="success"
                            >
                                Kaydet
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
                title="Sponsoru Sil"
                message="Bu sponsoru silmek istediğinizden emin misiniz?"
                confirmText="Sil"
                cancelText="İptal"
                variant="danger"
            />
        </div>
    );
}
