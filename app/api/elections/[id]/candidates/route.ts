import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import ElectionCandidate from '@/app/lib/models/ElectionCandidate';

// GET - List candidates for an election
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const candidates = await ElectionCandidate.find({ electionId: id })
            .sort({ order: 1 });

        return NextResponse.json(candidates);
    } catch (error) {
        console.error('Error fetching candidates:', error);
        return NextResponse.json({ error: 'Adaylar alınamadı' }, { status: 500 });
    }
}

// POST - Add candidate to election
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const data = await request.json();

        const candidate = await ElectionCandidate.create({
            ...data,
            electionId: id,
        });

        return NextResponse.json(candidate, { status: 201 });
    } catch (error) {
        console.error('Error creating candidate:', error);
        return NextResponse.json({ error: 'Aday eklenemedi' }, { status: 500 });
    }
}
