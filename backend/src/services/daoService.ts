import Proposal, { IProposal } from '../models/Proposal';
import Vote, { IVote } from '../models/Vote';
import { balanceService } from './balanceService';
import { tuskyService } from './tuskyService';
import dotenv from 'dotenv';

dotenv.config(); // Ensure environment variables are loaded

// Define a more specific input type for proposal creation
interface CreateProposalInput {
    title: string;
    description: string;
    options: string[]; // Input options are just strings
    createdBy: string;
    tokenAddress: string;
    startDate: Date;
    endDate: Date;
    tag: string;
    image: Buffer; // Image is a Buffer
}

export class DaoService {
    // Create a new proposal
    async createProposal(proposalData: CreateProposalInput): Promise<IProposal> {
        const imageVaultId = process.env.TUSKY_PROPOSAL_IMAGE_VAULT_ID;
        const proposalVaultId = process.env.TUSKY_PROPOSAL_VAULT_ID;

        if (!imageVaultId) {
            console.error('TUSKY_PROPOSAL_IMAGE_VAULT_ID is not set in environment variables.');
            throw new Error('Server configuration error: Tusky image vault ID missing.');
        }
        if (!proposalVaultId) {
            console.error('TUSKY_PROPOSAL_VAULT_ID is not set in environment variables.');
            throw new Error('Server configuration error: Tusky proposal vault ID missing.');
        }

        // 1. Upload image to Tusky
        const imageFilename = `proposal_image_${Date.now()}_${proposalData.title.replace(/\s+/g, '_')}.png`;
        const imageUploadId = await tuskyService.uploadDocumentToVault(imageVaultId, proposalData.image, imageFilename);

        // 2. Prepare and upload proposal content (JSON) to Tusky
        const { image, ...jsonDataToUpload } = proposalData;
        const proposalContentBuffer = Buffer.from(JSON.stringify(jsonDataToUpload)); // Uploads proposalData excluding image
        const proposalFilename = `proposal_content_${Date.now()}_${proposalData.title.replace(/\s+/g, '_')}.json`;
        const contentUploadId = await tuskyService.uploadDocumentToVault(proposalVaultId, proposalContentBuffer, proposalFilename);

        const proposal = new Proposal({
            title: proposalData.title,
            description: proposalData.description,
            options: proposalData.options.map(option => ({
                option,
                votes: 0,
                points: 0
            })),
            createdBy: proposalData.createdBy,
            tokenAddress: proposalData.tokenAddress,
            startDate: proposalData.startDate,
            endDate: proposalData.endDate,
            tag: proposalData.tag,
            voteCount: 0,
            votePoint: 0,
            status: 'open',
            upload_id: contentUploadId, // Tusky ID for proposal content
            image_upload_id: imageUploadId, // Tusky ID for image
        });

        const savedProposal = await proposal.save();
        return savedProposal;
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

        // Update proposal vote count and points
        const userBalance = await balanceService.getSUIBalance(wallet);
        const optionIndex = proposal.options.findIndex(opt => opt.option === choice);
        if (optionIndex !== -1) {
            proposal.options[optionIndex].votes += 1;
            proposal.options[optionIndex].points += userBalance;
            proposal.voteCount += 1;
            proposal.votePoint += userBalance;
        }

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
        try {
            // Find the proposal and lock it for update
            const proposal = await Proposal.findById(proposalId);
            if (!proposal) {
                throw new Error('Proposal not found');
            }

            if (proposal.status !== 'open') {
                throw new Error('Proposal is not open');
            }

            // Get all votes for this proposal
            const votes = await Vote.find({ proposalId: proposal._id });
            
            // Reset vote counts
            proposal.options = proposal.options.map(opt => ({
                option: opt.option,
                votes: 0,
                points: 0
            }));
            
            // Calculate final vote counts and points at closing time
            for (const vote of votes) {
                try {
                    const userBalance = await balanceService.getSUIBalance(vote.wallet);
                    const optionIndex = proposal.options.findIndex(opt => opt.option === vote.choice);
                    if (optionIndex !== -1) {
                        proposal.options[optionIndex].votes += 1;
                        proposal.options[optionIndex].points += userBalance;
                    }
                } catch (error) {
                    console.error(`Error getting balance for wallet ${vote.wallet}:`, error);
                    // If we can't get the balance, count as 1 vote and 1 point
                    const optionIndex = proposal.options.findIndex(opt => opt.option === vote.choice);
                    if (optionIndex !== -1) {
                        proposal.options[optionIndex].votes += 1;
                        proposal.options[optionIndex].points += 1;
                    }
                }
            }
            
            // Update total vote count and points
            proposal.voteCount = proposal.options.reduce((sum, opt) => sum + opt.votes, 0);
            proposal.votePoint = proposal.options.reduce((sum, opt) => sum + opt.points, 0);

            // Find the winning option (option with most points)
            let winningOption = '';
            let maxPoints = 0;
            for (const option of proposal.options) {
                if (option.points > maxPoints) {
                    maxPoints = option.points;
                    winningOption = option.option;
                }
            }

            // Update proposal status and winning option
            proposal.status = 'closed';
            proposal.winningOption = winningOption;

            // Use findOneAndUpdate to handle version conflicts
            const updatedProposal = await Proposal.findOneAndUpdate(
                { _id: proposalId, status: 'open' },
                {
                    $set: {
                        options: proposal.options,
                        voteCount: proposal.voteCount,
                        votePoint: proposal.votePoint,
                        status: 'closed',
                        winningOption: winningOption
                    }
                },
                { new: true }
            );

            if (!updatedProposal) {
                throw new Error('Failed to update proposal - it may have been modified by another process');
            }

            return updatedProposal;
        } catch (error) {
            console.error('Error in closeProposal:', error);
            throw error;
        }
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

    // Get user's vote for a specific proposal
    async getUserVoteForProposal(wallet: string, proposalId: string): Promise<IVote | null> {
        return await Vote.findOne({ wallet, proposalId });
    }

    // Update vote statistics for all open proposals
    async updateVoteStatistics(): Promise<void> {
        const openProposals = await Proposal.find({ status: 'open' });
        
        for (const proposal of openProposals) {
            // Get all votes for this proposal
            const votes = await Vote.find({ proposalId: proposal._id });
            
            // Reset vote counts
            proposal.options = proposal.options.map(opt => ({
                option: opt.option,
                votes: 0,
                points: 0
            }));
            
            // Calculate new vote counts and points
            for (const vote of votes) {
                try {
                    const userBalance = await balanceService.getSUIBalance(vote.wallet);
                    const optionIndex = proposal.options.findIndex(opt => opt.option === vote.choice);
                    if (optionIndex !== -1) {
                        proposal.options[optionIndex].votes += 1;
                        proposal.options[optionIndex].points += userBalance;
                    }
                } catch (error) {
                    console.error(`Error getting balance for wallet ${vote.wallet}:`, error);
                    // If we can't get the balance, count as 1 vote and 1 point
                    const optionIndex = proposal.options.findIndex(opt => opt.option === vote.choice);
                    if (optionIndex !== -1) {
                        proposal.options[optionIndex].votes += 1;
                        proposal.options[optionIndex].points += 1;
                    }
                }
            }
            
            // Update total vote count and points
            proposal.voteCount = proposal.options.reduce((sum, opt) => sum + opt.votes, 0);
            proposal.votePoint = proposal.options.reduce((sum, opt) => sum + opt.points, 0);
            
            await proposal.save();
        }
    }

    // Get proposal image from Tusky
    async getProposalImage(proposalId: string): Promise<Buffer | null> {
        try {
            const proposal = await Proposal.findById(proposalId);
            if (!proposal || !proposal.image_upload_id) {
                return null;
            }

            const imageBuffer = await tuskyService.downloadFile(proposal.image_upload_id);
            return Buffer.from(imageBuffer);
        } catch (error) {
            console.error('Error fetching proposal image:', error);
            throw error;
        }
    }

    // Get proposal content from Tusky
    async getProposalContent(proposalId: string): Promise<any | null> {
        try {
            const proposal = await Proposal.findById(proposalId);
            if (!proposal || !proposal.upload_id) {
                return null;
            }

            const contentBuffer = await tuskyService.downloadFile(proposal.upload_id);
            const contentString = Buffer.from(contentBuffer).toString('utf-8');
            return JSON.parse(contentString);
        } catch (error) {
            console.error('Error fetching proposal content:', error);
            throw error;
        }
    }
}

export const daoService = new DaoService();
