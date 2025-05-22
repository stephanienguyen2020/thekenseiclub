import mongoose, { Schema, Document } from 'mongoose';

export interface IProposal extends Document {
    title: string;
    description: string;
    options: {
        option: string;
        votes: number;
        points: number;
    }[];
    createdBy: string;
    tokenAddress: string;
    createdAt: Date;
    startDate: Date;
    endDate: Date;
    upload_id: string;
    voteCount: number;
    votePoint: number;
    status: 'open' | 'closed' | 'upcoming';
    winningOption?: string;
    tag: string;
    image_upload_id: string;
}

const ProposalSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    options: [{
        option: { type: String, required: true },
        votes: { type: Number, default: 0 },
        points: { type: Number, default: 0 }
    }],
    createdBy: { type: String, required: true },
    tokenAddress: { type: String, required: true },
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
    upload_id: { type: String, required: true },
    voteCount: { type: Number, default: 0 },
    votePoint: { type: Number, default: 0 },
    status: { type: String, enum: ['open', 'closed', 'upcoming'], default: 'open' },
    winningOption: { type: String },
    tag: { type: String, required: true },
    image_upload_id: { type: String, required: true }
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