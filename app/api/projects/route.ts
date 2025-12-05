import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Project from '@/app/lib/models/Project';
import Member from '@/app/lib/models/Member';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');

// GET - List approved projects (public)
export async function GET() {
    try {
        await connectDB();

        const projects = await Project.find({ status: 'approved' })
            .populate('memberId', 'fullName nickname department profileVisibility')
            .sort({ createdAt: -1 });

        const sanitizedProjects = projects.map(project => {
            const member = project.memberId as unknown as {
                fullName: string;
                nickname?: string;
                department?: string;
                profileVisibility?: { showFullName: boolean; showDepartment: boolean };
            };
            const visibility = member?.profileVisibility || { showFullName: false, showDepartment: true };

            return {
                _id: project._id,
                title: project.title,
                titleEn: project.titleEn,
                description: project.description,
                descriptionEn: project.descriptionEn,
                githubUrl: project.githubUrl,
                demoUrl: project.demoUrl,
                technologies: project.technologies,
                viewCount: project.viewCount,
                createdAt: project.createdAt,
                author: {
                    nickname: member?.nickname || 'Anonim',
                    fullName: visibility.showFullName ? member?.fullName : undefined,
                    department: visibility.showDepartment ? member?.department : undefined,
                },
            };
        });

        return NextResponse.json(sanitizedProjects);
    } catch (error) {
        console.error('Projects fetch error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}

// POST - Create new project (auth required)
export async function POST(request: NextRequest) {
    try {
        await connectDB();

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

        const member = await Member.findById(memberId);
        if (!member) {
            return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 });
        }

        const body = await request.json();
        const { title, titleEn, description, descriptionEn, githubUrl, demoUrl, technologies } = body;

        if (!title || !description || !githubUrl) {
            return NextResponse.json({ error: 'Başlık, açıklama ve GitHub linki zorunludur' }, { status: 400 });
        }

        const githubPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\/?$/;
        if (!githubPattern.test(githubUrl)) {
            return NextResponse.json({ error: 'Geçerli bir GitHub repo URL\'si girin' }, { status: 400 });
        }

        const project = await Project.create({
            memberId: member._id,
            title,
            titleEn,
            description,
            descriptionEn,
            githubUrl,
            demoUrl,
            technologies: technologies || [],
            status: 'pending',
        });

        return NextResponse.json({
            message: 'Proje başarıyla eklendi. Onay bekliyor.',
            project,
        }, { status: 201 });
    } catch (error) {
        console.error('Project create error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
