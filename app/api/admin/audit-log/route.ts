import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import AuditLog from '@/app/lib/models/AuditLog';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import AdminAccess from '@/app/lib/models/AdminAccess';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

async function verifyAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const studentNo = payload.studentNo as string;

        await connectDB();
        const access = await AdminAccess.findOne({ studentNo, isActive: true });

        if (!access) return null;

        return { studentNo };
    } catch {
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            AuditLog.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            AuditLog.countDocuments(),
        ]);

        return NextResponse.json({
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Audit log fetch error:', error);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
