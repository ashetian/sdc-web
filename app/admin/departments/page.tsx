'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/app/_components/LoadingSpinner';

interface Department {
    _id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
    order: number;
    isActive: boolean;
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
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: 'code',
        color: 'bg-neo-blue',
        order: 0,
    });

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
        setFormData({ name: '', description: '', icon: 'code', color: 'bg-neo-blue', order: 0 });
        setEditingId(null);
        setShowForm(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
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
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-neo-green text-black border-4 border-black shadow-neo px-6 py-3 font-black uppercase hover:bg-white hover:shadow-none transition-all"
                    >
                        {showForm ? 'İptal' : '+ Yeni Departman'}
                    </button>
                </div>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white border-4 border-black shadow-neo p-6">
                    <h2 className="text-xl font-black text-black mb-4">
                        {editingId ? 'Departman Düzenle' : 'Yeni Departman'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                            <button
                                type="submit"
                                className="bg-black text-white border-4 border-black px-6 py-3 font-black uppercase hover:bg-white hover:text-black transition-all"
                            >
                                {editingId ? 'Güncelle' : 'Oluştur'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-200 text-black border-4 border-black px-6 py-3 font-black uppercase hover:bg-gray-300 transition-all"
                            >
                                İptal
                            </button>
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
                                    <button
                                        onClick={() => handleEdit(dept)}
                                        className="px-4 py-2 bg-neo-blue text-black border-2 border-black font-black text-sm hover:bg-blue-300 transition-all"
                                    >
                                        Düzenle
                                    </button>
                                    <button
                                        onClick={() => handleDelete(dept._id)}
                                        className="px-4 py-2 bg-red-500 text-white border-2 border-black font-black text-sm hover:bg-red-600 transition-all"
                                    >
                                        Sil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
