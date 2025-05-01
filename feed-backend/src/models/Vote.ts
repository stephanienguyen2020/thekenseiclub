import mongoose, { Schema, Document } from 'mongoose';

export interface IVote extends Document {
    wallet: string;
    proposalId: mongoose.Types.ObjectId;
    choice: string;
    signature: string;
    timestamp: Date;
}

const VoteSchema: Schema = new Schema({
    wallet: { type: String, required: true },
    proposalId: { type: Schema.Types.ObjectId, ref: 'Proposal', required: true },
    choice: { type: String, required: true },
    signature: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

// Create a compound index to ensure one vote per wallet per proposal
VoteSchema.index({ wallet: 1, proposalId: 1 }, { unique: true });

export default mongoose.model<IVote>('Vote', VoteSchema); 