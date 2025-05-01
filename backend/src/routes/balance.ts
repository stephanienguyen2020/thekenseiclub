import { Router } from "express";
import { balanceService } from '../services/balanceService';

const router = Router();

// Get SUI balance for a wallet address
router.get('/balance/:address', async (req: any, res: any) => {
    try {
        const balance = await balanceService.getSUIBalance(req.params.address);
        res.json({ balance });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch SUI balance' });
    }
});

export default router; 