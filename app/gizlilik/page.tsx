"use client";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LEGAL_CONTENT } from "../lib/constants/legal";

export default function PrivacyPage() {
    const content = LEGAL_CONTENT.tr.privacy;

    return (
        <div className="min-h-screen bg-neo-green py-20 pt-40">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white border-4 border-black shadow-neo-lg p-8 transform rotate-1">
                    <h1 className="text-3xl sm:text-4xl font-black text-black mb-8 border-b-4 border-black pb-4">
                        {content.title}
                    </h1>

                    <div className="prose prose-lg max-w-none text-black prose-headings:font-black prose-headings:text-black prose-p:text-black prose-strong:text-black prose-strong:font-black prose-ul:list-disc prose-ul:pl-6 prose-li:marker:text-black prose-a:text-neo-blue prose-a:font-bold prose-a:no-underline hover:prose-a:underline">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content.content}
                        </ReactMarkdown>
                    </div>

                    <div className="mt-12 border-t-4 border-black pt-8">
                        <Link
                            href="/"
                            className="inline-flex items-center text-black font-black uppercase hover:underline decoration-4 decoration-neo-purple underline-offset-4 transition-all"
                        >
                            <svg
                                className="w-6 h-6 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={4}
                            >
                                <path
                                    strokeLinecap="square"
                                    strokeLinejoin="miter"
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            Ana Sayfaya Dön
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
