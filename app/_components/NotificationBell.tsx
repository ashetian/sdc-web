"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Bell, X, Check, CheckCheck } from "lucide-react";
import { useLanguage } from "../_context/LanguageContext";

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

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { language } = useLanguage();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Scroll lock for mobile modal
    useEffect(() => {
        if (isOpen && window.innerWidth < 640) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Fetch unread count
    const fetchCount = async () => {
        try {
            const res = await fetch('/api/notifications/count');
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.member);
            }
        } catch (error) {
            console.error('Error fetching notification count:', error);
        }
    };

    // Fetch notifications
    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/notifications?limit=10');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and polling
    useEffect(() => {
        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, []);

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    // Close dropdown on click outside (desktop only)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (window.innerWidth >= 640 && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Mark single notification as read and navigate
    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await fetch(`/api/notifications/${notification._id}/read`, { method: 'PATCH' });
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev =>
                prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
            );
        }
        if (notification.link) {
            router.push(notification.link);
            setIsOpen(false);
        }
    };

    // Mark all as read
    const handleMarkAllRead = async () => {
        await fetch('/api/notifications/read-all', { method: 'PATCH' });
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    // Delete notification
    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await fetch('/api/notifications', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        setNotifications(prev => prev.filter(n => n._id !== id));
        fetchCount();
    };

    // Format time
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return language === 'tr' ? 'Şimdi' : 'Just now';
        if (diffMins < 60) return `${diffMins} ${language === 'tr' ? 'dk önce' : 'min ago'}`;
        if (diffHours < 24) return `${diffHours} ${language === 'tr' ? 'saat önce' : 'h ago'}`;
        if (diffDays < 7) return `${diffDays} ${language === 'tr' ? 'gün önce' : 'd ago'}`;
        return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US');
    };

    // Notification list content (shared between desktop and mobile)
    const notificationContent = (
        <>
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-3 border-b-2 border-black bg-gray-50">
                <h3 className="font-black text-sm uppercase">
                    {language === 'tr' ? 'Bildirimler' : 'Notifications'}
                </h3>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                            <CheckCheck size={14} />
                            {language === 'tr' ? 'Tümünü Oku' : 'Mark All'}
                        </button>
                    )}
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="sm:hidden p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
                {loading ? (
                    <div className="p-3 space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex gap-3 animate-pulse">
                                <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Bell size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                            {language === 'tr' ? 'Bildirim yok' : 'No notifications'}
                        </p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            onTouchEnd={(e) => e.stopPropagation()}
                            className={`p-3 sm:p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors flex gap-3 ${!notification.isRead ? 'bg-blue-50' : ''
                                }`}
                            style={{ touchAction: 'auto' }}
                        >
                            {/* Read indicator */}
                            <div className="flex-shrink-0 mt-1">
                                {!notification.isRead ? (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                ) : (
                                    <Check size={12} className="text-gray-400" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">
                                    {language === 'en' && notification.titleEn
                                        ? notification.titleEn
                                        : notification.title}
                                </p>
                                <p className="text-xs text-gray-600 line-clamp-2">
                                    {language === 'en' && notification.messageEn
                                        ? notification.messageEn
                                        : notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {formatTime(notification.createdAt)}
                                </p>
                            </div>

                            {/* Delete button */}
                            <button
                                onClick={(e) => handleDelete(e, notification._id)}
                                onTouchEnd={(e) => e.stopPropagation()}
                                className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <button
                    onClick={() => {
                        router.push('/notifications');
                        setIsOpen(false);
                    }}
                    className="p-3 text-center text-sm font-bold text-blue-600 hover:bg-gray-50 border-t-2 border-black"
                >
                    {language === 'tr' ? 'Tümünü Gör' : 'View All'}
                </button>
            )}
        </>
    );

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                {/* Bell Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative p-2 bg-white border-2 border-black hover:shadow-neo transition-all"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-black">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Desktop Dropdown */}
                {isOpen && (
                    <div className="hidden sm:flex absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border-4 border-black shadow-neo z-50 max-h-[70vh] overflow-hidden flex-col">
                        {notificationContent}
                    </div>
                )}
            </div>

            {/* Mobile Full Screen Modal */}
            {mounted && isOpen && createPortal(
                <div
                    className="sm:hidden fixed inset-0 z-[100] bg-black/50 flex items-end"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setIsOpen(false);
                    }}
                    onTouchEnd={(e) => {
                        if (e.target === e.currentTarget) setIsOpen(false);
                    }}
                >
                    <div
                        className="w-full bg-white border-t-4 border-black rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-up"
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                    >
                        {/* Handle bar */}
                        <div className="flex justify-center py-2">
                            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                        </div>

                        {notificationContent}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
