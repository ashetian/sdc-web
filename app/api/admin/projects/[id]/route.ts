import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Project from '@/app/lib/models/Project';
import z from 'zod';

// Validation schema
const projectUpdateSchema = z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(1000),
    githubUrl: z.string().url(),
    demoUrl: z.string().url().optional().or(z.literal('')),
    technologies: z.array(z.string()),
    status: z.enum(['pending', 'approved', 'rejected']),
    rejectionReason: z.string().optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        // Check admin password
        const adminPassword = request.headers.get('x-admin-password');
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const project = await Project.findById(id).populate('memberId', 'fullName studentNo email');

        if (!project) {
            return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });
        }

        return NextResponse.json(project);
    } catch (error) {
        console.error('Project fetch error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        // Check admin password
        const adminPassword = request.headers.get('x-admin-password');
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const body = await request.json();
        const validation = projectUpdateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues.map(i => i.message).join(', ') },
                { status: 400 }
            );
        }

        const project = await Project.findByIdAndUpdate(
            id,
            { ...validation.data },
            { new: true }
        );

        if (!project) {
            return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });
        }

        return NextResponse.json(project);
    } catch (error) {
        console.error('Project update error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
