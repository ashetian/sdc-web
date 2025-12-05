import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Project from '@/app/lib/models/Project';
import Member from '@/app/lib/models/Member';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sdc-secret-key-change-in-production');

// GET - User's own projects
export async function GET() {
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

        const projects = await Project.find({ memberId: member._id }).sort({ createdAt: -1 });

        return NextResponse.json(projects);
    } catch (error) {
        console.error('My projects fetch error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
