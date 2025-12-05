import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Project from '@/app/lib/models/Project';
import Member from '@/app/lib/models/Member';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');

interface Params {
    params: Promise<{ id: string }>;
}

// GET - Project detail
export async function GET(request: NextRequest, { params }: Params) {
    try {
        await connectDB();
        const { id } = await params;

        const project = await Project.findById(id)
            .populate('memberId', 'fullName nickname department profileVisibility');

        if (!project) {
            return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });
        }

        if (project.status !== 'approved') {
            const cookieStore = await cookies();
            const token = cookieStore.get('auth-token')?.value;

            if (!token) {
                return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });
            }

            try {
                const { payload } = await jwtVerify(token, JWT_SECRET);
                if (project.memberId._id.toString() !== payload.memberId) {
                    return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });
                }
            } catch {
                return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });
            }
        } else {
            await Project.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
        }

        const member = project.memberId as unknown as {
            _id: string;
            fullName: string;
            nickname?: string;
            department?: string;
            profileVisibility?: { showFullName: boolean; showDepartment: boolean };
        };
        const visibility = member?.profileVisibility || { showFullName: false, showDepartment: true };

        return NextResponse.json({
            _id: project._id,
            title: project.title,
            titleEn: project.titleEn,
            description: project.description,
            descriptionEn: project.descriptionEn,
            githubUrl: project.githubUrl,
            demoUrl: project.demoUrl,
            technologies: project.technologies,
            status: project.status,
            rejectionReason: project.rejectionReason,
            viewCount: project.viewCount,
            createdAt: project.createdAt,
            author: {
                _id: member?._id,
                nickname: member?.nickname || 'Anonim',
                fullName: visibility.showFullName ? member?.fullName : undefined,
                department: visibility.showDepartment ? member?.department : undefined,
            },
        });
    } catch (error) {
        console.error('Project detail error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// PUT - Update project (owner only)
export async function PUT(request: NextRequest, { params }: Params) {
    try {
        await connectDB();
        const { id } = await params;

        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
        }

        let memberId: string;
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            memberId = payload.memberId as string;
        } catch {
            return NextResponse.json({ error: 'Oturum geçersiz' }, { status: 401 });
        }

        const project = await Project.findById(id);
        if (!project) {
            return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });
        }

        if (project.memberId.toString() !== memberId) {
            return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
        }

        const body = await request.json();
        const { title, titleEn, description, descriptionEn, githubUrl, demoUrl, technologies } = body;

        if (title) project.title = title;
        if (titleEn !== undefined) project.titleEn = titleEn;
        if (description) project.description = description;
        if (descriptionEn !== undefined) project.descriptionEn = descriptionEn;
        if (githubUrl) {
            const githubPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\/?$/;
            if (!githubPattern.test(githubUrl)) {
                return NextResponse.json({ error: 'Geçerli bir GitHub repo URL\'si girin' }, { status: 400 });
            }
            project.githubUrl = githubUrl;
        }
        if (demoUrl !== undefined) project.demoUrl = demoUrl;
        if (technologies) project.technologies = technologies;

        if (project.status === 'rejected') {
            project.status = 'pending';
            project.rejectionReason = undefined;
        }

        await project.save();
        return NextResponse.json({ message: 'Proje güncellendi', project });
    } catch (error) {
        console.error('Project update error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// DELETE - Delete project (owner only)
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        await connectDB();
        const { id } = await params;

        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
        }

        let memberId: string;
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            memberId = payload.memberId as string;
        } catch {
            return NextResponse.json({ error: 'Oturum geçersiz' }, { status: 401 });
        }

        const project = await Project.findById(id);
        if (!project) {
            return NextResponse.json({ error: 'Proje bulunamadı' }, { status: 404 });
        }

        if (project.memberId.toString() !== memberId) {
            return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
        }

        await Project.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Proje silindi' });
    } catch (error) {
        console.error('Project delete error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
