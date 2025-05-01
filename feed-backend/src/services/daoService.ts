import Proposal, { IProposal } from '../models/Proposal';
import Vote, { IVote } from '../models/Vote';

export class DaoService {
    // Create a new proposal
    async createProposal(proposalData: Omit<IProposal, 'voteCount' | 'votePoint' | 'status'>): Promise<IProposal> {
        const proposal = new Proposal({
            ...proposalData,
            voteCount: 0,
            votePoint: 0,
            status: 'open'
        });
        return await proposal.save();
    }

    // Get all proposals
    async getAllProposals(): Promise<IProposal[]> {
        return await Proposal.find();
    }

    // Get a specific proposal
    async getProposal(id: string): Promise<IProposal | null> {
        return await Proposal.findById(id);
    }

    // Submit a vote
    async submitVote(voteData: {
        wallet: string;
        proposalId: string;
        choice: string;
        signature: string;
    }): Promise<IVote> {
        const { wallet, proposalId, choice, signature } = voteData;

        // Check if proposal exists
        const proposal = await Proposal.findById(proposalId);
        if (!proposal) {
            throw new Error('Proposal not found');
        }

        // Check if proposal is still open
        if (proposal.status !== 'open') {
            throw new Error('Proposal is not open for voting');
        }

        // Check if user has already voted
        const existingVote = await Vote.findOne({ wallet, proposalId });
        if (existingVote) {
            throw new Error('You have already voted on this proposal');
        }

        // Create new vote
        const vote = new Vote({
            wallet,
            proposalId,
            choice,
            signature
        });

        await vote.save();

        // Update proposal vote count
        proposal.voteCount += 1;
        await proposal.save();

        return vote;
    }

    // Get votes for a proposal
    async getProposalVotes(proposalId: string): Promise<IVote[]> {
        return await Vote.find({ proposalId });
    }
}

export const daoService = new DaoService();
