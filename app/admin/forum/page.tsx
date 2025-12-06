"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquare, Plus, Check, X, Trash2, Edit, Pin, Lock,
  MessageCircle, Rocket, HelpCircle, Calendar, Briefcase, BookOpen,
  LucideIcon, Eye, Clock
} from "lucide-react";

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  MessageCircle, Rocket, HelpCircle, Calendar, Briefcase, BookOpen, MessageSquare,
};

const CategoryIcon = ({ name, size = 20 }: { name: string; size?: number }) => {
  const Icon = iconMap[name] || MessageCircle;
  return <Icon size={size} />;
};

interface Category {
  _id: string;
  name: string;
  nameEn?: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  topicCount: number;
  isActive: boolean;
}

interface Topic {
  _id: string;
  title: string;
  content: string;
  categoryId: { name: string; slug: string };
  authorId: { fullName: string; nickname?: string };
  isApproved: boolean;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
}

export default function ForumAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pendingTopics, setPendingTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "categories">("pending");
  
  // Category form
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "", nameEn: "", slug: "", description: "", descriptionEn: "",
    icon: "MessageCircle", color: "bg-neo-blue", order: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [catRes, pendingRes] = await Promise.all([
        fetch("/api/forum/categories"),
        fetch("/api/forum/topics?pending=true"),
      ]);

      if (catRes.ok) setCategories(await catRes.json());
      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setPendingTopics(data.topics || []);
      }
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function approveTopic(id: string) {
    try {
      const res = await fetch(`/api/forum/topics/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      });
      if (res.ok) {
        setPendingTopics(prev => prev.filter(t => t._id !== id));
      }
    } catch (error) {
      console.error("Approve error:", error);
    }
  }

  async function rejectTopic(id: string) {
    if (!confirm("Bu konuyu silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/forum/topics/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPendingTopics(prev => prev.filter(t => t._id !== id));
      }
    } catch (error) {
      console.error("Reject error:", error);
    }
  }

  async function saveCategory() {
    try {
      const url = editingCategory 
        ? `/api/forum/categories/${editingCategory.slug}`
        : "/api/forum/categories";
      const method = editingCategory ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });

      if (res.ok) {
        await loadData();
        resetCategoryForm();
      } else {
        const error = await res.json();
        alert(error.error || "Hata oluştu");
      }
    } catch (error) {
      console.error("Save category error:", error);
    }
  }

  async function deleteCategory(slug: string) {
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/forum/categories/${slug}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadData();
      }
    } catch (error) {
      console.error("Delete category error:", error);
    }
  }

  function editCategory(cat: Category) {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      nameEn: cat.nameEn || "",
      slug: cat.slug,
      description: cat.description,
      descriptionEn: "",
      icon: cat.icon,
      color: cat.color,
      order: cat.order,
    });
    setShowCategoryForm(true);
  }

  function resetCategoryForm() {
    setEditingCategory(null);
    setCategoryForm({
      name: "", nameEn: "", slug: "", description: "", descriptionEn: "",
      icon: "MessageCircle", color: "bg-neo-blue", order: 0
    });
    setShowCategoryForm(false);
  }

  const iconOptions = ["MessageCircle", "Rocket", "HelpCircle", "Calendar", "Briefcase", "BookOpen"];
  const colorOptions = ["bg-neo-blue", "bg-neo-green", "bg-neo-pink", "bg-neo-yellow", "bg-neo-purple", "bg-neo-cyan"];

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block bg-neo-cyan border-4 border-black shadow-neo px-6 py-3 animate-pulse">
          <span className="text-xl font-black">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <MessageSquare size={32} />
          Forum Yönetimi
        </h1>
        <Link 
          href="/forum" 
          className="px-4 py-2 bg-gray-100 border-2 border-black font-bold hover:bg-gray-200"
        >
          Forumu Görüntüle →
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-6 py-3 font-bold border-4 border-black ${
            activeTab === "pending" 
              ? "bg-neo-yellow shadow-neo" 
              : "bg-white hover:bg-gray-100"
          }`}
        >
          Onay Bekleyenler ({pendingTopics.length})
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-6 py-3 font-bold border-4 border-black ${
            activeTab === "categories" 
              ? "bg-neo-cyan shadow-neo" 
              : "bg-white hover:bg-gray-100"
          }`}
        >
          Kategoriler ({categories.length})
        </button>
      </div>

      {/* Pending Topics Tab */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {pendingTopics.length === 0 ? (
            <div className="bg-gray-100 border-4 border-black p-8 text-center">
              <Check size={48} className="mx-auto mb-4 text-green-600" />
              <p className="text-xl font-bold">Onay bekleyen konu yok</p>
            </div>
          ) : (
            pendingTopics.map((topic) => (
              <div key={topic._id} className="bg-white border-4 border-black shadow-neo p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                      <span className="font-bold">{topic.categoryId?.name}</span>
                      <span>•</span>
                      <span>{topic.authorId?.nickname || topic.authorId?.fullName}</span>
                      <span>•</span>
                      <Clock size={14} />
                      <span>{new Date(topic.createdAt).toLocaleString("tr-TR")}</span>
                    </div>
                    <h3 className="text-lg font-black mb-2">{topic.title}</h3>
                    <p className="text-gray-700 line-clamp-3">{topic.content.substring(0, 300)}...</p>
                    <Link 
                      href={`/forum/topic/${topic._id}`}
                      className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 mt-2 hover:underline"
                    >
                      <Eye size={14} /> Detayları Gör
                    </Link>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => approveTopic(topic._id)}
                      className="px-4 py-2 bg-neo-green border-2 border-black font-bold flex items-center gap-2 hover:shadow-neo"
                    >
                      <Check size={18} /> Onayla
                    </button>
                    <button
                      onClick={() => rejectTopic(topic._id)}
                      className="px-4 py-2 bg-neo-pink border-2 border-black font-bold flex items-center gap-2 hover:shadow-neo"
                    >
                      <Trash2 size={18} /> Reddet
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div>
          <button
            onClick={() => setShowCategoryForm(true)}
            className="mb-6 px-6 py-3 bg-neo-green border-4 border-black shadow-neo font-bold flex items-center gap-2 hover:-translate-y-1 transition-transform"
          >
            <Plus size={20} /> Yeni Kategori Ekle
          </button>

          {/* Category Form Modal */}
          {showCategoryForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white border-4 border-black shadow-neo p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-black mb-6">
                  {editingCategory ? "Kategori Düzenle" : "Yeni Kategori"}
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold mb-1">Ad (TR)</label>
                      <input
                        type="text"
                        value={categoryForm.name}
                        onChange={e => setCategoryForm({...categoryForm, name: e.target.value})}
                        className="w-full p-2 border-2 border-black"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Ad (EN)</label>
                      <input
                        type="text"
                        value={categoryForm.nameEn}
                        onChange={e => setCategoryForm({...categoryForm, nameEn: e.target.value})}
                        className="w-full p-2 border-2 border-black"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Slug</label>
                    <input
                      type="text"
                      value={categoryForm.slug}
                      onChange={e => setCategoryForm({...categoryForm, slug: e.target.value})}
                      className="w-full p-2 border-2 border-black"
                      placeholder="kategori-slug"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Açıklama</label>
                    <textarea
                      value={categoryForm.description}
                      onChange={e => setCategoryForm({...categoryForm, description: e.target.value})}
                      className="w-full p-2 border-2 border-black"
                      rows={2}
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
                            onClick={() => setCategoryForm({...categoryForm, icon})}
                            className={`p-2 border-2 border-black ${
                              categoryForm.icon === icon ? "bg-neo-yellow" : "bg-white"
                            }`}
                          >
                            <CategoryIcon name={icon} size={20} />
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
                            onClick={() => setCategoryForm({...categoryForm, color})}
                            className={`w-8 h-8 ${color} border-2 ${
                              categoryForm.color === color ? "border-black border-4" : "border-black"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold mb-1">Sıra</label>
                    <input
                      type="number"
                      value={categoryForm.order}
                      onChange={e => setCategoryForm({...categoryForm, order: parseInt(e.target.value) || 0})}
                      className="w-24 p-2 border-2 border-black"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={saveCategory}
                    className="px-6 py-2 bg-neo-green border-2 border-black font-bold"
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={resetCategoryForm}
                    className="px-6 py-2 bg-gray-100 border-2 border-black font-bold"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="space-y-3">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className={`${cat.color} border-4 border-black shadow-neo p-4 flex items-center justify-between`}
              >
                <div className="flex items-center gap-4">
                  <CategoryIcon name={cat.icon} size={28} />
                  <div>
                    <h3 className="font-black text-lg">{cat.name}</h3>
                    <p className="text-sm text-black/60">{cat.description}</p>
                    <p className="text-xs text-black/50 mt-1">
                      {cat.topicCount} konu • Slug: {cat.slug}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editCategory(cat)}
                    className="p-2 bg-white border-2 border-black hover:bg-gray-100"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.slug)}
                    className="p-2 bg-white border-2 border-black hover:bg-neo-pink"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
