"use client";

import { useState, useRef, useEffect } from "react";
import { Bug, X, Send, CheckCircle } from "lucide-react";
import { createPortal } from "react-dom";
import { useLanguage } from "../_context/LanguageContext";

export default function BugReportButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { language, t } = useLanguage();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close dropdown on click outside (desktop only)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Lock scroll when modal open on mobile
    useEffect(() => {
        if (isOpen && window.innerWidth < 640) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Reset form when opening
    useEffect(() => {
        if (isOpen) {
            setTitle("");
            setDescription("");
            setError("");
            setSuccess(false);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !description.trim()) {
            setError(t('bugReport.fillFields'));
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch('/api/bug-reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    page: window.location.pathname,
                    browser: navigator.userAgent,
                }),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    setIsOpen(false);
                }, 2000);
            } else {
                const data = await res.json();
                setError(data.error || t('bugReport.error'));
            }
        } catch {
            setError(t('bugReport.connectionError'));
        } finally {
            setLoading(false);
        }
    };

    const formContent = (
        <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-black bg-red-50">
                <div className="flex items-center gap-2">
                    <Bug size={20} className="text-red-500" />
                    <h3 className="font-black text-base sm:text-sm uppercase">
                        {t('bugReport.title')}
                    </h3>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-red-100 transition-colors rounded-full"
                    type="button"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Form Content */}
            <div className="p-4 sm:p-4 flex-1 overflow-y-auto">
                {success ? (
                    <div className="flex flex-col items-center py-8 sm:py-6 text-center">
                        <CheckCircle size={56} className="text-green-500 mb-4 sm:mb-3" />
                        <p className="font-bold text-xl sm:text-lg">
                            {t('bugReport.thankYou')}
                        </p>
                        <p className="text-base sm:text-sm text-gray-600 mt-2">
                            {t('bugReport.feedbackReceived')}
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4">
                        <div>
                            <label className="block text-base sm:text-sm font-bold mb-2 sm:mb-1">
                                {t('bugReport.titleLabel')}
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t('bugReport.titlePlaceholder')}
                                className="w-full px-4 py-3 sm:px-3 sm:py-2 text-base sm:text-sm border-2 border-black focus:outline-none focus:ring-2 focus:ring-red-300"
                                maxLength={200}
                                autoComplete="off"
                            />
                        </div>

                        <div>
                            <label className="block text-base sm:text-sm font-bold mb-2 sm:mb-1">
                                {t('bugReport.descriptionLabel')}
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t('bugReport.descriptionPlaceholder')}
                                rows={5}
                                className="w-full px-4 py-3 sm:px-3 sm:py-2 text-base sm:text-sm border-2 border-black focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                                maxLength={2000}
                            />
                        </div>

                        <p className="text-sm sm:text-xs text-gray-500">
                            {t('bugReport.pageLabel')} {typeof window !== 'undefined' ? window.location.pathname : ''}
                        </p>

                        {error && (
                            <p className="text-base sm:text-sm text-red-500 font-bold">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 sm:py-3 bg-red-500 text-white font-bold text-lg sm:text-base border-2 border-black shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span>{t('bugReport.sending')}</span>
                            ) : (
                                <>
                                    <Send size={20} />
                                    <span>{t('bugReport.send')}</span>
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </>
    );

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bug Report Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 bg-white border-2 border-black hover:shadow-neo transition-all group"
                title={t('bugReport.title')}
            >
                <Bug size={20} className="text-red-500 group-hover:animate-pulse" />
            </button>

            {/* Desktop Dropdown */}
            {isOpen && (
                <div className="hidden sm:block absolute right-0 top-full mt-2 w-96 bg-white border-4 border-black shadow-neo z-50">
                    {formContent}
                </div>
            )}

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
                        className="w-full bg-white border-t-4 border-black rounded-t-2xl max-h-[90vh] flex flex-col animate-slide-up"
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                    >
                        {/* Handle bar */}
                        <div className="flex justify-center py-2">
                            <div className="w-12 h-1 bg-gray-300 rounded-full" />
                        </div>
                        {formContent}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
