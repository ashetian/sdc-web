"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Code2, Plus, Trash2, Edit, ExternalLink, Save, X, Loader2 } from "lucide-react";
import { SkeletonList, SkeletonPageHeader, SkeletonFullPage } from "@/app/_components/Skeleton";

interface TechStack {
    _id: string; // Changed from id to _id
    name: string;
    description: string;
    icon: string;
    color: string;
    template: string;
}

export default function CodeAdminPage() {
    const [stacks, setStacks] = useState<TechStack[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingStack, setEditingStack] = useState<TechStack | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [form, setForm] = useState<{
        name: string;
        description: string;
        icon: string;
        color: string;
        template: string;
    }>({
        name: "",
        description: "",
        icon: "📦",
        color: "bg-neo-blue",
        template: "",
    });

    const colorOptions = [
        "bg-neo-blue",
        "bg-neo-green",
        "bg-neo-pink",
        "bg-neo-yellow",
        "bg-neo-purple",
        "bg-neo-cyan",
        "bg-neo-orange",
    ];

    const iconOptions = ["⚛️", "🐍", "📝", "🚀", "💻", "🔧", "📦", "🎮", "🌐"];

    useEffect(() => {
        fetchStacks();
    }, []);

    const fetchStacks = async () => {
        try {
            const res = await fetch('/api/code');
            if (!res.ok) throw new Error('Failed to fetch stacks');
            const data = await res.json();
            setStacks(data);
        } catch (error) {
            console.error(error);
            alert('Stackler yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!form.name || !form.template) {
            alert("İsim ve template zorunludur");
            return;
        }

        setSubmitting(true);
        try {
            const url = editingStack ? `/api/code/${editingStack._id}` : '/api/code';
            const method = editingStack ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Bir hata oluştu');
            }

            await fetchStacks();
            resetForm();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu stack'i silmek istediğinize emin misiniz?")) return;

        try {
            const res = await fetch(`/api/code/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Silme işlemi başarısız');

            setStacks(stacks.filter(s => s._id !== id));
        } catch (error) {
            console.error(error);
            alert('Silinirken bir hata oluştu');
        }
    };

    const handleEdit = (stack: TechStack) => {
        setEditingStack(stack);
        setForm({
            name: stack.name,
            description: stack.description || "",
            icon: stack.icon,
            color: stack.color,
            template: stack.template,
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setEditingStack(null);
        setForm({
            name: "",
            description: "",
            icon: "📦",
            color: "bg-neo-blue",
            template: "",
        });
        setShowForm(false);
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
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black flex items-center gap-3">
                    <Code2 size={32} />
                    Kod Atölyesi Yönetimi
                </h1>
                <Link
                    href="/code"
                    className="px-4 py-2 bg-gray-100 border-2 border-black font-bold hover:bg-gray-200 flex items-center gap-2"
                >
                    <ExternalLink size={18} />
                    Sayfayı Görüntüle
                </Link>
            </div>

            {/* Add Button */}
            <button
                onClick={() => setShowForm(true)}
                className="mb-6 px-6 py-3 bg-neo-green border-4 border-black shadow-neo font-bold flex items-center gap-2 hover:-translate-y-1 transition-transform"
            >
                <Plus size={20} />
                Yeni Tech Stack Ekle
            </button>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-4 border-black shadow-neo p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black">
                                {editingStack ? "Stack Düzenle" : "Yeni Stack Ekle"}
                            </h2>
                            <button onClick={resetForm} className="p-2 hover:bg-gray-100">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block font-bold mb-1">İsim</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full p-2 border-2 border-black"
                                    placeholder="React / Next.js"
                                    disabled={submitting}
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-1">Açıklama</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full p-2 border-2 border-black"
                                    rows={2}
                                    placeholder="Modern web uygulamaları için..."
                                    disabled={submitting}
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-1">Template URL</label>
                                <input
                                    type="text"
                                    value={form.template}
                                    onChange={e => setForm({ ...form, template: e.target.value })}
                                    className="w-full p-2 border-2 border-black"
                                    placeholder="github/codespaces-react"
                                    disabled={submitting}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-bold mb-1">Icon</label>
                                    <div className="flex flex-wrap gap-2">
                                        {iconOptions.map(icon => (
                                            <button
                                                key={icon}
                                                type="button"
                                                onClick={() => setForm({ ...form, icon })}
                                                className={`w-10 h-10 text-xl border-2 border-black flex items-center justify-center ${form.icon === icon ? "bg-neo-yellow" : "bg-white"
                                                    }`}
                                                disabled={submitting}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-bold mb-1">Renk</label>
                                    <div className="flex flex-wrap gap-2">
                                        {colorOptions.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setForm({ ...form, color })}
                                                className={`w-8 h-8 ${color} border-2 ${form.color === color ? "border-black border-4" : "border-black"
                                                    }`}
                                                disabled={submitting}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={handleSave}
                                disabled={submitting}
                                className="px-6 py-2 bg-neo-green border-2 border-black font-bold flex items-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Kaydet
                            </button>
                            <button
                                onClick={resetForm}
                                disabled={submitting}
                                className="px-6 py-2 bg-gray-100 border-2 border-black font-bold disabled:opacity-50"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stacks List */}
            <div className="space-y-4">
                {stacks.map(stack => (
                    <div
                        key={stack._id}
                        className={`${stack.color} border-4 border-black shadow-neo p-5 flex items-center justify-between`}
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-4xl">{stack.icon}</span>
                            <div>
                                <h3 className="font-black text-lg">{stack.name}</h3>
                                <p className="text-sm text-black/70">{stack.description}</p>
                                <p className="text-xs text-black/50 mt-1">Template: {stack.template}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(stack)}
                                className="p-2 bg-white border-2 border-black hover:bg-gray-100"
                            >
                                <Edit size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(stack._id)}
                                className="p-2 bg-white border-2 border-black hover:bg-neo-pink"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {stacks.length === 0 && (
                <div className="bg-gray-100 border-4 border-black p-8 text-center">
                    <Code2 size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-xl font-bold text-gray-500">Henüz stack eklenmemiş</p>
                </div>
            )}
        </div>
    );
}
