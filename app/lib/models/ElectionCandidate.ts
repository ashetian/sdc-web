import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IElectionCandidate extends Document {
    electionId: mongoose.Types.ObjectId;
    name: string;
    photo?: string;
    bio?: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const ElectionCandidateSchema = new Schema<IElectionCandidate>(
    {
        electionId: {
            type: Schema.Types.ObjectId,
            ref: 'Election',
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        photo: {
            type: String,
        },
        bio: {
            type: String,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

ElectionCandidateSchema.index({ electionId: 1 });

const ElectionCandidate: Model<IElectionCandidate> =
    mongoose.models.ElectionCandidate || mongoose.model<IElectionCandidate>('ElectionCandidate', ElectionCandidateSchema);

export default ElectionCandidate;
