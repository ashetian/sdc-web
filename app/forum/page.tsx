"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Clock, TrendingUp } from "lucide-react";
import { useLanguage } from "../_context/LanguageContext";

interface Category {
  _id: string;
  name: string;
  nameEn?: string;
  slug: string;
  description: string;
  descriptionEn?: string;
  icon: string;
  color: string;
  topicCount: number;
  lastTopicAt?: string;
}

interface Topic {
  _id: string;
  title: string;
  titleEn?: string;
  categoryId: {
    name: string;
    nameEn?: string;
    slug: string;
    icon: string;
    color: string;
  };
  authorId: {
    fullName: string;
    nickname?: string;
    avatar?: string;
  };
  upvotes: number;
  downvotes: number;
  replyCount: number;
  viewCount: number;
  isPinned: boolean;
  createdAt: string;
}

export default function ForumPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentTopics, setRecentTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  const labels = {
    tr: {
      title: "Forum",
      subtitle: "Sorularını sor, bilgini paylaş, topluluğa katıl",
      categories: "Kategoriler",
      recentTopics: "Son Konular",
      topics: "konu",
      replies: "yanıt",
      views: "görüntülenme",
      newTopic: "Yeni Konu",
      noCategories: "Henüz kategori yok",
      noTopics: "Henüz konu açılmamış",
      pinned: "Sabitlenmiş",
    },
    en: {
      title: "Forum",
      subtitle: "Ask questions, share knowledge, join the community",
      categories: "Categories",
      recentTopics: "Recent Topics",
      topics: "topics",
      replies: "replies",
      views: "views",
      newTopic: "New Topic",
      noCategories: "No categories yet",
      noTopics: "No topics yet",
      pinned: "Pinned",
    },
  };

  const l = labels[language] || labels.tr;

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, topicsRes] = await Promise.all([
          fetch("/api/forum/categories"),
          fetch("/api/forum/topics?limit=10"),
        ]);

        if (catRes.ok) {
          const cats = await catRes.json();
          setCategories(cats);
        }

        if (topicsRes.ok) {
          const data = await topicsRes.json();
          setRecentTopics(data.topics || []);
        }
      } catch (error) {
        console.error("Forum load error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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

    if (diffMins < 60) return `${diffMins}${language === "tr" ? " dk" : " min"}`;
    if (diffHours < 24) return `${diffHours}${language === "tr" ? " sa" : " hr"}`;
    return `${diffDays}${language === "tr" ? " gün" : " days"}`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-neo-cyan pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block bg-white border-4 border-black shadow-neo px-6 py-3 animate-pulse">
              <span className="text-xl font-black">{language === "tr" ? "Yükleniyor..." : "Loading..."}</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neo-cyan pt-24 pb-16 px-4 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <div>
            <h1 className="inline-block text-4xl sm:text-5xl font-black text-black mb-2 bg-white border-4 border-black shadow-neo px-6 py-3 transform -rotate-1">
              {l.title}
            </h1>
            <p className="text-lg font-bold text-black mt-4 max-w-xl">{l.subtitle}</p>
          </div>
          <Link
            href="/forum/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neo-green border-4 border-black shadow-neo font-black uppercase hover:-translate-y-1 hover:shadow-neo-lg transition-all"
          >
            <MessageSquare size={20} />
            {l.newTopic}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categories */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black text-black mb-6 uppercase flex items-center gap-2">
              <span className="bg-neo-yellow border-2 border-black px-3 py-1">{l.categories}</span>
            </h2>

            {categories.length === 0 ? (
              <div className="bg-white border-4 border-black shadow-neo p-8 text-center">
                <p className="text-lg font-bold text-black/60">{l.noCategories}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/forum/${cat.slug}`}
                    className={`${cat.color} border-4 border-black shadow-neo p-5 hover:-translate-y-1 hover:shadow-neo-lg transition-all`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{cat.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-black text-black truncate">
                          {getTitle(cat)}
                        </h3>
                        <p className="text-sm font-medium text-black/70 line-clamp-2 mt-1">
                          {getDescription(cat)}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm font-bold text-black/60">
                          <span>{cat.topicCount} {l.topics}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Topics Sidebar */}
          <div>
            <h2 className="text-2xl font-black text-black mb-6 uppercase flex items-center gap-2">
              <span className="bg-neo-pink border-2 border-black px-3 py-1">{l.recentTopics}</span>
            </h2>

            {recentTopics.length === 0 ? (
              <div className="bg-white border-4 border-black shadow-neo p-6 text-center">
                <p className="text-base font-bold text-black/60">{l.noTopics}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTopics.map((topic) => (
                  <Link
                    key={topic._id}
                    href={`/forum/topic/${topic._id}`}
                    className="block bg-white border-4 border-black shadow-neo p-4 hover:-translate-y-1 hover:shadow-neo-lg transition-all"
                  >
                    <div className="flex items-start gap-2">
                      {topic.isPinned && (
                        <span className="bg-neo-yellow text-black text-xs font-bold px-2 py-0.5 border border-black">
                          📌
                        </span>
                      )}
                      <h4 className="font-black text-black line-clamp-2 flex-1">
                        {getTitle(topic)}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs font-bold text-black/50">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(topic.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        {topic.replyCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp size={12} />
                        {topic.upvotes - topic.downvotes}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
