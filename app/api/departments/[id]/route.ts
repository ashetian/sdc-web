import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Department from '@/app/lib/models/Department';

// GET - Get single department
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const department = await Department.findById(id);

        if (!department) {
            return NextResponse.json({ error: 'Departman bulunamadı' }, { status: 404 });
        }

        return NextResponse.json(department);
    } catch (error) {
        console.error('Error fetching department:', error);
        return NextResponse.json({ error: 'Departman alınamadı' }, { status: 500 });
    }
}

// PUT - Update department
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const data = await request.json();

        // If name changed, regenerate slug
        if (data.name) {
            data.slug = data.name
                .toLowerCase()
                .replace(/ı/g, 'i')
                .replace(/ğ/g, 'g')
                .replace(/ü/g, 'u')
                .replace(/ş/g, 's')
                .replace(/ö/g, 'o')
                .replace(/ç/g, 'c')
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');
        }

        // Auto-translate if DeepL API key is available
        if (process.env.DEEPL_API_KEY && (data.name || data.description)) {
            try {
                // Check if English fields are missing in the update
                if ((data.name && !data.nameEn) || (data.description && !data.descriptionEn)) {
                    const { translateFields } = await import('@/app/lib/translate');

                    const fieldsToTranslate: any = {};
                    if (data.name) fieldsToTranslate.name = data.name;
                    if (data.description) fieldsToTranslate.description = data.description;

                    const translations = await translateFields(fieldsToTranslate, 'tr');

                    if (data.name && !data.nameEn) data.nameEn = translations.name?.en;
                    if (data.description && !data.descriptionEn) data.descriptionEn = translations.description?.en;
                }

            } catch (translateError) {
                console.error('Auto-translation failed:', translateError);
            }
        }

        const department = await Department.findByIdAndUpdate(id, data, { new: true });

        if (!department) {
            return NextResponse.json({ error: 'Departman bulunamadı' }, { status: 404 });
        }

        return NextResponse.json(department);
    } catch (error) {
        console.error('Error updating department:', error);
        return NextResponse.json({ error: 'Departman güncellenemedi' }, { status: 500 });
    }
}

// DELETE - Delete department
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const department = await Department.findByIdAndDelete(id);

        if (!department) {
            return NextResponse.json({ error: 'Departman bulunamadı' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Departman silindi' });
    } catch (error) {
        console.error('Error deleting department:', error);
        return NextResponse.json({ error: 'Departman silinemedi' }, { status: 500 });
    }
}
