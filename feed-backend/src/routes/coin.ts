import express, {Request, Response} from "express";
import {CoinSDK} from "coin-sdk/dist/src";
import {ACTIVE_NETWORK, getClient} from "../utils";

const router = express.Router();

interface Coin {
    name: string;
    symbol: string;
    description: string;
    iconUrl: string;
    client?: any; // Optional as we'll add it in the handler
    address: string;
}

interface CoinRequest extends Request {
    body: Coin;
}

/**
 * Endpoint to deploy a new coin on the Sui blockchain
 * @route POST /coin
 * @param {CoinRequest} req - Express request object with Coin data in body
 * @param {Response} res - Express response object
 * @returns {Response} 200 on success, error status on failure
 */
router.post('/coin', async (req: any, res: any) => {
    try {
        // Validate required fields
        const { name, symbol, description, iconUrl, address } = req.body;

        if (!name || !symbol || !description || !iconUrl || !address) {
            return res.status(400).json({ 
                error: "Missing required fields. Please provide name, symbol, description, iconUrl, and address." 
            });
        }

        const suiClient = getClient(ACTIVE_NETWORK);
        await CoinSDK.deployNewCoin({...req.body, client: suiClient});

        return res.status(200).json({ 
            message: "Coin deployed successfully",
            network: ACTIVE_NETWORK
        });
    } catch (error) {
        console.error("Error deploying coin:", error);
        return res.status(500).json({ 
            error: "Failed to deploy coin",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
})

export default router;
