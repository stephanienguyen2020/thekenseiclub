import mongoose, { Schema, Document } from 'mongoose';

export interface IProposal extends Document {
    title: string;
    description: string;
    options: string[];
    createdBy: string;
    createdAt: Date;
    startDate: string;
    endDate: string;
    ipfsHash: string;
    contentHash: string;
    voteCount: number;
    votePoint: number;
    status: 'open' | 'closed' | 'nominated';
}

const ProposalSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    options: { type: [String], required: true },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    ipfsHash: { type: String, required: true },
    contentHash: { type: String, required: true },
    voteCount: { type: Number, default: 0 },
    votePoint: { type: Number, default: 0 },
    status: { type: String, enum: ['open', 'closed', 'nominated'], default: 'open' }
});

export default mongoose.model<IProposal>('Proposal', ProposalSchema); 