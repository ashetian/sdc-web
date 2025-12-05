import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Project from '@/app/lib/models/Project';

// GET - All projects for admin (including pending)
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Check admin password
        const adminPassword = request.headers.get('x-admin-password');
        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const query: { status?: string } = {};
        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            query.status = status;
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
