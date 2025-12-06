import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import connectDB from '@/app/lib/db';
import Bookmark from '@/app/lib/models/Bookmark';
import { Event, IEvent } from '@/app/lib/models/Event';
import Project from '@/app/lib/models/Project';
import { Announcement, IAnnouncement } from '@/app/lib/models/Announcement';
import Comment from '@/app/lib/models/Comment';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');

async function getAuthUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return { id: payload.memberId as string };
    } catch {
        return null;
    }
}

// GET - List all bookmarks for current user
export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const contentType = searchParams.get('contentType');

        // Build query
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = { memberId: user.id };
        if (contentType) {
            query.contentType = contentType;
        }

        const bookmarks = await Bookmark.find(query)
            .sort({ createdAt: -1 })
            .lean();

        // Populate content details
        const populatedBookmarks = await Promise.all(
            bookmarks.map(async (bookmark) => {
                let contentTitle = '';
                let contentUrl = '';

                switch (bookmark.contentType) {
                    case 'event': {
                        const eventContent = await Event.findById(bookmark.contentId).lean() as IEvent | null;
                        if (eventContent) {
                            contentTitle = eventContent.title;
                            contentUrl = `/events/${bookmark.contentId}`;
                        }
                        break;
                    }
                    case 'project': {
                        const projectContent = await Project.findById(bookmark.contentId).lean() as { title: string } | null;
                        if (projectContent) {
                            contentTitle = projectContent.title;
                            contentUrl = `/profile/projects/${bookmark.contentId}`;
                        }
                        break;
                    }
                    case 'announcement': {
                        const announcementContent = await Announcement.findById(bookmark.contentId).lean() as IAnnouncement | null;
                        if (announcementContent) {
                            contentTitle = announcementContent.title;
                            contentUrl = `/announcements/${announcementContent.slug}`;
                        }
                        break;
                    }
                    case 'gallery': {
                        const galleryContent = await Announcement.findById(bookmark.contentId).lean() as IAnnouncement | null;
                        if (galleryContent) {
                            contentTitle = galleryContent.title;
                            contentUrl = `/gallery/${galleryContent.slug}`;
                        }
                        break;
                    }
                    case 'comment': {
                        const commentContent = await Comment.findById(bookmark.contentId).lean() as { content: string } | null;
                        if (commentContent) {
                            contentTitle = commentContent.content.substring(0, 50) + (commentContent.content.length > 50 ? '...' : '');
                            contentUrl = '#';
                        }
                        break;
                    }
                }

                return {
                    _id: bookmark._id,
                    contentType: bookmark.contentType,
                    contentId: bookmark.contentId,
                    createdAt: bookmark.createdAt,
                    contentTitle,
                    contentUrl,
                    isDeleted: !contentTitle,
                };
            })
        );

        // Filter out deleted content
        const validBookmarks = populatedBookmarks.filter(b => !b.isDeleted);

        return NextResponse.json(validBookmarks);
    } catch (error) {
        console.error('Get bookmarks error:', error);
        return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
    }
}

// POST - Add new bookmark
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { contentType, contentId } = await request.json();

        // Validate content type
        const validTypes = ['event', 'project', 'announcement', 'gallery', 'comment'];
        if (!validTypes.includes(contentType)) {
            return NextResponse.json({ error: 'Geçersiz içerik tipi' }, { status: 400 });
        }

        // Check if content exists
        let exists = false;
        switch (contentType) {
            case 'event':
                exists = !!(await Event.findById(contentId));
                break;
            case 'project':
                exists = !!(await Project.findById(contentId));
                break;
            case 'announcement':
            case 'gallery':
                exists = !!(await Announcement.findById(contentId));
                break;
            case 'comment':
                exists = !!(await Comment.findById(contentId));
                break;
        }

        if (!exists) {
            return NextResponse.json({ error: 'İçerik bulunamadı' }, { status: 404 });
        }

        // Check if already bookmarked
        const existing = await Bookmark.findOne({
            memberId: user.id,
            contentType,
            contentId,
        });

        if (existing) {
            return NextResponse.json({ error: 'Zaten kaydedilmiş' }, { status: 400 });
        }

        // Create bookmark
        const bookmark = await Bookmark.create({
            memberId: user.id,
            contentType,
            contentId,
        });

        return NextResponse.json(bookmark, { status: 201 });
    } catch (error) {
        console.error('Create bookmark error:', error);
        return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
    }
}
