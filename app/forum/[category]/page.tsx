"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  MessageSquare, Clock, TrendingUp, Eye, ChevronLeft, Pin,
  MessageCircle, Rocket, HelpCircle, Calendar, Briefcase, BookOpen, LucideIcon
} from "lucide-react";
import { useLanguage } from "../../_context/LanguageContext";
import { SkeletonList, SkeletonPageHeader } from "../../_components/Skeleton";

// Icon mapping for dynamic rendering
const iconMap: Record<string, LucideIcon> = {
  MessageCircle, Rocket, HelpCircle, Calendar, Briefcase, BookOpen, MessageSquare,
};

const CategoryIcon = ({ name, size = 48 }: { name: string; size?: number }) => {
  const Icon = iconMap[name];
  if (Icon) {
    return <Icon size={size} className="text-black" />;
  }
  // Eğer iconMap'te yoksa emoji olabilir
  if (name && !iconMap[name]) {
    return <span className="text-5xl leading-none">{name}</span>;
  }
  return <MessageCircle size={size} className="text-black" />;
};

import type { ForumCategory, ForumTopic } from "../../lib/types/api";

// Use aliases to match local naming
type Category = ForumCategory;
type Topic = ForumTopic;

interface PageProps {
  params: Promise<{ category: string }>;
}

export default function CategoryPage({ params }: PageProps) {
  const { category: slug } = use(params);
  const [category, setCategory] = useState<Category | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { t, language } = useLanguage();

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/forum/categories/${slug}?sort=${sort}&page=${page}`);
        if (res.ok) {
          const data = await res.json();
          setCategory(data.category);
          setTopics(data.topics || []);
          setTotalPages(data.pagination?.totalPages || 1);
        }
      } catch (error) {
        console.error("Category load error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug, sort, page]);

  const getTitle = (item: { title?: string; titleEn?: string; name?: string; nameEn?: string }) => {
    if (language === "en") {
      return item.titleEn || item.nameEn || item.title || item.name || "";
    }
    return item.title || item.name || "";
  };

  const getDescription = (item: { description?: string; descriptionEn?: string }) => {
    if (language === "en" && item.descriptionEn) return item.descriptionEn;
    return item.description || "";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}${language === "tr" ? " dk önce" : " min ago"}`;
    if (diffHours < 24) return `${diffHours}${language === "tr" ? " sa önce" : " hr ago"}`;
    if (diffDays < 7) return `${diffDays}${language === "tr" ? " gün önce" : " days ago"}`;
    return date.toLocaleDateString(language === "tr" ? "tr-TR" : "en-US");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-neo-cyan pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <SkeletonPageHeader />
          <SkeletonList items={6} />
        </div>
      </main>
    );
  }

  if (!category) {
    return (
      <main className="min-h-screen bg-neo-cyan pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="bg-white border-4 border-black shadow-neo p-8">
            <h1 className="text-2xl font-black text-black">{t('forum.category.notFound')}</h1>
            <Link href="/forum" className="inline-block mt-4 font-bold text-black underline">
              {t('forum.category.backToForum')}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neo-cyan pt-24 pb-16 px-4 overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link href="/forum" className="inline-flex items-center gap-1 font-bold text-black hover:underline mb-6">
          <ChevronLeft size={18} />
          {t('forum.category.backToForum')}
        </Link>

        {/* Category Header */}
        <div className={`${category.color} border-4 border-black shadow-neo p-6 mb-8`}>
          <div className="flex items-start gap-4">
            <CategoryIcon name={category.icon || 'message-circle'} size={48} />
            <div className="flex-1">
              <h1 className="text-3xl font-black text-black">{getTitle(category)}</h1>
              <p className="text-base font-medium text-black/70 mt-2">{getDescription(category)}</p>
              <div className="flex items-center gap-4 mt-4 text-sm font-bold text-black/60">
                <span>{category.topicCount} {t('forum.page.topics')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Sort Buttons */}
          <div className="flex gap-2">
            {[
              { key: "latest", label: t('forum.category.sortLatest') },
              { key: "popular", label: t('forum.category.sortPopular') },
              { key: "active", label: t('forum.category.sortActive') }
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => { setSort(s.key); setPage(1); }}
                className={`px-4 py-2 font-bold border-2 border-black transition-all ${sort === s.key
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-gray-100"
                  }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <Link
            href={`/forum/new?category=${slug}`}
            className="inline-flex items-center gap-2 px-5 py-2 bg-neo-green border-4 border-black shadow-neo font-black uppercase hover:-translate-y-1 hover:shadow-neo-lg transition-all"
          >
            <MessageSquare size={18} />
            {t('forum.category.newTopic')}
          </Link>
        </div>

        {/* Topics List */}
        {topics.length === 0 ? (
          <div className="bg-white border-4 border-black shadow-neo p-12 text-center">
            <p className="text-xl font-black text-black mb-2">{t('forum.category.noTopics')}</p>
            <p className="text-base font-medium text-black/60">{t('forum.category.beFirst')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topics.map((topic) => (
              <Link
                key={topic._id}
                href={`/forum/topic/${topic._id}`}
                className="block bg-white border-4 border-black shadow-neo p-5 hover:-translate-y-1 hover:shadow-neo-lg transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* Vote Score */}
                  <div className="flex flex-col items-center bg-gray-100 border-2 border-black px-2 py-1 min-w-[50px]">
                    <TrendingUp size={16} />
                    <span className="text-lg font-black">{(topic.upvotes ?? 0) - (topic.downvotes ?? 0)}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {topic.isPinned && (
                        <span className="inline-flex items-center gap-1 bg-neo-yellow text-black text-xs font-bold px-2 py-0.5 border border-black">
                          <Pin size={10} /> {t('forum.page.pinned')}
                        </span>
                      )}
                      {topic.isLocked && (
                        <span className="bg-gray-300 text-black text-xs font-bold px-2 py-0.5 border border-black">
                          🔒 {t('forum.category.locked')}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-black mt-1 line-clamp-1">{getTitle(topic)}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm font-medium text-black/50">
                      <span>{t('forum.category.by')} {topic.authorId?.nickname || topic.authorId?.fullName}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(topic.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        {topic.replyCount} {t('forum.page.replies')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {topic.viewCount} {t('forum.page.views')}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 font-bold border-2 border-black ${page === p ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
