"use client";

import { useEffect, useState } from "react";

interface Stat {
    _id: string;
    key: string;
    label: string;
    value: string;
    color: string;
    order: number;
    isActive: boolean;
}

const colorOptions = [
    { value: "bg-neo-green", label: "Yeşil" },
    { value: "bg-neo-blue", label: "Mavi" },
    { value: "bg-neo-purple", label: "Mor" },
    { value: "bg-neo-pink", label: "Pembe" },
    { value: "bg-neo-yellow", label: "Sarı" },
    { value: "bg-neo-orange", label: "Turuncu" },
];

export default function StatsPage() {
    const [stats, setStats] = useState<Stat[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);

    const [formData, setFormData] = useState({
        key: "",
        label: "",
        value: "",
        color: "bg-neo-blue",
        order: 0,
        isActive: true,
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // Get all stats (not just active ones) for admin panel
            const res = await fetch("/api/stats");
            if (!res.ok) throw new Error("İstatistikler alınamadı");
            const data = await res.json();
            setStats(data.sort((a: Stat, b: Stat) => a.order - b.order));
        } catch (error) {
            console.error("İstatistikler yüklenirken hata:", error);
            alert("İstatistikler yüklenirken bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (stat: Stat) => {
        setEditing(stat._id);
        setFormData({
            key: stat.key,
            label: stat.label,
            value: stat.value,
            color: stat.color,
            order: stat.order,
            isActive: stat.isActive,
        });
    };

    const handleCreate = () => {
        setCreating(true);
        setFormData({
            key: "",
            label: "",
            value: "",
            color: "bg-neo-blue",
            order: stats.length,
            isActive: true,
        });
    };

    const handleCancel = () => {
        setEditing(null);
        setCreating(false);
        setFormData({
            key: "",
            label: "",
            value: "",
            color: "bg-neo-blue",
            order: 0,
            isActive: true,
        });
    };

    const handleSave = async () => {
        try {
            if (editing) {
                // Update existing stat
                const res = await fetch(`/api/stats/${editing}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        label: formData.label,
                        value: formData.value,
                        color: formData.color,
                        order: formData.order,
                        isActive: formData.isActive,
                    }),
                });

                if (!res.ok) throw new Error("İstatistik güncellenemedi");
                alert("İstatistik güncellendi");
            } else if (creating) {
                // Create new stat
                const res = await fetch("/api/stats", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                if (!res.ok) throw new Error("İstatistik eklenemedi");
                alert("İstatistik eklendi");
            }

            handleCancel();
            loadStats();
        } catch (error) {
            console.error("İşlem sırasında hata:", error);
            alert("İşlem sırasında bir hata oluştu");
        }
    };

    const handleDelete = async (id: string, label: string) => {
        if (window.confirm(`"${label}" istatistiğini silmek istediğinizden emin misiniz?`)) {
            try {
                const res = await fetch(`/api/stats/${id}`, {
                    method: "DELETE",
                });

                if (!res.ok) throw new Error("İstatistik silinemedi");

                alert("İstatistik silindi");
                loadStats();
            } catch (error) {
                console.error("İstatistik silinirken hata:", error);
                alert("İstatistik silinirken bir hata oluştu");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl text-gray-600">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Ana Sayfa İstatistikleri
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Ana sayfada görünen istatistik kartlarını yönetin
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    disabled={creating || editing !== null}
                >
                    Yeni İstatistik
                </button>
            </div>

            <div className="border-t border-gray-200">
                {/* Create Form */}
                {creating && (
                    <div className="px-4 py-4 bg-blue-50 border-b border-blue-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Yeni İstatistik Ekle
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Anahtar (Benzersiz ID)
                                </label>
                                <input
                                    type="text"
                                    value={formData.key}
                                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="örn: members, projects"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Etiket
                                </label>
                                <input
                                    type="text"
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="örn: Üye, Proje"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Değer
                                </label>
                                <input
                                    type="text"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="örn: 220+, 12"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Renk
                                </label>
                                <select
                                    value={formData.color}
                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    {colorOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sıra
                                </label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) =>
                                        setFormData({ ...formData, order: parseInt(e.target.value) })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    min="0"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) =>
                                        setFormData({ ...formData, isActive: e.target.checked })
                                    }
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">Aktif</label>
                            </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                            <button
                                onClick={handleSave}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Kaydet
                            </button>
                            <button
                                onClick={handleCancel}
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats List */}
                <div className="divide-y divide-gray-200">
                    {stats.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500">
                            Henüz istatistik bulunmuyor. Yeni bir istatistik ekleyerek başlayın.
                        </div>
                    ) : (
                        stats.map((stat) => (
                            <div key={stat._id} className="px-4 py-4">
                                {editing === stat._id ? (
                                    /* Edit Form */
                                    <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            İstatistiği Düzenle
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Anahtar (değiştirilemez)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.key}
                                                    disabled
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Etiket
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.label}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, label: e.target.value })
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Değer
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.value}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, value: e.target.value })
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Renk
                                                </label>
                                                <select
                                                    value={formData.color}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, color: e.target.value })
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                >
                                                    {colorOptions.map((opt) => (
                                                        <option key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Sıra
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.order}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, order: parseInt(e.target.value) })
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    min="0"
                                                />
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isActive}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, isActive: e.target.checked })
                                                    }
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                />
                                                <label className="ml-2 block text-sm text-gray-900">
                                                    Aktif
                                                </label>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex space-x-2">
                                            <button
                                                onClick={handleSave}
                                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                            >
                                                Kaydet
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                            >
                                                İptal
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* View Mode */
                                    <div className="flex items-center justify-between">
                                        <div className="flex-grow">
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className={`${stat.color} border-2 border-black px-4 py-2 font-bold`}
                                                >
                                                    {stat.value}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {stat.label}
                                                    </h3>
                                                    <div className="text-sm text-gray-500 space-x-2">
                                                        <span>Anahtar: {stat.key}</span>
                                                        <span>•</span>
                                                        <span>Sıra: {stat.order}</span>
                                                        <span>•</span>
                                                        <span className={stat.isActive ? "text-green-600" : "text-red-600"}>
                                                            {stat.isActive ? "Aktif" : "Pasif"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(stat)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                disabled={editing !== null || creating}
                                            >
                                                Düzenle
                                            </button>
                                            <button
                                                onClick={() => handleDelete(stat._id, stat.label)}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                disabled={editing !== null || creating}
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
