import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Election from '@/app/lib/models/Election';
import ElectionCandidate from '@/app/lib/models/ElectionCandidate';
import ClubMember from '@/app/lib/models/ClubMember';
import Vote from '@/app/lib/models/Vote';
import { verifyAuth } from '@/app/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

// GET - Get single election with stats
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const election = await Election.findById(id)
            .populate('departmentId', 'name');

        if (!election) {
            return NextResponse.json({ error: 'Seçim bulunamadı' }, { status: 404 });
        }

        // Get stats
        const candidateCount = await ElectionCandidate.countDocuments({ electionId: id });
        const memberCount = await ClubMember.countDocuments({ electionId: id });
        const voteCount = await Vote.countDocuments({ electionId: id });
        const votedMemberCount = await ClubMember.countDocuments({ electionId: id, hasVoted: true });

        return NextResponse.json({
            ...election.toObject(),
            stats: {
                candidateCount,
                memberCount,
                voteCount,
                votedMemberCount,
                turnout: memberCount > 0 ? ((votedMemberCount / memberCount) * 100).toFixed(1) : 0,
            }
        });
    } catch (error) {
        console.error('Error fetching election:', error);
        return NextResponse.json({ error: 'Seçim alınamadı' }, { status: 500 });
    }
}

// PUT - Update election
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        // Auth check
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        const data = await request.json();

        const election = await Election.findByIdAndUpdate(id, data, { new: true });

        if (!election) {
            return NextResponse.json({ error: 'Seçim bulunamadı' }, { status: 404 });
        }

        // Audit log
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: AUDIT_ACTIONS.UPDATE_ELECTION,
            targetType: 'Election',
            targetId: id,
            targetName: election.title,
        });

        return NextResponse.json(election);
    } catch (error) {
        console.error('Error updating election:', error);
        return NextResponse.json({ error: 'Seçim güncellenemedi' }, { status: 500 });
    }
}

// DELETE - Delete election and related data
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        // Auth check
        const user = await verifyAuth(request);
        if (!user) {
            return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
        }

        // Get election first for logging
        const electionToDelete = await Election.findById(id);
        if (!electionToDelete) {
            return NextResponse.json({ error: 'Seçim bulunamadı' }, { status: 404 });
        }

        const electionTitle = electionToDelete.title;

        // Delete related data
        await ElectionCandidate.deleteMany({ electionId: id });
        await ClubMember.deleteMany({ electionId: id });
        await Vote.deleteMany({ electionId: id });

        await Election.findByIdAndDelete(id);

        // Audit log
        await logAdminAction({
            adminId: user.userId,
            adminName: user.nickname || user.studentNo,
            action: AUDIT_ACTIONS.DELETE_ELECTION,
            targetType: 'Election',
            targetId: id,
            targetName: electionTitle,
        });

        return NextResponse.json({ message: 'Seçim silindi' });
    } catch (error) {
        console.error('Error deleting election:', error);
        return NextResponse.json({ error: 'Seçim silinemedi' }, { status: 500 });
    }
}
