import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Stat } from '@/app/lib/models/Stat';
import { z } from 'zod';
import { verifyAuth } from '@/app/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

// Validation schema
const statSchema = z.object({
    key: z.string().min(1).max(50),
    label: z.string().min(1).max(100),
    value: z.string().min(1).max(20),
    color: z.string().min(1).max(50),
    order: z.number().int().min(0),
    isActive: z.boolean().optional(),
});

export async function GET() {
    try {
        await connectDB();
        // Get only active stats, sorted by order
        const stats = await Stat.find({ isActive: true }).sort({ order: 1 });
        return NextResponse.json(stats);
    } catch (error) {
        console.error('İstatistikler alınırken hata oluştu:', error);
        return NextResponse.json(
            { error: 'İstatistikler alınırken bir hata oluştu' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Auth check
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        const data = await request.json();

        // Zod validation
        const parsed = statSchema.safeParse(data);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues.map((i) => i.message).join(', ') },
                { status: 400 }
            );
        }

        const stat = await Stat.create(parsed.data);

        // Audit log
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: AUDIT_ACTIONS.CREATE_STAT,
            targetType: 'Stat',
            targetId: stat._id.toString(),
            targetName: stat.label,
        });

        return NextResponse.json(stat, { status: 201 });
    } catch (error) {
        console.error('İstatistik eklenirken hata oluştu:', error);
        return NextResponse.json(
            { error: 'İstatistik eklenirken bir hata oluştu' },
            { status: 500 }
        );
    }
}
