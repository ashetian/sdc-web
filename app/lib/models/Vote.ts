import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVote extends Document {
    electionId: mongoose.Types.ObjectId;
    voterHash: string; // SHA256 of studentNo for anonymity
    rankings: mongoose.Types.ObjectId[]; // Candidate IDs in order of preference
    votedAt: Date;
}

const VoteSchema = new Schema<IVote>(
    {
        electionId: {
            type: Schema.Types.ObjectId,
            ref: 'Election',
            required: true,
        },
        voterHash: {
            type: String,
            required: true,
        },
        rankings: [{
            type: Schema.Types.ObjectId,
            ref: 'ElectionCandidate',
        }],
        votedAt: {
            type: Date,
            default: Date.now,
        },
    }
);

VoteSchema.index({ electionId: 1, voterHash: 1 }, { unique: true });

const Vote: Model<IVote> =
    mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema);

export default Vote;
