"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, Trash2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "../_context/LanguageContext";
import GlobalLoading from "../_components/GlobalLoading";

interface Notification {
    _id: string;
    type: string;
    title: string;
    titleEn?: string;
    message: string;
    messageEn?: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
    actorId?: {
        nickname: string;
        avatar?: string;
    };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
    });
    const router = useRouter();
    const { language } = useLanguage();

    const labels = {
        tr: {
            title: "Bildirimler",
            noNotifications: "Henüz bildiriminiz yok",
            markAllRead: "Tümünü Okundu İşaretle",
            back: "Geri Dön",
            justNow: "Şimdi",
            minAgo: "dk önce",
            hoursAgo: "saat önce",
            daysAgo: "gün önce",
        },
        en: {
            title: "Notifications",
            noNotifications: "You don't have any notifications yet",
            markAllRead: "Mark All as Read",
            back: "Go Back",
            justNow: "Just now",
            minAgo: "min ago",
            hoursAgo: "h ago",
            daysAgo: "d ago",
        },
    };

    const l = labels[language];

    // Fetch notifications
    const fetchNotifications = async (page: number = 1) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/notifications?page=${page}&limit=20`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Mark single notification as read and navigate
    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await fetch(`/api/notifications/${notification._id}/read`, { method: "PATCH" });
            setNotifications((prev) =>
                prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
            );
        }
        if (notification.link) {
            router.push(notification.link);
        }
    };

    // Mark all as read
    const handleMarkAllRead = async () => {
        await fetch("/api/notifications/read-all", { method: "PATCH" });
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    // Delete notification
    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await fetch("/api/notifications", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        setNotifications((prev) => prev.filter((n) => n._id !== id));
    };

    // Format time
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return l.justNow;
        if (diffMins < 60) return `${diffMins} ${l.minAgo}`;
        if (diffHours < 24) return `${diffHours} ${l.hoursAgo}`;
        if (diffDays < 7) return `${diffDays} ${l.daysAgo}`;
        return date.toLocaleDateString(language === "tr" ? "tr-TR" : "en-US");
    };

    // Get notification icon based on type
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "comment_reply":
            case "project_comment":
                return "💬";
            case "comment_like":
            case "project_like":
                return "❤️";
            case "project_approved":
                return "✅";
            case "project_rejected":
                return "❌";
            case "new_announcement":
                return "📢";
            case "event_reminder":
                return "📅";
            case "welcome":
                return "👋";
            case "achievement":
                return "🏆";
            case "mention":
                return "@";
            case "security_alert":
                return "🔒";
            default:
                return "🔔";
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    if (loading) {
        return <GlobalLoading />;
    }

    return (
        <section className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-white border-4 border-black shadow-neo p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 border-2 border-black hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-2xl font-black uppercase">{l.title}</h1>
                                {unreadCount > 0 && (
                                    <p className="text-sm text-gray-600">
                                        {unreadCount} {language === "tr" ? "okunmamış" : "unread"}
                                    </p>
                                )}
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-bold border-2 border-black shadow-neo-sm hover:shadow-none transition-all"
                            >
                                <CheckCheck size={18} />
                                <span className="hidden sm:inline">{l.markAllRead}</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="bg-white border-4 border-black shadow-neo overflow-hidden">
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center">
                            <Bell size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="text-gray-500 font-medium">{l.noNotifications}</p>
                        </div>
                    ) : (
                        <div className="divide-y-2 divide-black">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors flex gap-4 ${!notification.isRead ? "bg-blue-50" : ""
                                        }`}
                                >
                                    {/* Icon */}
                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-100 border-2 border-black text-xl">
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-bold text-sm">
                                                {language === "en" && notification.titleEn
                                                    ? notification.titleEn
                                                    : notification.title}
                                            </p>
                                            {!notification.isRead && (
                                                <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                            {language === "en" && notification.messageEn
                                                ? notification.messageEn
                                                : notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {formatTime(notification.createdAt)}
                                        </p>
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => handleDelete(e, notification._id)}
                                        className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t-2 border-black bg-gray-50">
                            <button
                                onClick={() => fetchNotifications(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="flex items-center gap-1 px-3 py-2 font-bold border-2 border-black bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-neo-sm transition-all"
                            >
                                <ChevronLeft size={18} />
                                {language === "tr" ? "Önceki" : "Previous"}
                            </button>
                            <span className="font-bold text-sm">
                                {pagination.page} / {pagination.pages}
                            </span>
                            <button
                                onClick={() => fetchNotifications(pagination.page + 1)}
                                disabled={pagination.page >= pagination.pages}
                                className="flex items-center gap-1 px-3 py-2 font-bold border-2 border-black bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-neo-sm transition-all"
                            >
                                {language === "tr" ? "Sonraki" : "Next"}
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
