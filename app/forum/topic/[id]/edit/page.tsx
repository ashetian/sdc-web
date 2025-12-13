"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Send, Eye, AlertTriangle } from "lucide-react";
import { SkeletonForm, SkeletonPageHeader, SkeletonFullPage } from "@/app/_components/Skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "../../../../_context/LanguageContext";
import { useToast } from "../../../../_context/ToastContext";
import { Button, Alert } from "../../../../_components/ui";

interface Category {
    _id: string;
    name: string;
    nameEn?: string;
    slug: string;
    icon: string;
    color: string;
}

function EditTopicForm() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [preview, setPreview] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [revisionMessage, setRevisionMessage] = useState<string | null>(null);

    const { language } = useLanguage();
    const { showToast } = useToast();

    const labels = {
        tr: {
            title: "Konuyu Düzenle",
            backToTopic: "← Konuya Dön",
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
            submit: "Kaydet",
            submitting: "Kaydediliyor...",
            errorRequired: "Kategori, başlık ve içerik gerekli",
            revisionRequest: 'Düzeltme İsteği',
            revisionNote: 'Admin bu konu için şu düzeltmeleri istedi:',
            success: 'Konu güncellendi'
        },
        en: {
            title: "Edit Topic",
            backToTopic: "← Back into Topic",
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
            submit: "Save",
            submitting: "Saving...",
            errorRequired: "Category, title and content are required",
            revisionRequest: 'Revision Request',
            revisionNote: 'Admin requested the following revisions for this topic:',
            success: 'Topic updated'
        },
    };

    const l = labels[language] || labels.tr;

    useEffect(() => {
        async function init() {
            try {
                const [catRes, topicRes] = await Promise.all([
                    fetch("/api/forum/categories"),
                    fetch(`/api/forum/topics/${id}`)
                ]);

                if (catRes.ok) {
                    setCategories(await catRes.json());
                }

                if (topicRes.ok) {
                    const data = await topicRes.json();
                    const topic = data.topic;
                    setTitle(topic.title);
                    setContent(topic.content);
                    setSelectedCategory(topic.categoryId?.slug || ""); // Assuming populated category has slug, check API
                    // API populate categoryId with name nameEn slug icon color.
                    // But topic.categoryId is object now.
                    // Wait, if populated, setSelectedCategory expects slug?
                    // The select uses slug value.
                    if (topic.categoryId && typeof topic.categoryId === 'object') {
                        setSelectedCategory(topic.categoryId.slug);
                    } else if (typeof topic.categoryId === 'string') {
                        // Need to find slug from ID if possible, but API returns populated.
                        // If populated fails, might be ID. But API looks safe.
                    }

                    setTags(topic.tags ? topic.tags.join(", ") : "");

                    if (topic.status === 'revision_requested' && topic.revisionMessage) {
                        setRevisionMessage(topic.revisionMessage);
                    }
                } else {
                    setError("Konu bulunamadı");
                }
            } catch (e) {
                console.error(e);
                setError("Bir hata oluştu");
            } finally {
                setLoading(false);
            }
        }
        init();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim() || !selectedCategory) {
            setError(l.errorRequired);
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const selectedCatObj = categories.find(c => c.slug === selectedCategory);

            const res = await fetch(`/api/forum/topics/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    categoryId: selectedCatObj?._id, // Update category if needed? API PUT doesn't update category usually?
                    // Check API PUT implementation.
                    // app/api/forum/topics/[id]/route.ts PUT does not seem to take categoryId from body.
                    // It takes title, content, tags.
                    // So changing category might not be supported yet.
                    // Let's assume we can only edit content.
                    title,
                    content,
                    tags: tags.split(",").map(t => t.trim()).filter(Boolean),
                }),
            });

            if (res.ok) {
                showToast(l.success, "success");
                router.push(`/forum/topic/${id}`);
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || "Hata oluştu");
            }
        } catch (error) {
            setError("Bir hata oluştu");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <SkeletonForm />;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-black mb-6 font-bold"
            >
                <ChevronLeft size={20} />
                {l.backToTopic}
            </button>

            <h1 className="text-3xl font-black mb-8">{l.title}</h1>

            {revisionMessage && (
                <div className="bg-neo-yellow border-4 border-black p-4 mb-8 shadow-neo">
                    <div className="flex items-center gap-2 mb-2 font-black text-lg">
                        <AlertTriangle size={24} />
                        {l.revisionRequest}
                    </div>
                    <p className="font-bold mb-1">{l.revisionNote}</p>
                    <p className="bg-white/50 p-3 border-2 border-black border-dashed">
                        {revisionMessage}
                    </p>
                </div>
            )}

            <div className="bg-white border-4 border-black shadow-neo overflow-hidden">
                {/* Helper Tabs */}
                <div className="flex border-b-4 border-black bg-gray-100">
                    <button
                        onClick={() => setPreview(false)}
                        className={`flex-1 p-3 font-bold flex items-center justify-center gap-2 ${!preview ? "bg-white text-black" : "text-gray-500 hover:bg-gray-200"
                            }`}
                    >
                        <Send size={18} /> {l.write}
                    </button>
                    <button
                        onClick={() => setPreview(true)}
                        className={`flex-1 p-3 font-bold flex items-center justify-center gap-2 ${preview ? "bg-white text-black" : "text-gray-500 hover:bg-gray-200"
                            }`}
                    >
                        <Eye size={18} /> {l.preview}
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="bg-neo-pink border-2 border-black p-3 mb-6 font-bold text-center">
                            {error}
                        </div>
                    )}

                    {preview ? (
                        <article className="prose prose-lg max-w-none">
                            <h2 className="text-2xl font-black mb-4">{title}</h2>
                            <div className="min-h-[300px] border-2 border-dashed border-gray-300 p-4 rounded-lg">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {content}
                                </ReactMarkdown>
                            </div>
                        </article>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Category Selection - Disabled or hidden if not editable? Let's show it disabled or allow edit if desired */}
                            <div>
                                <label className="block font-bold mb-2">{l.category}</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full p-3 border-2 border-black font-bold focus:outline-none focus:ring-4 focus:ring-neo-blue/20 bg-gray-100 cursor-not-allowed"
                                    disabled // Disable category change for now
                                >
                                    <option value="">{l.selectCategory}</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat.slug}>
                                            {language === "en" ? cat.nameEn || cat.name : cat.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Kategori şimdilik değiştirilemez.</p>
                            </div>

                            <div>
                                <label className="block font-bold mb-2">{l.topicTitle}</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={l.titlePlaceholder}
                                    className="w-full p-3 border-2 border-black font-bold focus:outline-none focus:ring-4 focus:ring-neo-blue/20"
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-2">{l.content}</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={l.contentPlaceholder}
                                    className="w-full h-80 p-3 border-2 border-black font-mono focus:outline-none focus:ring-4 focus:ring-neo-blue/20 resize-y"
                                />
                            </div>

                            <div>
                                <label className="block font-bold mb-2">{l.tags}</label>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder={l.tagsPlaceholder}
                                    className="w-full p-3 border-2 border-black font-bold focus:outline-none focus:ring-4 focus:ring-neo-blue/20"
                                />
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    isLoading={submitting}
                                    variant="success"
                                    fullWidth
                                    size="lg"
                                >
                                    {l.submit}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function EditTopicPage() {
    return (
        <Suspense fallback={<SkeletonFullPage><SkeletonForm /></SkeletonFullPage>}>
            <EditTopicForm />
        </Suspense>
    );
}
