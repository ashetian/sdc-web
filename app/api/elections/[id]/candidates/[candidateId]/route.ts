import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import ElectionCandidate from '@/app/lib/models/ElectionCandidate';
import { deleteFromCloudinary } from '@/app/lib/cloudinaryHelper';

// PUT - Update candidate
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; candidateId: string }> }
) {
    try {
        await connectDB();
        const { candidateId } = await params;
        const data = await request.json();

        const candidate = await ElectionCandidate.findByIdAndUpdate(candidateId, data, { new: true });

        if (!candidate) {
            return NextResponse.json({ error: 'Aday bulunamadı' }, { status: 404 });
        }

        return NextResponse.json(candidate);
    } catch (error) {
        console.error('Error updating candidate:', error);
        return NextResponse.json({ error: 'Aday güncellenemedi' }, { status: 500 });
    }
}

// DELETE - Remove candidate
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; candidateId: string }> }
) {
    try {
        await connectDB();
        const { candidateId } = await params;

        const candidate = await ElectionCandidate.findByIdAndDelete(candidateId);

        if (!candidate) {
            return NextResponse.json({ error: 'Aday bulunamadı' }, { status: 404 });
        }

        // Delete photo from Cloudinary if exists
        if (candidate.photo) {
            await deleteFromCloudinary(candidate.photo);
        }

        return NextResponse.json({ message: 'Aday silindi' });
    } catch (error) {
        console.error('Error deleting candidate:', error);
        return NextResponse.json({ error: 'Aday silinemedi' }, { status: 500 });
    }
}
