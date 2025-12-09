import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import ForumCategory from '@/app/lib/models/ForumCategory';
import ForumTopic from '@/app/lib/models/ForumTopic';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');

interface RouteParams {
    params: Promise<{ slug: string }>;
}

async function isAdmin(request: NextRequest): Promise<{ isAdmin: boolean; userId?: string; name?: string }> {
    const adminPassword = request.headers.get('x-admin-password');
    if (adminPassword === process.env.ADMIN_PASSWORD) {
        return { isAdmin: true };
    }
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (token) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            if (payload.isAdmin === true) {
                return {
                    isAdmin: true,
                    userId: payload.memberId as string,
                    name: (payload.nickname || payload.studentNo) as string,
                };
            }
        } catch {
            return { isAdmin: false };
        }
    }
    return { isAdmin: false };
}

// GET - Get category details with topics
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();
        const { slug } = await params;

        const category = await ForumCategory.findOne({ slug, isActive: true });
        if (!category) {
            return NextResponse.json({ error: 'Kategori bulunamadı' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const sort = searchParams.get('sort') || 'latest'; // latest, popular, unanswered

        let sortQuery: Record<string, 1 | -1> = { isPinned: -1, createdAt: -1 };
        if (sort === 'popular') {
            sortQuery = { isPinned: -1, upvotes: -1, viewCount: -1 };
        } else if (sort === 'unanswered') {
            sortQuery = { isPinned: -1, replyCount: 1, createdAt: -1 };
        } else if (sort === 'active') {
            sortQuery = { isPinned: -1, lastReplyAt: -1 };
        }

        const topics = await ForumTopic.find({
            categoryId: category._id,
            isDeleted: { $ne: true },
            isApproved: true
        })
            .populate('authorId', 'fullName nickname avatar')
            .populate('lastReplyById', 'fullName nickname')
            .sort(sortQuery)
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await ForumTopic.countDocuments({
            categoryId: category._id,
            isDeleted: { $ne: true },
            isApproved: true
        });

        return NextResponse.json({
            category,
            topics,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Forum category fetch error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// PUT - Update category (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const adminInfo = await isAdmin(request);
        if (!adminInfo.isAdmin) {
            return NextResponse.json({ error: 'Yetki gerekli' }, { status: 403 });
        }

        await connectDB();
        const { slug } = await params;

        const body = await request.json();
        const { name, nameEn, description, descriptionEn, icon, color, order, isActive } = body;

        // Prepare update data
        let updateData = { name, nameEn, description, descriptionEn, icon, color, order, isActive };

        // Auto-translate if DeepL API key is available
        if (process.env.DEEPL_API_KEY && (!nameEn || !descriptionEn)) {
            try {
                const { translateContent } = await import('@/app/lib/translate');

                if (!nameEn && name) {
                    const nameResult = await translateContent(name, 'tr');
                    updateData.nameEn = nameResult.en || '';
                }

                if (!descriptionEn && description) {
                    const descResult = await translateContent(description, 'tr');
                    updateData.descriptionEn = descResult.en || '';
                }

                console.log('ForumCategory update auto-translation successful');
            } catch (translateError) {
                console.error('ForumCategory update translation failed:', translateError);
            }
        }

        const category = await ForumCategory.findOneAndUpdate(
            { slug },
            updateData,
            { new: true }
        );

        if (!category) {
            return NextResponse.json({ error: 'Kategori bulunamadı' }, { status: 404 });
        }

        // Audit log
        if (adminInfo.userId) {
            await logAdminAction({
                adminId: adminInfo.userId,
                adminName: adminInfo.name || 'Admin',
                action: AUDIT_ACTIONS.UPDATE_FORUM_CATEGORY,
                targetType: 'ForumCategory',
                targetId: category._id.toString(),
                targetName: category.name,
            });
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error('Forum category update error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// DELETE - Delete category (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const adminInfo = await isAdmin(request);
        if (!adminInfo.isAdmin) {
            return NextResponse.json({ error: 'Yetki gerekli' }, { status: 403 });
        }

        await connectDB();
        const { slug } = await params;

        // Soft delete - mark as inactive
        const category = await ForumCategory.findOneAndUpdate(
            { slug },
            { isActive: false },
            { new: true }
        );

        if (!category) {
            return NextResponse.json({ error: 'Kategori bulunamadı' }, { status: 404 });
        }

        // Audit log
        if (adminInfo.userId) {
            await logAdminAction({
                adminId: adminInfo.userId,
                adminName: adminInfo.name || 'Admin',
                action: AUDIT_ACTIONS.DELETE_FORUM_CATEGORY,
                targetType: 'ForumCategory',
                targetId: category._id.toString(),
                targetName: category.name,
            });
        }

        return NextResponse.json({ message: 'Kategori silindi' });
    } catch (error) {
        console.error('Forum category delete error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
