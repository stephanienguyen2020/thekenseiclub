import express, {Request, Response} from "express";
import {CoinSDK} from "coin-sdk/dist/src";
import {ACTIVE_NETWORK, getClient} from "../utils";
import {db} from "../db/database";

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
        const rs= await CoinSDK.deployNewCoin({...req.body, client: suiClient});
        console.log("Coin deployed successfully: ", rs);

        // Store coin data in the database
        const insertedCoin = await db
            .insertInto('coins')
            .values({
                id: rs.coinMetadata as string,
                name,
                symbol,
                description,
                imageUrl: iconUrl,
                address,
                created_at: new Date()
            })
            .returning(['id', 'name', 'symbol', 'description', 'imageUrl', 'address', 'created_at'])
            .executeTakeFirst();

        return res.status(200).json({ 
            message: "Coin deployed successfully",
            network: ACTIVE_NETWORK,
            coin: insertedCoin
        });
    } catch (error) {
        console.error("Error deploying coin:", error);
        return res.status(500).json({ 
            error: "Failed to deploy coin",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
})

/**
 * Endpoint to get all coins with pagination
 * @route GET /coins
 * @param {Request} req - Express request object with page and limit in query params
 * @param {Response} res - Express response object
 * @returns {Response} 200 with paginated coins data on success, error status on failure
 */
router.get('/coins', async (req: any, res: any) => {
    try {
        // Default pagination values
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        // Get total count for pagination metadata
        const countResult = await db
            .selectFrom('coins')
            .select(db.fn.count('id').as('count'))
            .executeTakeFirst();

        const totalCount = parseInt(countResult?.count as string) || 0;
        const totalPages = Math.ceil(totalCount / limit);

        // Get paginated coins
        const coins = await db
            .selectFrom('coins')
            .selectAll()
            .orderBy('created_at', 'desc')
            .limit(limit)
            .offset(offset)
            .execute();

        return res.status(200).json({
            data: coins,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages
            }
        });
    } catch (error) {
        console.error("Error fetching coins:", error);
        return res.status(500).json({ 
            error: "Failed to fetch coins",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

/**
 * Endpoint to get a coin by ID
 * @route GET /coin/:id
 * @param {Request} req - Express request object with coin ID in params
 * @param {Response} res - Express response object
 * @returns {Response} 200 with coin data on success, error status on failure
 */
router.get('/coin/:id', async (req: any, res: any) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "Coin ID is required" });
        }

        const coin = await db
            .selectFrom('coins')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();

        if (!coin) {
            return res.status(404).json({ error: "Coin not found" });
        }

        return res.status(200).json(coin);
    } catch (error) {
        console.error("Error fetching coin:", error);
        return res.status(500).json({ 
            error: "Failed to fetch coin",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

export default router;
