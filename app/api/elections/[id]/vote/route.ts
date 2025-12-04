import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import ClubMember from '@/app/lib/models/ClubMember';
import OTPCode from '@/app/lib/models/OTPCode';
import Election from '@/app/lib/models/Election';
import ElectionCandidate from '@/app/lib/models/ElectionCandidate';
import Vote from '@/app/lib/models/Vote';
import crypto from 'crypto';

// Create voter hash for anonymity
function createVoterHash(studentNo: string, secret: string): string {
    return crypto.createHash('sha256').update(studentNo + secret).digest('hex');
}

// POST - Cast vote
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const { studentNo, code, rankings } = await request.json();

        if (!studentNo || !code || !rankings || !Array.isArray(rankings)) {
            return NextResponse.json({ error: 'Geçersiz oy verisi' }, { status: 400 });
        }

        // Check if election is active
        const election = await Election.findById(id);
        if (!election || election.status !== 'active') {
            return NextResponse.json({ error: 'Seçim aktif değil' }, { status: 400 });
        }

        // Verify OTP
        const otpRecord = await OTPCode.findOne({
            electionId: id,
            studentNo,
            code,
            expiresAt: { $gt: new Date() },
        });

        if (!otpRecord) {
            return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş doğrulama kodu' }, { status: 400 });
        }

        // Check if member already voted
        const member = await ClubMember.findOne({ electionId: id, studentNo });
        if (!member) {
            return NextResponse.json({ error: 'Üye bulunamadı' }, { status: 404 });
        }
        if (member.hasVoted) {
            return NextResponse.json({ error: 'Zaten oy kullandınız' }, { status: 400 });
        }

        // Validate all candidate IDs exist
        const candidates = await ElectionCandidate.find({ electionId: id });
        const candidateIds = candidates.map(c => c._id.toString());
        const validRankings = rankings.filter((r: string) => candidateIds.includes(r));

        if (validRankings.length === 0) {
            return NextResponse.json({ error: 'En az bir aday seçmelisiniz' }, { status: 400 });
        }

        // Create anonymous voter hash
        const secret = process.env.VOTE_SECRET || 'sdc-vote-secret-key';
        const voterHash = createVoterHash(studentNo, secret);

        // Check for duplicate vote (shouldn't happen but double check)
        const existingVote = await Vote.findOne({ electionId: id, voterHash });
        if (existingVote) {
            return NextResponse.json({ error: 'Bu oy daha önce kaydedilmiş' }, { status: 400 });
        }

        // Save vote
        await Vote.create({
            electionId: id,
            voterHash,
            rankings: validRankings,
            votedAt: new Date(),
        });

        // Mark member as voted
        await ClubMember.updateOne({ _id: member._id }, { hasVoted: true });

        // Delete used OTP
        await OTPCode.deleteOne({ _id: otpRecord._id });

        return NextResponse.json({ message: 'Oyunuz başarıyla kaydedildi!' });
    } catch (error) {
        console.error('Error casting vote:', error);
        return NextResponse.json({ error: 'Oy kaydedilemedi' }, { status: 500 });
    }
}
