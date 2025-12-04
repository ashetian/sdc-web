import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Department from '@/app/lib/models/Department';

// GET - List all departments
export async function GET() {
    try {
        await connectDB();
        const departments = await Department.find({ isActive: true }).sort({ order: 1 });
        return NextResponse.json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        return NextResponse.json({ error: 'Departmanlar alınamadı' }, { status: 500 });
    }
}

// POST - Create new department
export async function POST(request: NextRequest) {
    try {
        await connectDB();
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

        const department = await Department.create({
            ...data,
            slug,
        });

        return NextResponse.json(department, { status: 201 });
    } catch (error) {
        console.error('Error creating department:', error);
        return NextResponse.json({ error: 'Departman oluşturulamadı' }, { status: 500 });
    }
}
