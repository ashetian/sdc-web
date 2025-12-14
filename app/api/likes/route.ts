import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Like from '@/app/lib/models/Like';
import { verifyAuth } from '@/app/lib/auth';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/app/lib/rateLimit';

// GET: Get like count and user's like status
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const contentType = searchParams.get('contentType');
        const contentId = searchParams.get('contentId');

        if (!contentType || !contentId) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Get total like count
        const count = await Like.countDocuments({ contentType, contentId });

        // Check if current user has liked
        let hasLiked = false;
        const auth = await verifyAuth(request);
        if (auth) {
            const existingLike = await Like.findOne({
                userId: auth.userId,
                contentType,
                contentId,
            });
            hasLiked = !!existingLike;
        }

        return NextResponse.json({ count, hasLiked });
    } catch (error) {
        console.error('Like GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST: Toggle like (add if not exists, remove if exists)
export async function POST(request: NextRequest) {
    try {
        // Rate limiting check
        const clientIP = getClientIP(request);
        const rateLimit = checkRateLimit(clientIP, 'likes', RATE_LIMITS.SENSITIVE);

        if (rateLimit.limited) {
            const resetSeconds = Math.ceil(rateLimit.resetIn / 1000);
            return NextResponse.json(
                { error: `Çok fazla istek. ${resetSeconds} saniye sonra tekrar deneyin.` },
                { status: 429 }
            );
        }

        const auth = await verifyAuth(request);
        if (!auth) {
            return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 });
        }

        await connectDB();

        const { contentType, contentId } = await request.json();

        if (!contentType || !contentId) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Check if like exists
        const existingLike = await Like.findOne({
            userId: auth.userId,
            contentType,
            contentId,
        });

        let action: 'liked' | 'unliked';

        if (existingLike) {
            // Unlike - remove the like
            await Like.deleteOne({ _id: existingLike._id });
            action = 'unliked';
        } else {
            // Like - add new like
            await Like.create({
                userId: auth.userId,
                contentType,
                contentId,
            });
            action = 'liked';

            // --- Notification Trigger ---
            try {
                const { createNotification } = await import('@/app/lib/notifications');

                if (contentType === 'comment') {
                    const Comment = (await import('@/app/lib/models/Comment')).default;
                    const comment = await Comment.findById(contentId);
                    if (comment && comment.memberId.toString() !== auth.userId) {
                        // Generate correct link based on content type
                        let notificationLink = '';
                        if (comment.contentType === 'gallery') {
                            notificationLink = `/gallery/${comment.contentId}`;
                        } else if (comment.contentType === 'announcement') {
                            // Announcements use slug, not ID
                            const { Announcement } = await import('@/app/lib/models/Announcement');
                            const announcement = await Announcement.findById(comment.contentId).select('slug');
                            notificationLink = announcement ? `/announcements/${announcement.slug}` : `/announcements`;
                        } else if (comment.contentType === 'project') {
                            notificationLink = `/projects/${comment.contentId}`;
                        }

                        await createNotification({
                            recipientId: comment.memberId,
                            type: 'comment_like',
                            title: 'Yorumunuz beğenildi',
                            titleEn: 'Your comment was liked',
                            message: 'Birisi yorumunuzu beğendi',
                            messageEn: 'Someone liked your comment',
                            link: notificationLink,
                            relatedContentType: 'like',
                            relatedContentId: contentId,
                            actorId: auth.userId,
                        });
                    }
                } else if (contentType === 'project') {
                    const Project = (await import('@/app/lib/models/Project')).default;
                    const project = await Project.findById(contentId);
                    if (project && project.memberId && project.memberId.toString() !== auth.userId) {
                        await createNotification({
                            recipientId: project.memberId,
                            type: 'project_like',
                            title: 'Projeniz beğenildi',
                            titleEn: 'Your project was liked',
                            message: `"${project.title}" projeniz beğenildi`,
                            messageEn: `Your project "${project.title}" was liked`,
                            link: `/projects/${contentId}`,
                            relatedContentType: 'like',
                            relatedContentId: contentId,
                            actorId: auth.userId,
                        });
                    }
                }
            } catch (notifError) {
                console.error('Notification error:', notifError);
            }
            // --- End Notification Trigger ---
        }

        // Get updated count
        const count = await Like.countDocuments({ contentType, contentId });

        return NextResponse.json({
            action,
            count,
            hasLiked: action === 'liked'
        });
    } catch (error) {
        console.error('Like POST error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
