"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ChevronLeft, ThumbsUp, ThumbsDown, MessageSquare, Flag, Clock,
  Eye, Pin, Lock, Check, Send
} from "lucide-react";
import { useLanguage } from "../../../_context/LanguageContext";

interface Author {
  _id: string;
  fullName: string;
  nickname?: string;
  avatar?: string;
  department?: string;
}

interface Topic {
  _id: string;
  title: string;
  titleEn?: string;
  content: string;
  contentEn?: string;
  categoryId: {
    name: string;
    nameEn?: string;
    slug: string;
    icon: string;
    color: string;
  };
  authorId: Author;
  tags: string[];
  upvotes: number;
  downvotes: number;
  replyCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  userVote?: number | null;
  createdAt: string;
}

interface Reply {
  _id: string;
  authorId: Author;
  parentId?: string;
  content: string;
  upvotes: number;
  downvotes: number;
  isEdited: boolean;
  isBestAnswer: boolean;
  createdAt: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TopicPage({ params }: PageProps) {
  const { id } = use(params);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userVote, setUserVote] = useState<number | null>(null);
  const { language } = useLanguage();

  const labels = {
    tr: {
      backToCategory: "← Kategoriye Dön",
      backToForum: "← Forum",
      replies: "Yanıtlar",
      reply: "yanıt",
      views: "görüntülenme",
      pinned: "Sabitlenmiş",
      locked: "Kilitli",
      bestAnswer: "En İyi Yanıt",
      edited: "düzenlendi",
      writeReply: "Yanıtınızı yazın...",
      send: "Gönder",
      loginToReply: "Yanıt yazmak için giriş yapın",
      topicLocked: "Bu konu kilitli",
      report: "Raporla",
      noReplies: "Henüz yanıt yok. İlk yanıtı sen yaz!",
      notFound: "Konu bulunamadı",
    },
    en: {
      backToCategory: "← Back to Category",
      backToForum: "← Forum",
      replies: "Replies",
      reply: "reply",
      views: "views",
      pinned: "Pinned",
      locked: "Locked",
      bestAnswer: "Best Answer",
      edited: "edited",
      writeReply: "Write your reply...",
      send: "Send",
      loginToReply: "Login to reply",
      topicLocked: "This topic is locked",
      report: "Report",
      noReplies: "No replies yet. Be the first!",
      notFound: "Topic not found",
    },
  };

  const l = labels[language] || labels.tr;

