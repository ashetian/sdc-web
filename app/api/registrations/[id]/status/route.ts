import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Registration } from '@/app/lib/models/Registration';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();
        const { paymentStatus } = body;

        if (!['verified', 'rejected', 'refunded'].includes(paymentStatus)) {
            return NextResponse.json(
                { error: 'Geçersiz ödeme durumu.' },
                { status: 400 }
            );
        }

        const registration = await Registration.findByIdAndUpdate(
            id,
            { paymentStatus },
            { new: true }
        );

        if (!registration) {
            return NextResponse.json(
                { error: 'Kayıt bulunamadı.' },
                { status: 404 }
            );
        }

        return NextResponse.json(registration);
    } catch (error) {
        console.error('Ödeme durumu güncellenirken hata:', error);
        return NextResponse.json(
            { error: 'Ödeme durumu güncellenemedi.' },
            { status: 500 }
        );
    }
}
