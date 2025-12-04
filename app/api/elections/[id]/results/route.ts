import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Election from '@/app/lib/models/Election';
import ElectionCandidate, { IElectionCandidate } from '@/app/lib/models/ElectionCandidate';
import Vote from '@/app/lib/models/Vote';
import ClubMember from '@/app/lib/models/ClubMember';
import mongoose from 'mongoose';

interface CandidateResult {
    candidateId: string;
    name: string;
    photo?: string;
    votes: number;
    percentage: number;
    eliminated: boolean;
    eliminatedRound?: number;
}

interface IRVRound {
    round: number;
    results: CandidateResult[];
    eliminated?: string;
    winner?: string;
}

// Simple plurality count (first choice only)
async function calculateSimpleResults(electionId: string, candidates: (mongoose.Document & IElectionCandidate)[]) {
    const votes = await Vote.find({ electionId });
    const totalVotes = votes.length;

    const results: CandidateResult[] = candidates.map((c) => ({
        candidateId: c._id.toString(),
        name: c.name,
        photo: c.photo,
        votes: 0,
        percentage: 0,
        eliminated: false,
    }));

    // Count first choices
    for (const vote of votes) {
        if (vote.rankings.length > 0) {
            const firstChoice = vote.rankings[0].toString();
            const candidate = results.find(r => r.candidateId === firstChoice);
            if (candidate) candidate.votes++;
        }
    }

    // Calculate percentages
    results.forEach(r => {
        r.percentage = totalVotes > 0 ? (r.votes / totalVotes) * 100 : 0;
    });

    // Sort by votes descending
    results.sort((a, b) => b.votes - a.votes);

    return { results, totalVotes };
}

// IRV (Instant Runoff Voting) calculation
async function calculateIRVResults(electionId: string, candidates: (mongoose.Document & IElectionCandidate)[]) {
    const allVotes = await Vote.find({ electionId });
    const totalVotes = allVotes.length;

    // Create working copy of votes with candidate rankings
    const activeVotes = allVotes.map(v => ({
        rankings: v.rankings.map((r: mongoose.Types.ObjectId) => r.toString()),
    }));

    const rounds: IRVRound[] = [];
    const eliminatedCandidates: string[] = [];

    // Create candidate map
    const candidateMap = new Map(candidates.map((c) => [
        c._id.toString(),
        { name: c.name, photo: c.photo }
    ]));

    let roundNumber = 0;
    let winner: string | null = null;

    while (!winner && eliminatedCandidates.length < candidates.length - 1) {
        roundNumber++;

        // Count first choices among remaining candidates
        const voteCounts: Record<string, number> = {};

        for (const vote of activeVotes) {
            // Find first non-eliminated candidate in ranking
            const firstChoice = vote.rankings.find((r: string) => !eliminatedCandidates.includes(r));
            if (firstChoice) {
                voteCounts[firstChoice] = (voteCounts[firstChoice] || 0) + 1;
            }
        }

        // Create round results
        const roundResults: CandidateResult[] = [];
        const activeCandidates = candidates.filter((c) =>
            !eliminatedCandidates.includes(c._id.toString())
        );

        for (const candidate of activeCandidates) {
            const cid = candidate._id.toString();
            const info = candidateMap.get(cid);
            const votes = voteCounts[cid] || 0;
            roundResults.push({
                candidateId: cid,
                name: info?.name || 'Unknown',
                photo: info?.photo,
                votes,
                percentage: totalVotes > 0 ? (votes / totalVotes) * 100 : 0,
                eliminated: false,
            });
        }

        // Sort by votes descending
        roundResults.sort((a, b) => b.votes - a.votes);

        // Check for majority winner (> 50%)
        if (roundResults.length > 0 && roundResults[0].percentage > 50) {
            winner = roundResults[0].candidateId;
            rounds.push({
                round: roundNumber,
                results: roundResults,
                winner,
            });
            break;
        }

        // Eliminate candidate with fewest votes
        if (roundResults.length > 1) {
            const eliminated = roundResults[roundResults.length - 1];
            eliminated.eliminated = true;
            eliminated.eliminatedRound = roundNumber;
            eliminatedCandidates.push(eliminated.candidateId);

            rounds.push({
                round: roundNumber,
                results: roundResults,
                eliminated: eliminated.candidateId,
            });
        } else if (roundResults.length === 1) {
            // Only one candidate left
            winner = roundResults[0].candidateId;
            rounds.push({
                round: roundNumber,
                results: roundResults,
                winner,
            });
        }
    }

    // If we exited without a clear winner, the last remaining candidate wins
    if (!winner && rounds.length > 0) {
        const lastRound = rounds[rounds.length - 1];
        const remaining = lastRound.results.find(r => !r.eliminated);
        if (remaining) {
            winner = remaining.candidateId;
            lastRound.winner = winner;
        }
    }

    return { rounds, winner, totalVotes };
}

// GET - Get election results
export async function GET(
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

        const candidates = await ElectionCandidate.find({ electionId: id }).sort({ order: 1 });
        const memberCount = await ClubMember.countDocuments({ electionId: id });
        const votedCount = await ClubMember.countDocuments({ electionId: id, hasVoted: true });
        const voteCount = await Vote.countDocuments({ electionId: id });

        let results;
        if (election.useRankedChoice && candidates.length > 2) {
            results = await calculateIRVResults(id, candidates);
        } else {
            const simple = await calculateSimpleResults(id, candidates);
            results = {
                rounds: [{
                    round: 1,
                    results: simple.results,
                    winner: simple.results[0]?.candidateId,
                }],
                winner: simple.results[0]?.candidateId,
                totalVotes: simple.totalVotes,
            };
        }

        return NextResponse.json({
            election: {
                _id: election._id,
                title: election.title,
                status: election.status,
                useRankedChoice: election.useRankedChoice,
            },
            stats: {
                memberCount,
                votedCount,
                voteCount,
                turnout: memberCount > 0 ? ((votedCount / memberCount) * 100).toFixed(1) : 0,
            },
            ...results,
        });
    } catch (error) {
        console.error('Error calculating results:', error);
        return NextResponse.json({ error: 'Sonuçlar hesaplanamadı' }, { status: 500 });
    }
}
