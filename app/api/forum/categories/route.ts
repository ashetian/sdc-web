import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import ForumCategory from '@/app/lib/models/ForumCategory';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

import { JWT_SECRET } from '@/app/lib/auth';

// Helper to check if user is admin
// Helper to check if user is admin
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

// GET - List all active forum categories
export async function GET() {
    try {
        await connectDB();

        const categories = await ForumCategory.find({ isActive: true })
            .sort({ order: 1 })
            .select('-__v');

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Forum categories fetch error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// POST - Create new category (admin only)
export async function POST(request: NextRequest) {
    try {
        const adminInfo = await isAdmin(request);
        if (!adminInfo.isAdmin) {
            return NextResponse.json({ error: 'Yetki gerekli' }, { status: 403 });
        }

        await connectDB();

        const body = await request.json();
        const { name, nameEn, slug, description, descriptionEn, icon, color, order } = body;

        if (!name || !slug || !description) {
            return NextResponse.json({ error: 'name, slug ve description gerekli' }, { status: 400 });
        }

        // Check if slug is unique
        const existing = await ForumCategory.findOne({ slug });
        if (existing) {
            return NextResponse.json({ error: 'Bu slug zaten kullanılıyor' }, { status: 400 });
        }

        // Auto-translate if DeepL API key is available
        let categoryData = {
            name,
            nameEn,
            slug,
            description,
            descriptionEn,
            icon: icon || '💬',
            color: color || 'bg-neo-blue',
            order: order || 0,
        };

        if (process.env.DEEPL_API_KEY && (!nameEn || !descriptionEn)) {
            try {
                const { translateContent } = await import('@/app/lib/translate');

                if (!nameEn && name) {
                    const nameResult = await translateContent(name, 'tr');
                    categoryData.nameEn = nameResult.en || '';
                }

                if (!descriptionEn && description) {
                    const descResult = await translateContent(description, 'tr');
                    categoryData.descriptionEn = descResult.en || '';
                }

                console.log('ForumCategory auto-translation successful');
            } catch (translateError) {
                console.error('ForumCategory translation failed:', translateError);
            }
        }

        const category = await ForumCategory.create(categoryData);

        // Audit log
        if (adminInfo.userId) {
            await logAdminAction({
                adminId: adminInfo.userId,
                adminName: adminInfo.name || 'Admin',
                action: AUDIT_ACTIONS.CREATE_FORUM_CATEGORY,
                targetType: 'ForumCategory',
                targetId: category._id.toString(),
                targetName: category.name,
            });
        }

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Forum category create error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
