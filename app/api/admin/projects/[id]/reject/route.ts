import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Project from '@/app/lib/models/Project';
import { verifyAuth } from '@/app/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

interface Params {
    params: Promise<{ id: string }>;
}

// POST - Reject project
export async function POST(request: NextRequest, { params }: Params) {
    try {
        await connectDB();
        const { id } = await params;

        // Auth check
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const project = await Project.findById(id);
        if (!project) {
            return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });
        }

        const body = await request.json();
        const { reason } = body;

        project.status = 'rejected';
        project.rejectionReason = reason || 'Sebep belirtilmedi';
        await project.save();

        // Audit log
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: AUDIT_ACTIONS.REJECT_PROJECT,
            targetType: 'Project',
            targetId: id,
            targetName: project.title,
            details: reason || 'Sebep belirtilmedi',
        });

        return NextResponse.json({ message: 'Proje reddedildi', project });
    } catch (error) {
        console.error('Project reject error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

