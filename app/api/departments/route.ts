import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Department from '@/app/lib/models/Department';
import { verifyAuth } from '@/app/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

import { getDepartments } from '@/app/lib/services/teamService';

// GET - List all departments
export async function GET() {
    try {
        const departments = await getDepartments();
        return NextResponse.json(departments, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
            }
        });
    } catch (error) {
        console.error('Error fetching departments:', error);
        return NextResponse.json({ error: 'Departmanlar alınamadı' }, { status: 500 });
    }
}

// POST - Create new department
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Auth check
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        const data = await request.json();

        // Generate slug from name
        const slug = data.name
            .toLowerCase()
            .replace(/ı/g, 'i')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');

        let departmentData = { ...data, slug };

        // Auto-translate if DeepL API key is available
        if (process.env.DEEPL_API_KEY) {
            try {
                const { translateFields } = await import('@/app/lib/translate');
                const translations = await translateFields({
                    name: data.name,
                    description: data.description,
                }, 'tr');

                if (data.name && !data.nameEn) departmentData.nameEn = translations.name?.en;
                if (data.description && !data.descriptionEn) departmentData.descriptionEn = translations.description?.en;

            } catch (translateError) {
                console.error('Auto-translation failed:', translateError);
            }
        }

        const department = await Department.create(departmentData);

        // Audit log
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: AUDIT_ACTIONS.CREATE_DEPARTMENT,
            targetType: 'Department',
            targetId: department._id.toString(),
            targetName: department.name,
        });

        return NextResponse.json(department, { status: 201 });
    } catch (error) {
        console.error('Error creating department:', error);
        return NextResponse.json({ error: 'Departman oluşturulamadı' }, { status: 500 });
    }
}
