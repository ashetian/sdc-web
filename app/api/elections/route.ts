import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Election from '@/app/lib/models/Election';

// GET - List all elections
export async function GET() {
    try {
        await connectDB();
        const elections = await Election.find()
            .populate('departmentId', 'name')
            .sort({ createdAt: -1 });
        return NextResponse.json(elections);
    } catch (error) {
        console.error('Error fetching elections:', error);
        return NextResponse.json({ error: 'Seçimler alınamadı' }, { status: 500 });
    }
}

// POST - Create new election
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const data = await request.json();

        const election = await Election.create(data);
        return NextResponse.json(election, { status: 201 });
    } catch (error) {
        console.error('Error creating election:', error);
        return NextResponse.json({ error: 'Seçim oluşturulamadı' }, { status: 500 });
    }
}
