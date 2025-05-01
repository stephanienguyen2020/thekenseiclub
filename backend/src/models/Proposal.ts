import mongoose, { Schema, Document } from 'mongoose';

export interface IProposal extends Document {
    title: string;
    description: string;
    options: string[];
    createdBy: string;
    createdAt: Date;
    startDate: Date;
    endDate: Date;
    ipfsHash: string;
    contentHash: string;
    voteCount: number;
    votePoint: number;
    status: 'open' | 'closed' | 'nominated';
    winningOption?: string;
}

const ProposalSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    options: { type: [String], required: true },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    startDate: { 
        type: Date, 
        required: true,
        validate: {
            validator: function(v: Date) {
                return v instanceof Date && !isNaN(v.getTime());
            },
            message: 'startDate must be a valid date'
        }
    },
    endDate: { 
        type: Date, 
        required: true,
        validate: {
            validator: function(v: Date) {
                return v instanceof Date && !isNaN(v.getTime());
            },
            message: 'endDate must be a valid date'
        }
    },
    ipfsHash: { type: String, required: true },
    contentHash: { type: String, required: true },
    voteCount: { type: Number, default: 0 },
    votePoint: { type: Number, default: 0 },
    status: { type: String, enum: ['open', 'closed', 'nominated'], default: 'open' },
    winningOption: { type: String }
});

// Add validation to ensure endDate is after startDate
ProposalSchema.pre('validate', function(next) {
    if (this.startDate && this.endDate && this.endDate <= this.startDate) {
        next(new Error('endDate must be after startDate'));
    } else {
        next();
    }
});

export default mongoose.model<IProposal>('Proposal', ProposalSchema); 