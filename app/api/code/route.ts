import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import TechStack from '@/app/lib/models/TechStack';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

import { JWT_SECRET } from '@/app/lib/auth';

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

// GET - List all active tech stacks
export async function GET() {
    try {
        await connectDB();

        const stacks = await TechStack.find({ isActive: true })
            .sort({ createdAt: -1 })
            .select('-__v');

        return NextResponse.json(stacks);
    } catch (error) {
        console.error('Tech stack fetch error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// POST - Create new tech stack (admin only)
export async function POST(request: NextRequest) {
    try {
        const adminInfo = await isAdmin(request);
        if (!adminInfo.isAdmin) {
            return NextResponse.json({ error: 'Yetki gerekli' }, { status: 403 });
        }

        await connectDB();

        const body = await request.json();
        const { name, description, template, icon, color } = body;

        if (!name || !template) {
            return NextResponse.json({ error: 'İsim ve template zorunludur' }, { status: 400 });
        }

        const techStack = await TechStack.create({
            name,
            description,
            template,
            icon: icon || '📦',
            color: color || 'bg-neo-blue',
        });

        // Audit log
        if (adminInfo.userId) {
            await logAdminAction({
                adminId: adminInfo.userId,
                adminName: adminInfo.name || 'Admin',
                action: AUDIT_ACTIONS.CREATE_TECH_STACK,
                targetType: 'TechStack',
                targetId: techStack._id.toString(),
                targetName: techStack.name,
            });
        }

        return NextResponse.json(techStack, { status: 201 });
    } catch (error) {
        console.error('Tech stack create error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
