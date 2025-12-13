"use client";

import { useLanguage } from "../_context/LanguageContext";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    mode?: "numbered" | "loadMore";
    hasMore?: boolean;
    loading?: boolean;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    mode = "numbered",
    hasMore = true,
    loading = false,
}: PaginationProps) {
    const { t } = useLanguage();

    if (totalPages <= 1 && mode === "numbered") return null;
    if (!hasMore && mode === "loadMore") return null;

    // Load More Button Mode
    if (mode === "loadMore") {
        return (
            <div className="flex justify-center mt-8">
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={loading || !hasMore}
                    className="px-8 py-3 bg-black text-white font-bold uppercase border-4 border-black shadow-neo hover:bg-neo-yellow hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? t('common.loading') : t('common.loadMore')}
                </button>
            </div>
        );
    }

    // Numbered Pagination Mode
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const showPages = 5;

        if (totalPages <= showPages + 2) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);

            if (currentPage > 3) pages.push("...");

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) pages.push(i);

            if (currentPage < totalPages - 2) pages.push("...");

            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 bg-white text-black font-bold border-2 border-black shadow-neo-sm hover:bg-neo-yellow transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
                ←
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, idx) => (
                <button
                    key={idx}
                    onClick={() => typeof page === "number" && onPageChange(page)}
                    disabled={page === "..." || page === currentPage || loading}
                    className={`w-10 h-10 font-bold border-2 border-black transition-all ${page === currentPage
                        ? "bg-black text-white shadow-none"
                        : page === "..."
                            ? "bg-white text-gray-400 cursor-default border-transparent shadow-none"
                            : "bg-white text-black shadow-neo-sm hover:bg-neo-yellow"
                        }`}
                >
                    {page}
                </button>
            ))}

            {/* Next Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="px-4 py-2 bg-white text-black font-bold border-2 border-black shadow-neo-sm hover:bg-neo-yellow transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
                →
            </button>

            {/* Page Info */}
            <span className="ml-4 text-sm font-medium text-gray-600">
                {t('common.page')} {currentPage} {t('common.of')} {totalPages}
            </span>
        </div>
    );
}
