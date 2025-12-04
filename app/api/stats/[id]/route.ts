import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Stat } from '@/app/lib/models/Stat';
import { z } from 'zod';

const statUpdateSchema = z.object({
    label: z.string().min(1).max(100).optional(),
    value: z.string().min(1).max(20).optional(),
    color: z.string().min(1).max(50).optional(),
    order: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
});

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const data = await request.json();

        // Zod validation
        const parsed = statUpdateSchema.safeParse(data);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues.map((i) => i.message).join(', ') },
                { status: 400 }
            );
        }

        const stat = await Stat.findByIdAndUpdate(
            id,
            parsed.data,
            { new: true, runValidators: true }
        );

        if (!stat) {
            return NextResponse.json(
                { error: 'İstatistik bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json(stat);
    } catch (error) {
        console.error('İstatistik güncellenirken hata oluştu:', error);
        return NextResponse.json(
            { error: 'İstatistik güncellenirken bir hata oluştu' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const stat = await Stat.findByIdAndDelete(id);

        if (!stat) {
            return NextResponse.json(
                { error: 'İstatistik bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'İstatistik silindi' });
    } catch (error) {
        console.error('İstatistik silinirken hata oluştu:', error);
        return NextResponse.json(
            { error: 'İstatistik silinirken bir hata oluştu' },
            { status: 500 }
        );
    }
}
