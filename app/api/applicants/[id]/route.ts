import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Applicant } from '@/app/lib/models/Applicant';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const applicant = await Applicant.findByIdAndDelete(params.id);

        if (!applicant) {
            return NextResponse.json(
                { error: 'Başvuru bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Başvuru silindi' });
    } catch (error) {
        console.error('Başvuru silinirken hata oluştu:', error);
        return NextResponse.json(
            { error: 'Başvuru silinirken bir hata oluştu' },
            { status: 500 }
        );
    }
}
