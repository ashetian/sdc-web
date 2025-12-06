import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import ForumCategory from '@/app/lib/models/ForumCategory';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');

// Helper to check if user is admin
async function isAdmin(request: NextRequest): Promise<boolean> {
    const adminPassword = request.headers.get('x-admin-password');
    if (adminPassword === process.env.ADMIN_PASSWORD) {
        return true;
    }
    // Check JWT for admin role
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (token) {
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            return payload.isAdmin === true;
        } catch {
            return false;
        }
    }
    return false;
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
        if (!(await isAdmin(request))) {
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

        const category = await ForumCategory.create({
            name,
            nameEn,
            slug,
            description,
            descriptionEn,
            icon: icon || '💬',
            color: color || 'bg-neo-blue',
            order: order || 0,
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error('Forum category create error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
