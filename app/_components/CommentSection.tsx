'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../_context/LanguageContext';
import LikeButton from './LikeButton';
import { Reply, CornerDownRight } from 'lucide-react';
import UserProfileModal from './UserProfileModal';

interface Comment {
    _id: string;
    content: string;
    isEdited: boolean;
    createdAt: string;
    parentId: string | null;
    author: {
        _id: string;
        nickname: string;
        avatar?: string;
        fullName?: string;
        department?: string;
    };
    replies?: Comment[];
}

interface CommentSectionProps {
    contentType: 'project' | 'gallery' | 'announcement';
    contentId: string;
}

// Extracted CommentItem component to prevent re-renders losing focus
interface CommentItemProps {
    comment: Comment;
    depth?: number;
    replyingTo: string | null;
    setReplyingTo: (id: string | null) => void;
    replyContent: string;
    setReplyContent: (content: string) => void;
    handleSubmit: (e: React.FormEvent, parentId: string | null) => void;
    setDeleteModalId: (id: string | null) => void;
    currentUserId: string | null;
    isLoggedIn: boolean;
    l: any;
    formatDate: (dateStr: string) => string;

    submitting: boolean;
    onUserClick: (userId: string) => void;
}

const CommentItem = ({
    comment,
    depth = 0,
    replyingTo,
    setReplyingTo,
    replyContent,
    setReplyContent,
    handleSubmit,
    setDeleteModalId,
    currentUserId,
    isLoggedIn,
    l,
    formatDate,
    submitting,
    onUserClick
}: CommentItemProps) => {
    const isReplying = replyingTo === comment._id;

    return (
        <div className={`mt-4 ${depth > 0 ? 'ml-8 sm:ml-12 border-l-4 border-black pl-4' : ''}`}>
            <div className="flex items-start gap-3">
                <button
                    onClick={() => onUserClick(comment.author._id)}
                    className="flex-shrink-0 bg-transparent border-none p-0 cursor-pointer hover:opacity-80 transition-opacity"
                >
                    {comment.author.avatar ? (
                        <img
                            src={comment.author.avatar}
                            alt={comment.author.nickname}
                            className={`${depth > 0 ? 'w-8 h-8' : 'w-10 h-10'} rounded-full border-2 border-black object-cover`}
                        />
                    ) : (
                        <div className={`${depth > 0 ? 'w-8 h-8 text-xs' : 'w-10 h-10'} bg-neo-purple text-white font-bold rounded-full flex items-center justify-center border-2 border-black`}>
                            {comment.author.nickname.charAt(0).toUpperCase()}
                        </div>
                    )}
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={() => onUserClick(comment.author._id)}
                                className="font-bold text-black hover:underline text-left pointer-events-auto bg-transparent border-none p-0 m-0 shadow-none"
                            >
                                {comment.author.nickname}
                            </button>
                            {comment.author.department && (
                                <span className="text-gray-500 text-xs sm:text-sm">• {comment.author.department}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <LikeButton contentType="comment" contentId={comment._id} size="sm" />

                            {currentUserId && comment.author._id === currentUserId && (
                                <button
                                    onClick={() => setDeleteModalId(comment._id)}
                                    className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold border-2 border-black hover:bg-red-600 transition-all"
                                >
                                    {l.delete}
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="text-gray-800 mb-2 break-words text-sm sm:text-base">{comment.content}</p>
                    <div className="flex items-center justify-between mt-2">
                        <div className="text-[10px] sm:text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                            {comment.isEdited && ` (${l.edited})`}
                        </div>

                        {/* Reply Button - Only for root comments */}
                        {isLoggedIn && depth === 0 && (
                            <button
                                onClick={() => {
                                    if (replyingTo === comment._id) {
                                        setReplyingTo(null);
                                    } else {
                                        setReplyingTo(comment._id);
                                        setReplyContent(`@${comment.author.nickname} `);
                                    }
                                }}
                                className="text-gray-500 hover:text-black transition-colors flex items-center gap-1.5 text-xs font-bold px-3 py-1 hover:bg-gray-100 rounded"
                                title={l.reply}
                            >
                                <Reply size={14} />
                                {l.reply}
                            </button>
                        )}
                    </div>

                    {/* Reply Form */}
                    {isReplying && (
                        <form onSubmit={(e) => handleSubmit(e, comment._id)} className="mt-4 mb-4">
                            <div className="flex gap-2">
                                <CornerDownRight className="text-gray-400 mt-2" size={20} />
                                <div className="flex-1">
                                    <textarea
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder={l.replyPlaceholder}
                                        maxLength={500}
                                        rows={2}
                                        autoFocus
                                        className="w-full p-2 text-sm border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-yellow resize-none mb-2"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setReplyingTo(null)}
                                            className="px-3 py-1 text-xs font-bold border-2 border-transparent hover:underline"
                                        >
                                            {l.cancelReply}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting || !replyContent.trim()}
                                            className="px-4 py-1 bg-black text-white text-xs font-bold border-2 border-black hover:bg-white hover:text-black transition-all disabled:opacity-50"
                                        >
                                            {submitting ? '...' : l.reply}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Recursive Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2">
                    {comment.replies.map(reply => (
                        <CommentItem
                            key={reply._id}
                            comment={reply}
                            depth={depth + 1}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            replyContent={replyContent}
                            setReplyContent={setReplyContent}
                            handleSubmit={handleSubmit}
                            setDeleteModalId={setDeleteModalId}
                            currentUserId={currentUserId}
                            isLoggedIn={isLoggedIn}
                            l={l}
                            formatDate={formatDate}

                            submitting={submitting}
                            onUserClick={onUserClick}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function CommentSection({ contentType, contentId }: CommentSectionProps) {
    const { language } = useLanguage();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [commentError, setCommentError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
    const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    // Reply logic
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');

    const labels = {
        tr: {
            comments: 'Yorumlar',
            noComments: 'Henüz yorum yapılmamış. İlk yorumu siz yapın!',
            commentPlaceholder: 'Yorumunuzu yazın... (link eklenemez)',
            replyPlaceholder: 'Yanıtınızı yazın...',
            submit: 'Gönder',
            reply: 'Yanıtla',
            cancelReply: 'İptal',
            loginToComment: 'Yorum yapmak için giriş yapın',
            edited: 'düzenlendi',
            delete: 'Sil',
            confirmDeleteTitle: '⚠️ Yorumu Sil',
            confirmDeleteText: 'Bu yorumu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
            confirmYes: 'Evet, Sil',
            confirmCancel: 'İptal',
            disclaimerTitle: '⚠️ Önemli Uyarı',
            disclaimerText: `Yorum yapmadan önce aşağıdaki bilgileri dikkatlice okuyunuz:

• Yorumda yazdığınız içeriklerden tamamen kendiniz sorumlusunuz.
• Kulüp yönetimi, uygunsuz, hakaret içeren veya yasadışı içerikler tespit ettiğinde üniversite yönetimine bilgi vermekle yükümlüdür.
• Üye bilgileriniz (isim, öğrenci numarası, bölüm vb.) yönetim tarafından erişilebilir durumdadır.
• Yorumunuz diğer kullanıcılar tarafından görüntülenebilir ve moderatörler tarafından silinebilir.`,
            acceptDisclaimer: 'Okudum, anladım ve kabul ediyorum',
            cancel: 'İptal',
        },
        en: {
            comments: 'Comments',
            noComments: 'No comments yet. Be the first to comment!',
            commentPlaceholder: 'Write your comment... (no links allowed)',
            replyPlaceholder: 'Write your reply...',
            submit: 'Submit',
            reply: 'Reply',
            cancelReply: 'Cancel',
            loginToComment: 'Login to comment',
            edited: 'edited',
            delete: 'Delete',
            confirmDeleteTitle: '⚠️ Delete Comment',
            confirmDeleteText: 'Are you sure you want to delete this comment? This action cannot be undone.',
            confirmYes: 'Yes, Delete',
            confirmCancel: 'Cancel',
            disclaimerTitle: '⚠️ Important Notice',
            disclaimerText: `Please read the following information carefully before commenting:

• You are fully responsible for the content you write in your comment.
• Club management is obligated to report inappropriate, offensive, or illegal content to university administration.
• Your member information (name, student number, department, etc.) is accessible by management.
• Your comment can be viewed by other users and may be deleted by moderators.`,
            acceptDisclaimer: 'I have read, understood, and accept',
            cancel: 'Cancel',
        },
    };

    const l = labels[language];

    useEffect(() => {
        fetchComments();
        checkLoginStatus();
    }, [contentId]);

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

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/comments?type=${contentType}&id=${contentId}`);
            if (res.ok) {
                const data = await res.json();
                // Process comments into tree structure
                const commentMap = new Map<string, Comment>();
                const rootComments: Comment[] = [];

                data.forEach((c: Comment) => {
                    c.replies = [];
                    commentMap.set(c._id, c);
                });

                data.forEach((c: Comment) => {
                    if (c.parentId && commentMap.has(c.parentId)) {
                        const parent = commentMap.get(c.parentId);
                        parent!.replies!.push(c);
                        parent!.replies!.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                    } else if (!c.parentId) {
                        rootComments.push(c);
                    }
                });

                setComments(rootComments);
            }
        } catch (err) {
            console.error('Comments fetch error:', err);
        }
    };

    const handleCommentFocus = () => {
        if (!disclaimerAccepted) {
            setShowDisclaimer(true);
        }
    };

    const handleAcceptDisclaimer = () => {
        setDisclaimerAccepted(true);
        setShowDisclaimer(false);
    };

    const handleSubmit = async (e: React.FormEvent, parentId: string | null = null) => {
        e.preventDefault();

        const content = parentId ? replyContent : newComment;

        if (!content.trim()) return;

        if (!disclaimerAccepted) {
            setShowDisclaimer(true);
            return;
        }

        setSubmitting(true);
        setCommentError('');

        try {
            const res = await fetch(`/api/comments?type=${contentType}&id=${contentId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    parentId: parentId
                }),
            });

            const data = await res.json();

            if (res.ok) {
                if (parentId) {
                    setReplyContent('');
                    setReplyingTo(null);
                } else {
                    setNewComment('');
                    setDisclaimerAccepted(false);
                }
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
        try {
            const res = await fetch(`/api/comments?id=${commentId}`, { method: 'DELETE' });
            if (res.ok) {
                fetchComments();
            }
        } catch (err) {
            console.error('Comment delete error:', err);
        } finally {
            setDeleteModalId(null);
        }
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

    return (
        <>
            {showDisclaimer && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-4 border-black shadow-neo max-w-lg w-full p-6">
                        <h3 className="text-xl font-black text-black mb-4">{l.disclaimerTitle}</h3>
                        <div className="text-gray-800 whitespace-pre-line mb-6 text-sm leading-relaxed border-l-4 border-red-500 pl-4 bg-red-50 py-3">
                            {l.disclaimerText}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleAcceptDisclaimer}
                                className="flex-1 bg-black text-white py-3 font-bold border-2 border-black hover:bg-gray-800 transition-all"
                            >
                                {l.acceptDisclaimer}
                            </button>
                            <button
                                onClick={() => setShowDisclaimer(false)}
                                className="px-6 py-3 bg-gray-200 text-black font-bold border-2 border-black hover:bg-gray-300 transition-all"
                            >
                                {l.cancel}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white border-4 border-black shadow-neo p-6 mt-12 transform -rotate-1">
                <h2 className="text-xl font-black text-black mb-4 border-b-4 border-black pb-3">
                    {l.comments} ({comments.length + comments.reduce((acc, c) => acc + (c.replies?.length || 0) + (c.replies?.reduce((subAcc, subC) => subAcc + (subC.replies?.length || 0), 0) || 0), 0)})
                </h2>

                {isLoggedIn ? (
                    <form onSubmit={(e) => handleSubmit(e, null)} className="mb-8">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onFocus={handleCommentFocus}
                            placeholder={l.commentPlaceholder}
                            maxLength={500}
                            rows={3}
                            className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-neo-yellow resize-none mb-3"
                        />
                        {commentError && !replyingTo && (
                            <p className="text-red-600 text-sm mb-3">{commentError}</p>
                        )}
                        <button
                            type="submit"
                            disabled={submitting || !newComment.trim() || !disclaimerAccepted}
                            className="px-6 py-2 bg-black text-white font-bold border-2 border-black hover:bg-white hover:text-black transition-all disabled:opacity-50"
                        >
                            {submitting && !replyingTo ? '...' : l.submit}
                        </button>
                        {!disclaimerAccepted && newComment.trim() && (
                            <p className="text-orange-600 text-xs mt-2">
                                {language === 'tr' ? 'Yorum göndermek için uyarıyı kabul etmelisiniz.' : 'You must accept the disclaimer to submit a comment.'}
                            </p>
                        )}
                    </form>
                ) : (
                    <div className="mb-6 p-4 bg-gray-100 border-2 border-black text-center">
                        <Link href="/auth/login" className="text-blue-600 hover:underline font-bold">
                            {l.loginToComment}
                        </Link>
                    </div>
                )}

                {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">{l.noComments}</p>
                ) : (
                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <div key={comment._id} className="border-b-2 border-gray-200 pb-6 last:border-0 last:pb-0">
                                <CommentItem
                                    comment={comment}
                                    replyingTo={replyingTo}
                                    setReplyingTo={setReplyingTo}
                                    replyContent={replyContent}
                                    setReplyContent={setReplyContent}
                                    handleSubmit={handleSubmit}
                                    setDeleteModalId={setDeleteModalId}
                                    currentUserId={currentUserId}
                                    isLoggedIn={isLoggedIn}
                                    l={l}
                                    formatDate={formatDate}

                                    submitting={submitting}
                                    onUserClick={setSelectedUserId}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {deleteModalId && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-4 border-black shadow-neo max-w-md w-full p-6">
                        <h3 className="text-xl font-black text-black mb-4">{l.confirmDeleteTitle}</h3>
                        <p className="text-gray-700 mb-6">
                            {l.confirmDeleteText}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleDeleteComment(deleteModalId)}
                                className="flex-1 bg-red-500 text-white py-3 font-bold border-2 border-black hover:bg-red-600 transition-all"
                            >
                                {l.confirmYes}
                            </button>
                            <button
                                onClick={() => setDeleteModalId(null)}
                                className="flex-1 bg-gray-200 text-black py-3 font-bold border-2 border-black hover:bg-gray-300 transition-all"
                            >
                                {l.confirmCancel}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedUserId && (
                <UserProfileModal
                    userId={selectedUserId}
                    onClose={() => setSelectedUserId(null)}
                />
            )}
        </>
    );
}
