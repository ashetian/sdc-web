import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Election from '@/app/lib/models/Election';

// POST - Suspend an election with reason
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const { reason } = await request.json();

        if (!reason || reason.trim().length < 10) {
            return NextResponse.json(
                { error: 'Askıya alma nedeni en az 10 karakter olmalıdır' },
                { status: 400 }
            );
        }

        const election = await Election.findById(id);
        if (!election) {
            return NextResponse.json({ error: 'Seçim bulunamadı' }, { status: 404 });
        }

        // Suspend the election
        election.isSuspended = true;
        election.suspensionReason = reason.trim();
        election.suspendedAt = new Date();
        election.status = 'suspended';
        await election.save();

        return NextResponse.json({
            message: 'Seçim askıya alındı',
            election
        });
    } catch (error) {
        console.error('Error suspending election:', error);
        return NextResponse.json({ error: 'Seçim askıya alınamadı' }, { status: 500 });
    }
}

// DELETE - Resume suspended election
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const election = await Election.findById(id);
        if (!election) {
            return NextResponse.json({ error: 'Seçim bulunamadı' }, { status: 404 });
        }

        if (!election.isSuspended) {
            return NextResponse.json({ error: 'Seçim zaten askıda değil' }, { status: 400 });
        }

        // Resume the election
        election.isSuspended = false;
        election.suspensionReason = undefined;
        election.suspendedAt = undefined;
        election.status = 'active';
        await election.save();

        return NextResponse.json({
            message: 'Seçim askıdan kaldırıldı',
            election
        });
    } catch (error) {
        console.error('Error resuming election:', error);
        return NextResponse.json({ error: 'Seçim askıdan kaldırılamadı' }, { status: 500 });
    }
}
