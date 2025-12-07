import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import TechStack from '@/app/lib/models/TechStack';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');

interface RouteParams {
    params: Promise<{ id: string }>;
}

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

// PUT - Update tech stack (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const adminInfo = await isAdmin(request);
        if (!adminInfo.isAdmin) {
            return NextResponse.json({ error: 'Yetki gerekli' }, { status: 403 });
        }

        await connectDB();
        const { id } = await params;

        const body = await request.json();
        const { name, description, template, icon, color } = body;

        const techStack = await TechStack.findByIdAndUpdate(
            id,
            { name, description, template, icon, color },
            { new: true }
        );

        if (!techStack) {
            return NextResponse.json({ error: 'Tech stack bulunamadı' }, { status: 404 });
        }

        // Audit log
        if (adminInfo.userId) {
            await logAdminAction({
                adminId: adminInfo.userId,
                adminName: adminInfo.name || 'Admin',
                action: AUDIT_ACTIONS.UPDATE_TECH_STACK,
                targetType: 'TechStack',
                targetId: techStack._id.toString(),
                targetName: techStack.name,
            });
        }

        return NextResponse.json(techStack);
    } catch (error) {
        console.error('Tech stack update error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// DELETE - Delete tech stack (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const adminInfo = await isAdmin(request);
        if (!adminInfo.isAdmin) {
            return NextResponse.json({ error: 'Yetki gerekli' }, { status: 403 });
        }

        await connectDB();
        const { id } = await params;

        // Perform hard delete or soft delete? 
        // Tech stacks might be referenced by projects later. For now, let's do soft delete via isActive=false to be safe,
        // similar to other entities.
        const techStack = await TechStack.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!techStack) {
            // Try hard delete if not found? No, consistency.
            return NextResponse.json({ error: 'Tech stack bulunamadı' }, { status: 404 });
        }

        // Audit log
        if (adminInfo.userId) {
            await logAdminAction({
                adminId: adminInfo.userId,
                adminName: adminInfo.name || 'Admin',
                action: AUDIT_ACTIONS.DELETE_TECH_STACK,
                targetType: 'TechStack',
                targetId: techStack._id.toString(),
                targetName: techStack.name,
            });
        }

        return NextResponse.json({ message: 'Tech stack silindi' });
    } catch (error) {
        console.error('Tech stack delete error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
