import { Router } from "express";
import { daoService } from '../services/daoService';

const router = Router();

// Create a new proposal
router.post('/proposals', async (req: any, res: any) => {
    try {
        const proposal = await daoService.createProposal(req.body);
        res.status(201).json(proposal);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create proposal' , details: error });
    }
});

// Get all proposals
router.get('/proposals', async (req: any, res: any) => {
    try {
        const proposals = await daoService.getAllProposals();
        res.json(proposals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch proposals' , details: error });
    }
});

// Get proposals by token address
router.get('/proposals/token/:tokenAddress', async (req: any, res: any) => {
    try {
        const proposals = await daoService.getProposalsByToken(req.params.tokenAddress);
        res.json(proposals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch proposals by token', details: error });
    }
});

// Get proposals by wallet address
router.get('/proposals/wallet/:wallet', async (req: any, res: any) => {
    try {
        const proposals = await daoService.getProposalsByWallet(req.params.wallet);
        res.json(proposals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch proposals by wallet' , details: error });
    }
});

// Get a specific proposal
router.get('/proposals/:id', async (req: any, res: any) => {
    try {
        const proposal = await daoService.getProposal(req.params.id);
        if (!proposal) {
            return res.status(404).json({ error: 'Proposal not found' });
        }
        res.json(proposal);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch proposal' , details: error });
    }
});

// Submit a vote
router.post('/votes', async (req: any, res: any) => {
    try {
        const vote = await daoService.submitVote(req.body);
        res.status(201).json(vote);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: 'Failed to submit vote' , details: error });
        }
    }
});

// Get votes for a proposal
router.get('/proposals/:id/votes', async (req: any, res: any) => {
    try {
        const votes = await daoService.getProposalVotes(req.params.id);
        res.json(votes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch votes' , details: error });
    }
});

// Get user's vote for a specific proposal
router.get('/proposals/:proposalId/votes/user/:wallet', async (req: any, res: any) => {
    try {
        const vote = await daoService.getUserVoteForProposal(req.params.wallet, req.params.proposalId);
        if (!vote) {
            return res.status(404).json({ error: 'Vote not found' });
        }
        res.json(vote);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user vote', details: error });
    }
});

export default router; 