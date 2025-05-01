import Proposal, { IProposal } from '../models/Proposal';
import Vote, { IVote } from '../models/Vote';
import { balanceService } from './balanceService';

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
        return await Proposal.find().sort({ createdAt: -1 });
    }

    // Get proposals by token address
    async getProposalsByToken(tokenAddress: string): Promise<IProposal[]> {
        return await Proposal.find({ tokenAddress }).sort({ createdAt: -1 });
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

    // Get all proposals by wallet address
    async getProposalsByWallet(wallet: string): Promise<{
        active: IProposal[];
        closed: IProposal[];
    }> {
        const proposals = await Proposal.find({ createdBy: wallet }).sort({ createdAt: -1 });
        
        return {
            active: proposals.filter(p => p.status === 'open'),
            closed: proposals.filter(p => p.status === 'closed')
        };
    }

    // Close a proposal and determine the winning side
    async closeProposal(proposalId: string): Promise<IProposal> {
        const proposal = await Proposal.findById(proposalId);
        if (!proposal) {
            throw new Error('Proposal not found');
        }

        if (proposal.status !== 'open') {
            throw new Error('Proposal is not open');
        }

        // Get all votes for this proposal
        const votes = await Vote.find({ proposalId });
        
        // Count weighted votes for each option
        const voteCounts: Record<string, number> = {};
        proposal.options.forEach(option => {
            voteCounts[option] = 0;
        });

        // Calculate weighted votes based on user's SUI balance
        for (const vote of votes) {
            try {
                const userBalance = await balanceService.getSUIBalance(vote.wallet);
                voteCounts[vote.choice] = (voteCounts[vote.choice] || 0) + userBalance;
            } catch (error) {
                console.error(`Error getting balance for wallet ${vote.wallet}:`, error);
                // If we can't get the balance, count as 1 vote
                voteCounts[vote.choice] = (voteCounts[vote.choice] || 0) + 1;
            }
        }

        // Find the winning option (option with most weighted votes)
        let winningOption = '';
        let maxVotes = 0;
        for (const [option, count] of Object.entries(voteCounts)) {
            if (count > maxVotes) {
                maxVotes = count;
                winningOption = option;
            }
        }

        // Update proposal status and winning option
        proposal.status = 'closed';
        proposal.winningOption = winningOption;
        proposal.voteCount = votes.length;
        proposal.votePoint = maxVotes;

        return await proposal.save();
    }

    // Check and close expired proposals
    async checkAndCloseExpiredProposals(): Promise<void> {
        const now = new Date();
        const expiredProposals = await Proposal.find({
            status: 'open',
            endDate: { $lte: now }
        });

        for (const proposal of expiredProposals) {
            await this.closeProposal(proposal._id as string);
        }
    }
}

export const daoService = new DaoService();
