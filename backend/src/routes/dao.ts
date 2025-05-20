import { Router } from "express";
import { daoService } from '../services/daoService';
import multer from "multer";

const router = Router();

// Initialize multer with memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ["image/jpeg", "image/png"];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only .jpg, .jpeg and .png files are allowed"));
        }
    }
});

// Create a new proposal
router.post('/proposals', upload.single('image'), async (req: any, res: any) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image is required' });
        }

        // Create proposal data object
        const proposalData = {
            ...req.body,
            options: JSON.parse(req.body.options), // Parse options array from form data
            image: req.file.buffer // Pass the image buffer to the service
        };

        const proposal = await daoService.createProposal(proposalData);
        res.status(201).json(proposal);
    } catch (error) {
        console.error('Error creating proposal:', error);
        res.status(400).json({ 
            error: 'Failed to create proposal',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
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

// Get proposal image
router.get('/proposals/:id/image', async (req: any, res: any) => {
    console.log("Getting proposal image");
    try {
        const imageBuffer = await daoService.getProposalImage(req.params.id);
        if (!imageBuffer) {
            return res.status(404).json({ error: 'Proposal image not found' });
        }
        console.log("Getting proposal image");
        // Set appropriate headers for image response
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Length', imageBuffer.length);
        res.send(imageBuffer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch proposal image', details: error });
    }
});

// Get proposal content
router.get('/proposals/:id/content', async (req: any, res: any) => {
    try {
        const content = await daoService.getProposalContent(req.params.id);
        if (!content) {
            return res.status(404).json({ error: 'Proposal content not found' });
        }
        res.json(content);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch proposal content', details: error });
    }
});

export default router; 