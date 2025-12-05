import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Project from '@/app/lib/models/Project';

interface Params {
    params: Promise<{ id: string }>;
}

// POST - Approve project
export async function POST(request: NextRequest, { params }: Params) {
    try {
        await connectDB();
        const { id } = await params;

        // Check admin password
        const adminPassword = request.headers.get('x-admin-password');
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const project = await Project.findById(id);
        if (!project) {
            return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });
        }

        project.status = 'approved';
        project.rejectionReason = undefined;
        await project.save();

        return NextResponse.json({ message: 'Proje onaylandı', project });
    } catch (error) {
        console.error('Project approve error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
