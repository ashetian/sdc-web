"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Send, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "../../_context/LanguageContext";

interface Category {
  _id: string;
  name: string;
  nameEn?: string;
  slug: string;
  icon: string;
  color: string;
}

function NewTopicForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { language } = useLanguage();

  const labels = {
    tr: {
      title: "Yeni Konu",
      backToForum: "← Forum",
      category: "Kategori",
      selectCategory: "Kategori seçin",
      topicTitle: "Başlık",
      titlePlaceholder: "Konunuzun başlığını yazın",
      content: "İçerik",
      contentPlaceholder: "Markdown desteklenir. Kodu ``` ile sarmalayın.",
      tags: "Etiketler",
      tagsPlaceholder: "virgül ile ayırın: react, nextjs, yardım",
      preview: "Önizleme",
      write: "Yaz",
      submit: "Konuyu Gönder",
      submitting: "Gönderiliyor...",
      loginRequired: "Konu açmak için giriş yapmalısınız",
      errorRequired: "Kategori, başlık ve içerik gerekli",
    },
    en: {
      title: "New Topic",
      backToForum: "← Forum",
      category: "Category",
      selectCategory: "Select category",
      topicTitle: "Title",
      titlePlaceholder: "Enter your topic title",
      content: "Content",
      contentPlaceholder: "Markdown supported. Wrap code with ```",
      tags: "Tags",
      tagsPlaceholder: "comma separated: react, nextjs, help",
      preview: "Preview",
      write: "Write",
      submit: "Submit Topic",
      submitting: "Submitting...",
      loginRequired: "Login required to create a topic",
      errorRequired: "Category, title and content are required",
    },
  };

  const l = labels[language] || labels.tr;

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/forum/categories");
        if (res.ok) {
          const cats = await res.json();
          setCategories(cats);
          // Pre-select category from URL
          const catParam = searchParams.get("category");
          if (catParam) {
            const found = cats.find((c: Category) => c.slug === catParam);
            if (found) setSelectedCategory(found.slug);
          }
        }
      } catch (error) {
        console.error("Categories load error:", error);
      }
    }

    loadCategories();
  }, [searchParams]);

  const getTitle = (item: { name?: string; nameEn?: string }) => {
    if (language === "en" && item.nameEn) return item.nameEn;
    return item.name || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedCategory || !title.trim() || !content.trim()) {
      setError(l.errorRequired);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/forum/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categorySlug: selectedCategory,
          title: title.trim(),
          content: content.trim(),
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      if (res.ok) {
        const topic = await res.json();
        router.push(`/forum/topic/${topic._id}`);
      } else {
        const data = await res.json();
        if (res.status === 401) {
          setError(l.loginRequired);
        } else {
          setError(data.error || "Bir hata oluştu");
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      setError("Bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-neo-lime pt-24 pb-16 px-4 overflow-x-hidden">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <Link
          href="/forum"
          className="inline-flex items-center gap-1 font-bold text-black hover:underline mb-6"
        >
          <ChevronLeft size={18} />
          {l.backToForum}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="inline-block text-3xl sm:text-4xl font-black text-black bg-white border-4 border-black shadow-neo px-6 py-3 transform -rotate-1">
            {l.title}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error */}
          {error && (
            <div className="bg-neo-pink border-4 border-black p-4">
              <p className="font-bold text-black">{error}</p>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-lg font-black text-black mb-2">
              {l.category}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-4 border-4 border-black font-bold bg-white focus:outline-none focus:shadow-neo"
            >
              <option value="">{l.selectCategory}</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.slug}>
                  {cat.icon} {getTitle(cat)}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-lg font-black text-black mb-2">
              {l.topicTitle}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={l.titlePlaceholder}
              maxLength={200}
              className="w-full p-4 border-4 border-black font-bold placeholder:text-gray-400 focus:outline-none focus:shadow-neo"
            />
            <div className="text-right text-sm font-medium text-black/50 mt-1">
              {title.length}/200
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-lg font-black text-black">{l.content}</label>
              <div className="flex border-2 border-black">
                <button
                  type="button"
                  onClick={() => setPreview(false)}
                  className={`px-4 py-1 font-bold ${
                    !preview ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  {l.write}
                </button>
                <button
                  type="button"
                  onClick={() => setPreview(true)}
                  className={`px-4 py-1 font-bold flex items-center gap-1 ${
                    preview ? "bg-black text-white" : "bg-white text-black"
                  }`}
                >
                  <Eye size={16} />
                  {l.preview}
                </button>
              </div>
            </div>

            {preview ? (
              <div className="min-h-[200px] p-4 border-4 border-black bg-white prose max-w-none">
                {content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                ) : (
                  <p className="text-gray-400 italic">{l.contentPlaceholder}</p>
                )}
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={l.contentPlaceholder}
                rows={10}
                maxLength={10000}
                className="w-full p-4 border-4 border-black font-mono text-sm placeholder:text-gray-400 resize-none focus:outline-none focus:shadow-neo"
              />
            )}
            <div className="text-right text-sm font-medium text-black/50 mt-1">
              {content.length}/10000
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-lg font-black text-black mb-2">
              {l.tags}
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={l.tagsPlaceholder}
              className="w-full p-4 border-4 border-black font-bold placeholder:text-gray-400 focus:outline-none focus:shadow-neo"
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border-4 border-black font-black text-xl uppercase transition-all ${
                submitting
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-neo-green shadow-neo hover:-translate-y-1 hover:shadow-neo-lg"
              }`}
            >
              <Send size={22} />
              {submitting ? l.submitting : l.submit}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function NewTopicPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-neo-lime pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center py-20">
          <div className="inline-block bg-white border-4 border-black shadow-neo px-6 py-3 animate-pulse">
            <span className="text-xl font-black">Yükleniyor...</span>
          </div>
        </div>
      </main>
    }>
      <NewTopicForm />
    </Suspense>
  );
}
