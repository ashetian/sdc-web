import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Project from '@/app/lib/models/Project';
import { verifyAuth } from '@/app/lib/auth';

// GET - All projects for admin (including pending)
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Check auth via JWT cookie
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const deleted = searchParams.get('deleted');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = {};

        if (deleted === 'true') {
            query.isDeleted = true;
        } else {
            query.isDeleted = { $ne: true };
            if (status && ['pending', 'approved', 'rejected'].includes(status)) {
                query.status = status;
            }
        }

        const projects = await Project.find(query)
            .populate('memberId', 'fullName nickname studentNo department')
            .sort({ createdAt: -1 });

        return NextResponse.json(projects);
    } catch (error) {
        console.error('Admin projects fetch error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// PUT - Restore or permanently delete a project
export async function PUT(request: NextRequest) {
    try {
        await connectDB();

        // Check auth via JWT cookie
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const body = await request.json();
        const { projectId, action } = body;

        if (!projectId || !action) {
            return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 });
        }

        if (action === 'restore') {
            const project = await Project.findByIdAndUpdate(
                projectId,
                { $set: { isDeleted: false }, $unset: { deletedAt: 1 } },
                { new: true }
            );
            if (!project) {
                return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });
            }
            return NextResponse.json({ message: 'Proje geri yüklendi', project });
        }

        if (action === 'permanent-delete') {
            const project = await Project.findByIdAndDelete(projectId);
            if (!project) {
                return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });
            }
            return NextResponse.json({ message: 'Proje kalıcı olarak silindi' });
        }

        return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
    } catch (error) {
        console.error('Admin projects action error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// DELETE - Soft delete a project (for admin use)
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();

        // Check auth via JWT cookie
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get('id');

        if (!projectId) {
            return NextResponse.json({ error: 'Proje ID gerekli' }, { status: 400 });
        }

        const project = await Project.findByIdAndUpdate(
            projectId,
            { isDeleted: true, deletedAt: new Date() },
            { new: true }
        );

        if (!project) {
            return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Proje silindi', project });
    } catch (error) {
        console.error('Admin projects delete error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
