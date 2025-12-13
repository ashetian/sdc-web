'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SkeletonList, SkeletonPageHeader } from '@/app/_components/Skeleton';
import { Check } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/app/_components/ui';

interface Department {
    _id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
    order: number;
    isActive: boolean;
    leadId?: string | { _id: string, fullName: string, studentNo: string };
}

interface Member {
    _id: string;
    fullName: string;
    email: string;
    studentNo: string;
    avatar?: string;
}

const colorOptions = [
    { value: 'bg-neo-blue', label: 'Mavi' },
    { value: 'bg-neo-green', label: 'Yeşil' },
    { value: 'bg-neo-purple', label: 'Mor' },
    { value: 'bg-neo-pink', label: 'Pembe' },
    { value: 'bg-neo-yellow', label: 'Sarı' },
    { value: 'bg-neo-orange', label: 'Turuncu' },
];

const iconOptions = [
    { value: 'clipboard', label: 'Proje' },
    { value: 'code', label: 'Kod' },
    { value: 'camera', label: 'Medya' },
    { value: 'briefcase', label: 'Kurumsal' },
];

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [memberQuery, setMemberQuery] = useState('');
    const [foundMembers, setFoundMembers] = useState<Member[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: 'code',
        color: 'bg-neo-blue',
        order: 0,
        leadId: '',
    });

    useEffect(() => {
        if (memberQuery.length < 2) { setFoundMembers([]); return; }
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/members?search=${memberQuery}&limit=5`);
                if (res.ok) {
                    const data = await res.json();
                    setFoundMembers(data.members || []);
                }
            } catch (e) { console.error(e); }
        }, 300);
        return () => clearTimeout(timer);
    }, [memberQuery]);

    const handleSelectMember = (m: Member) => {
        setFormData(prev => ({
            ...prev,
            leadId: m._id,
        }));
        setMemberQuery('');
        setFoundMembers([]);
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/api/departments');
            if (res.ok) {
                const data = await res.json();
                setDepartments(data);
            }
        } catch (error) {
            console.error('Departmanlar yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingId ? `/api/departments/${editingId}` : '/api/departments';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchDepartments();
                resetForm();
            }
        } catch (error) {
            console.error('Departman kaydedilemedi:', error);
        }
    };

    const handleEdit = (dept: Department) => {
        setFormData({
            name: dept.name,
            description: dept.description,
            icon: dept.icon,
            color: dept.color,
            order: dept.order,
            leadId: typeof dept.leadId === 'object' ? dept.leadId._id : (dept.leadId || ''),
        });
        setEditingId(dept._id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu departmanı silmek istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchDepartments();
            }
        } catch (error) {
            console.error('Departman silinemedi:', error);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', description: '', icon: 'code', color: 'bg-neo-blue', order: 0, leadId: '' });
        setEditingId(null);
        setShowForm(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <SkeletonList items={5} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border-4 border-black shadow-neo p-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-black uppercase">Departman Yönetimi</h1>
                    <p className="text-gray-600 font-medium mt-1">Kulüp departmanlarını yönetin</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/admin/team"
                        className="bg-neo-purple text-white border-4 border-black shadow-neo px-6 py-3 font-black uppercase hover:bg-purple-400 hover:shadow-none transition-all"
                    >
                        Ekip Yönetimi
                    </Link>
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        variant="success"
                    >
                        {showForm ? 'İptal' : '+ Yeni Departman'}
                    </Button>
                </div>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white border-4 border-black shadow-neo p-6">
                    <h2 className="text-xl font-black text-black mb-4">
                        {editingId ? 'Departman Düzenle' : 'Yeni Departman'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Lead Selection */}
                        <div className="bg-gray-50 p-4 border-2 border-dashed border-gray-400 mb-4">
                            <label className="block text-sm font-black text-black uppercase mb-1">Departman Sorumlusu (Opsiyonel)</label>
                            <p className="text-xs text-gray-500 mb-2">Departman başkanını veya sorumlusunu seçin.</p>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Üye adı veya öğrenci no ara..."
                                    value={memberQuery}
                                    onChange={(e) => setMemberQuery(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-black"
                                />
                                {foundMembers.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 bg-white border-2 border-black border-t-0 max-h-40 overflow-y-auto z-10">
                                        {foundMembers.map(m => (
                                            <button
                                                key={m._id}
                                                type="button"
                                                onClick={() => handleSelectMember(m)}
                                                className="w-full text-left px-3 py-2 hover:bg-neo-yellow border-b border-gray-200 last:border-0 font-bold"
                                            >
                                                {m.fullName} ({m.studentNo})
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {formData.leadId && (
                                <div className="mt-2 text-sm text-green-600 font-black">
                                    <Check size={14} className="inline" /> Seçilen Üye ID: {formData.leadId}
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, leadId: '' }))} className="ml-2 text-red-500 underline">Kaldır</button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">İsim</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">Sıra</label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-black text-black uppercase mb-1">Açıklama</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">Renk</label>
                                <select
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                >
                                    {colorOptions.map((c) => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-black text-black uppercase mb-1">İkon</label>
                                <select
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                >
                                    {iconOptions.map((i) => (
                                        <option key={i.value} value={i.value}>{i.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button type="submit">
                                {editingId ? 'Güncelle' : 'Oluştur'}
                            </Button>
                            <Button
                                type="button"
                                onClick={resetForm}
                                variant="secondary"
                            >
                                İptal
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Department List */}
            <div className="bg-white border-4 border-black shadow-neo">
                {departments.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500 font-bold text-lg">Henüz departman bulunmuyor</p>
                    </div>
                ) : (
                    <div className="divide-y-4 divide-black">
                        {departments.map((dept) => (
                            <div key={dept._id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 ${dept.color} border-4 border-black flex items-center justify-center`}>
                                        <span className="text-2xl font-black">{dept.order + 1}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-black">{dept.name}</h3>
                                        <p className="text-gray-600 font-medium">{dept.description}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        href={`/admin/departments/${dept._id}/members`}
                                        className="px-4 py-2 bg-neo-yellow text-black border-2 border-black font-black text-sm hover:bg-yellow-400 transition-all flex items-center"
                                    >
                                        Üyeler
                                    </Link>
                                    <Button
                                        onClick={() => handleEdit(dept)}
                                        size="sm"
                                    >
                                        Düzenle
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(dept._id)}
                                        variant="danger"
                                        size="sm"
                                    >
                                        Sil
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