  useEffect(() => {
    async function loadTopic() {
      try {
        // Add view=true to increment view count
        const res = await fetch(`/api/forum/topics/${id}?view=true`);
        if (res.ok) {
          const data = await res.json();
          setTopic(data.topic);
          setReplies(data.replies || []);
          setUserVote(data.topic?.userVote || null);
        }
      } catch (error) {
        console.error("Topic load error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTopic();
  }, [id]);

  const getTitle = (item: { title?: string; titleEn?: string; name?: string; nameEn?: string }) => {
    if (language === "en") {
      return item.titleEn || item.nameEn || item.title || item.name || "";
    }
    return item.title || item.name || "";
  };

  const getContent = (item: { content?: string; contentEn?: string }) => {
    if (language === "en" && item.contentEn) return item.contentEn;
    return item.content || "";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === "tr" ? "tr-TR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleVote = async (value: 1 | -1) => {
    try {
      const res = await fetch("/api/forum/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: "topic", contentId: id, value }),
      });

      if (res.ok) {
        const data = await res.json();
        setTopic((prev) =>
          prev ? { ...prev, upvotes: data.upvotes, downvotes: data.downvotes } : null
        );
        setUserVote(data.userVote);
      } else {
        const error = await res.json();
        alert(error.error || (language === "tr" ? "Oy verilemedi" : "Vote failed"));
      }
    } catch (error) {
      console.error("Vote error:", error);
      alert(language === "tr" ? "Bir hata oluştu" : "An error occurred");
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/forum/topics/${id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent }),
      });

      if (res.ok) {
        const newReply = await res.json();
        setReplies((prev) => [...prev, newReply]);
        setReplyContent("");
        if (topic) {
          setTopic({ ...topic, replyCount: topic.replyCount + 1 });
        }
      } else {
        const error = await res.json();
        alert(error.error || "Bir hata oluştu");
      }
    } catch (error) {
      console.error("Reply submit error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block bg-neo-cyan border-4 border-black shadow-neo px-6 py-3 animate-pulse">
              <span className="text-xl font-black">{language === "tr" ? "Yükleniyor..." : "Loading..."}</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!topic) {
    return (
      <main className="min-h-screen bg-white pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="bg-neo-pink border-4 border-black shadow-neo p-8">
            <h1 className="text-2xl font-black text-black">{l.notFound}</h1>
            <Link href="/forum" className="inline-block mt-4 font-bold text-black underline">
              {l.backToForum}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-24 pb-16 px-4 overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href={`/forum/${topic.categoryId.slug}`}
          className="inline-flex items-center gap-1 font-bold text-black hover:underline mb-6"
        >
          <ChevronLeft size={18} />
          {l.backToCategory}
        </Link>

        {/* Topic */}
        <article className="bg-neo-cyan border-4 border-black shadow-neo mb-8">
          {/* Header */}
          <div className="p-6 border-b-4 border-black">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <Link
                href={`/forum/${topic.categoryId.slug}`}
                className={`${topic.categoryId.color} text-sm font-bold px-3 py-1 border-2 border-black`}
              >
                {topic.categoryId.icon} {getTitle(topic.categoryId)}
              </Link>
              {topic.isPinned && (
                <span className="inline-flex items-center gap-1 bg-neo-yellow text-black text-sm font-bold px-3 py-1 border-2 border-black">
                  <Pin size={14} /> {l.pinned}
                </span>
              )}
              {topic.isLocked && (
                <span className="inline-flex items-center gap-1 bg-gray-300 text-black text-sm font-bold px-3 py-1 border-2 border-black">
                  <Lock size={14} /> {l.locked}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black">{getTitle(topic)}</h1>

            {/* Author & Meta */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-3">
                {topic.authorId.avatar ? (
                  <Image
                    src={topic.authorId.avatar}
                    alt={topic.authorId.nickname || topic.authorId.fullName}
                    width={40}
                    height={40}
                    className="border-2 border-black"
                  />
                ) : (
                  <div className="w-10 h-10 bg-neo-yellow border-2 border-black flex items-center justify-center font-black text-lg">
                    {(topic.authorId.nickname || topic.authorId.fullName)[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-bold text-black">
                    {topic.authorId.nickname || topic.authorId.fullName}
                  </div>
                  <div className="text-sm text-black/50 flex items-center gap-2">
                    <Clock size={12} />
                    {formatDate(topic.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 bg-white prose prose-lg max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {getContent(topic)}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          {topic.tags.length > 0 && (
            <div className="px-6 py-3 border-t-4 border-black bg-gray-50 flex flex-wrap gap-2">
              {topic.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/forum?tag=${tag}`}
                  className="bg-white border-2 border-black px-3 py-1 text-sm font-bold hover:bg-gray-100"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 border-t-4 border-black bg-gray-100 flex items-center justify-between flex-wrap gap-4">
            {/* Voting */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVote(1)}
                className={`p-2 border-2 border-black transition-all ${
                  userVote === 1
                    ? "bg-neo-green"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                <ThumbsUp size={20} />
              </button>
              <span className="font-black text-xl min-w-[40px] text-center">
                {topic.upvotes - topic.downvotes}
              </span>
              <button
                onClick={() => handleVote(-1)}
                className={`p-2 border-2 border-black transition-all ${
                  userVote === -1
                    ? "bg-neo-pink"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                <ThumbsDown size={20} />
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm font-bold text-black/50">
              <span className="flex items-center gap-1">
                <MessageSquare size={16} />
                {topic.replyCount} {l.reply}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={16} />
                {topic.viewCount} {l.views}
              </span>
              <button className="flex items-center gap-1 hover:text-black">
                <Flag size={16} />
                {l.report}
              </button>
            </div>
          </div>
        </article>

        {/* Replies Section */}
        <section>
          <h2 className="text-2xl font-black text-black mb-6 flex items-center gap-2">
            <span className="bg-neo-yellow border-2 border-black px-4 py-1">
              {l.replies} ({replies.length})
            </span>
          </h2>

          {replies.length === 0 ? (
            <div className="bg-gray-100 border-4 border-black p-8 text-center mb-8">
              <p className="font-bold text-black/60">{l.noReplies}</p>
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              {replies.map((reply) => (
                <article
                  key={reply._id}
                  className={`border-4 border-black shadow-neo ${
                    reply.isBestAnswer ? "bg-neo-green" : "bg-white"
                  }`}
                >
                  {reply.isBestAnswer && (
                    <div className="px-4 py-2 border-b-4 border-black bg-black text-white flex items-center gap-2">
                      <Check size={18} />
                      <span className="font-bold">{l.bestAnswer}</span>
                    </div>
                  )}
                  <div className="p-5">
                    {/* Author */}
                    <div className="flex items-center gap-3 mb-4">
                      {reply.authorId.avatar ? (
                        <Image
                          src={reply.authorId.avatar}
                          alt={reply.authorId.nickname || reply.authorId.fullName}
                          width={32}
                          height={32}
                          className="border-2 border-black"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-neo-yellow border-2 border-black flex items-center justify-center font-black">
                          {(reply.authorId.nickname || reply.authorId.fullName)[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <span className="font-bold text-black">
                          {reply.authorId.nickname || reply.authorId.fullName}
                        </span>
                        <span className="text-sm text-black/50 ml-2">
                          {formatDate(reply.createdAt)}
                          {reply.isEdited && ` (${l.edited})`}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="prose max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {reply.content}
                      </ReactMarkdown>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t-2 border-black">
                      <div className="flex items-center gap-2">
                        <button className="p-1 border border-black bg-white hover:bg-gray-100">
                          <ThumbsUp size={16} />
                        </button>
                        <span className="font-bold">{reply.upvotes - reply.downvotes}</span>
                        <button className="p-1 border border-black bg-white hover:bg-gray-100">
                          <ThumbsDown size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Reply Form */}
          {topic.isLocked ? (
            <div className="bg-gray-200 border-4 border-black p-6 text-center">
              <Lock size={24} className="mx-auto mb-2" />
              <p className="font-bold text-black/60">{l.topicLocked}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReply} className="bg-gray-100 border-4 border-black p-6">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={l.writeReply}
                rows={4}
                className="w-full p-4 border-4 border-black font-medium resize-none focus:outline-none focus:shadow-neo"
              />
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={submitting || !replyContent.trim()}
                  className={`inline-flex items-center gap-2 px-6 py-3 border-4 border-black font-black uppercase transition-all ${
                    submitting || !replyContent.trim()
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-neo-green shadow-neo hover:-translate-y-1 hover:shadow-neo-lg"
                  }`}
                >
                  <Send size={18} />
                  {l.send}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
