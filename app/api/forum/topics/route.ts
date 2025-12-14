import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import ForumTopic from '@/app/lib/models/ForumTopic';
import ForumCategory from '@/app/lib/models/ForumCategory';
import Member from '@/app/lib/models/Member';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

import { JWT_SECRET } from '@/app/lib/auth';
const SPAM_COOLDOWN_MS = 60000; // 1 minute between topics

// GET - List topics with filters
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const categorySlug = searchParams.get('category');
        const tag = searchParams.get('tag');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const sort = searchParams.get('sort') || 'latest';
        const showPending = searchParams.get('pending') === 'true'; // Admin only

        // Base query - only show approved topics for public, unless admin requests pending
        const query: Record<string, unknown> = {
            isDeleted: { $ne: true },
            status: showPending ? { $in: ['pending', 'resubmitted'] } : 'approved'
        };

        // Filter by category
        if (categorySlug) {
            const category = await ForumCategory.findOne({ slug: categorySlug });
            if (category) {
                query.categoryId = category._id;
            }
        }

        // Filter by tag
        if (tag) {
            query.tags = tag.toLowerCase();
        }

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        let sortQuery: Record<string, 1 | -1> = { isPinned: -1, createdAt: -1 };
        if (sort === 'popular') {
            sortQuery = { isPinned: -1, upvotes: -1, viewCount: -1 };
        } else if (sort === 'active') {
            sortQuery = { isPinned: -1, lastReplyAt: -1 };
        }

        const topics = await ForumTopic.find(query)
            .populate('categoryId', 'name nameEn slug icon color')
            .populate('authorId', 'fullName nickname avatar')
            .sort(sortQuery)
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await ForumTopic.countDocuments(query);

        return NextResponse.json({
            topics,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Forum topics fetch error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// POST - Create new topic
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Check auth
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
        }

        let memberId: string;
        let isAdmin = false;
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            memberId = payload.memberId as string;
            isAdmin = payload.isAdmin === true;
        } catch {
            return NextResponse.json({ error: 'Oturum geçersiz' }, { status: 401 });
        }

        const member = await Member.findById(memberId);
        if (!member) {
            return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 });
        }

        // Spam protection
        const lastTopic = await ForumTopic.findOne({ authorId: memberId }).sort({ createdAt: -1 });
        if (lastTopic) {
            const timeSinceLast = Date.now() - new Date(lastTopic.createdAt).getTime();
            if (timeSinceLast < SPAM_COOLDOWN_MS) {
                const remainingSeconds = Math.ceil((SPAM_COOLDOWN_MS - timeSinceLast) / 1000);
                return NextResponse.json({
                    error: `Lütfen ${remainingSeconds} saniye bekleyin`
                }, { status: 429 });
            }
        }

        const body = await request.json();
        const { categorySlug, title, content, tags } = body;

        if (!categorySlug || !title || !content) {
            return NextResponse.json({ error: 'categorySlug, title ve content gerekli' }, { status: 400 });
        }

        if (title.length > 200) {
            return NextResponse.json({ error: 'Başlık en fazla 200 karakter olabilir' }, { status: 400 });
        }

        if (content.length > 10000) {
            return NextResponse.json({ error: 'İçerik en fazla 10000 karakter olabilir' }, { status: 400 });
        }

        const category = await ForumCategory.findOne({ slug: categorySlug, isActive: true });
        if (!category) {
            return NextResponse.json({ error: 'Kategori bulunamadı' }, { status: 404 });
        }

        const topic = await ForumTopic.create({
            categoryId: category._id,
            authorId: member._id,
            title: title.trim(),
            content: content.trim(),
            tags: tags?.map((t: string) => t.toLowerCase().trim()) || [],
            status: isAdmin ? 'approved' : 'pending', // Auto-approve if admin creates the topic
        });

        // Only update category count if approved
        if (isAdmin) {
            await ForumCategory.findByIdAndUpdate(category._id, {
                $inc: { topicCount: 1 },
                lastTopicAt: new Date(),
            });
        }

        const populatedTopic = await ForumTopic.findById(topic._id)
            .populate('categoryId', 'name nameEn slug icon color')
            .populate('authorId', 'fullName nickname avatar');

        return NextResponse.json({
            ...populatedTopic?.toObject(),
            message: isAdmin ? undefined : 'Konunuz admin onayına gönderildi'
        }, { status: 201 });
    } catch (error) {
        console.error('Forum topic create error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
