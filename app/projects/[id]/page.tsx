'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../_context/LanguageContext';

interface Project {
    _id: string;
    title: string;
    titleEn?: string;
    description: string;
    descriptionEn?: string;
    githubUrl: string;
    demoUrl?: string;
    technologies: string[];
    viewCount: number;
    createdAt: string;
    author: {
        _id: string;
        nickname: string;
        fullName?: string;
        department?: string;
    };
}

interface Comment {
    _id: string;
    content: string;
    isEdited: boolean;
    createdAt: string;
    author: {
        _id: string;
        nickname: string;
        fullName?: string;
        department?: string;
    };
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { language } = useLanguage();
    const [project, setProject] = useState<Project | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [commentError, setCommentError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const labels = {
        tr: {
            back: 'Projelere Dön',
            views: 'görüntülenme',
            demo: 'Canlı Demo',
            github: 'GitHub',
            technologies: 'Teknolojiler',
            developer: 'Geliştirici',
            comments: 'Yorumlar',
            noComments: 'Henüz yorum yapılmamış',
            addComment: 'Yorum Ekle',
            commentPlaceholder: 'Yorumunuzu yazın... (link eklenemez)',
            submit: 'Gönder',
            loginToComment: 'Yorum yapmak için giriş yapın',
            edited: 'düzenlendi',
            notFound: 'Proje bulunamadı',
            delete: 'Sil',
            confirmDelete: 'Bu yorumu silmek istediğinize emin misiniz?',
        },
        en: {
            back: 'Back to Projects',
            views: 'views',
            demo: 'Live Demo',
            github: 'GitHub',
            technologies: 'Technologies',
            developer: 'Developer',
            comments: 'Comments',
            noComments: 'No comments yet',
            addComment: 'Add Comment',
            commentPlaceholder: 'Write your comment... (no links allowed)',
            submit: 'Submit',
            loginToComment: 'Login to comment',
            edited: 'edited',
            notFound: 'Project not found',
            delete: 'Delete',
            confirmDelete: 'Are you sure you want to delete this comment?',
        },
    };

    const l = labels[language];

    useEffect(() => {
        fetchProject();
        fetchComments();
        checkLoginStatus();
    }, [id]);

    const checkLoginStatus = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setIsLoggedIn(true);
                setCurrentUserId(data.user?.id);
            } else {
                setIsLoggedIn(false);
                setCurrentUserId(null);
            }
        } catch {
            setIsLoggedIn(false);
            setCurrentUserId(null);
        }
    };

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/projects/${id}`);
            if (res.ok) {
                const data = await res.json();
                setProject(data);
            }
        } catch (err) {
            console.error('Project fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/comments?type=project&id=${id}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (err) {
            console.error('Comments fetch error:', err);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        setCommentError('');

        try {
            const res = await fetch(`/api/comments?type=project&id=${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment }),
            });

            const data = await res.json();

            if (res.ok) {
                setNewComment('');
                fetchComments();
            } else {
                setCommentError(data.error || 'Bir hata oluştu');
            }
        } catch {
            setCommentError('Bir hata oluştu');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm(l.confirmDelete)) return;

        try {
            const res = await fetch(`/api/comments?id=${commentId}`, { method: 'DELETE' });
            if (res.ok) {
                setComments(comments.filter(c => c._id !== commentId));
            }
        } catch (err) {
            console.error('Comment delete error:', err);
        }
    };

    const getGithubPreview = (githubUrl: string) => {
        const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (match) {
            return `https://opengraph.githubassets.com/1/${match[1]}/${match[2]}`;
        }
        return '/sdclogo.png';
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center pt-24">
                <div className="text-xl font-bold">Yükleniyor...</div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center pt-24">
                <div className="text-xl font-bold mb-4">{l.notFound}</div>
                <Link href="/projects" className="text-blue-600 hover:underline">{l.back}</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-24 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back Link */}
                <Link href="/projects" className="inline-flex items-center text-black font-bold mb-6 hover:underline">
                    ← {l.back}
                </Link>

                {/* Project Card */}
                <div className="bg-white border-4 border-black shadow-neo overflow-hidden mb-8">
                    {/* Preview Image */}
                    <div className="relative h-64 border-b-4 border-black">
                        <Image
                            src={getGithubPreview(project.githubUrl)}
                            alt={project.title}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>

                    <div className="p-8">
                        <h1 className="text-3xl font-black text-black mb-4">
                            {language === 'en' && project.titleEn ? project.titleEn : project.title}
                        </h1>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                            <span>{project.viewCount} {l.views}</span>
                            <span>•</span>
                            <span>{formatDate(project.createdAt)}</span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-800 text-lg mb-6 whitespace-pre-wrap">
                            {language === 'en' && project.descriptionEn ? project.descriptionEn : project.description}
                        </p>

                        {/* Technologies */}
                        {project.technologies.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-black text-black mb-2">{l.technologies}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.technologies.map((tech, i) => (
                                        <span key={i} className="px-3 py-1 bg-neo-purple text-white font-bold border-2 border-black">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Author */}
                        <div className="mb-6 p-4 bg-gray-50 border-2 border-black">
                            <h3 className="font-black text-black mb-2">{l.developer}</h3>
                            <p className="font-bold">{project.author.nickname}</p>
                            {project.author.fullName && <p className="text-gray-600">{project.author.fullName}</p>}
                            {project.author.department && <p className="text-gray-500 text-sm">{project.author.department}</p>}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4">
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black hover:shadow-neo transition-all uppercase"
                            >
                                {l.github}
                            </a>
                            {project.demoUrl && (
                                <a
                                    href={project.demoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 bg-neo-green text-black font-bold border-2 border-black hover:shadow-neo transition-all uppercase"
                                >
                                    {l.demo}
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="bg-white border-4 border-black shadow-neo p-8">
                    <h2 className="text-2xl font-black text-black mb-6 border-b-4 border-black pb-4">
                        {l.comments} ({comments.length})
                    </h2>

                    {/* Comment Form */}
                    {isLoggedIn ? (
                        <form onSubmit={handleSubmitComment} className="mb-8">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={l.commentPlaceholder}
                                maxLength={500}
                                rows={3}
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-yellow resize-none mb-3"
                            />
                            {commentError && (
                                <p className="text-red-600 text-sm mb-3">{commentError}</p>
                            )}
                            <button
                                type="submit"
                                disabled={submitting || !newComment.trim()}
                                className="px-6 py-2 bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition-all disabled:opacity-50"
                            >
                                {submitting ? '...' : l.submit}
                            </button>
                        </form>
                    ) : (
                        <div className="mb-8 p-4 bg-gray-100 border-2 border-black text-center">
                            <Link href="/auth/login" className="text-blue-600 hover:underline font-bold">
                                {l.loginToComment}
                            </Link>
                        </div>
                    )}

                    {/* Comments List */}
                    {comments.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">{l.noComments}</p>
                    ) : (
                        <div className="space-y-6">
                            {comments.map((comment) => (
                                <div key={comment._id} className="border-b-2 border-gray-200 pb-6 last:border-0">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-neo-purple text-white font-bold rounded-full flex items-center justify-center border-2 border-black">
                                            {comment.author.nickname.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-black">{comment.author.nickname}</span>
                                                    {comment.author.department && (
                                                        <span className="text-gray-500 text-sm">• {comment.author.department}</span>
                                                    )}
                                                </div>
                                                {currentUserId && comment.author._id === currentUserId && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment._id)}
                                                        className="text-red-500 text-sm hover:underline"
                                                    >
                                                        {l.delete}
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-gray-800 mb-2">{comment.content}</p>
                                            <div className="text-xs text-gray-500">
                                                {formatDate(comment.createdAt)}
                                                {comment.isEdited && ` (${l.edited})`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
