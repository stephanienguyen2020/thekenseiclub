import express from "express";
import { CoinSDK } from "coin-sdk/dist/src";
import { ACTIVE_NETWORK, getClient } from "../utils";
import { db } from "../db/database";
import { getCurrentPrice, getMarketData } from "../services/marketDataService";

const router = express.Router();

/**
 * Endpoint to deploy a new coin on the Sui blockchain
 * @route POST /coin
 */
router.post("/coin", async (req: any, res: any) => {
  try {
    // Validate required fields
    const { name, symbol, description, iconUrl, address } = req.body;

    if (!name || !symbol || !description || !iconUrl || !address) {
      return res.status(400).json({
        error:
          "Missing required fields. Please provide name, symbol, description, iconUrl, and address.",
      });
    }

    const suiClient = getClient(ACTIVE_NETWORK);
    const rs = await CoinSDK.deployNewCoin({ ...req.body, client: suiClient });
    console.log("Coin deployed successfully: ", rs);

    // Store coin data in the database
    const insertedCoin = await db
      .insertInto("coins")
      .values({
        id: rs.coinMetadata as string,
        name,
        symbol,
        description,
        imageUrl: iconUrl,
        address,
        createdAt: new Date(),
      })
      .returning([
        "id",
        "name",
        "symbol",
        "description",
        "imageUrl",
        "address",
        "createdAt",
      ])
      .executeTakeFirst();

    return res.status(200).json({
      message: "Coin deployed successfully",
      network: ACTIVE_NETWORK,
      coin: insertedCoin,
    });
  } catch (error) {
    console.error("Error deploying coin:", error);
    return res.status(500).json({
      error: "Failed to deploy coin",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Endpoint to get all coins with pagination
 * @route GET /coins
 */
router.get("/coins", async (req: any, res: any) => {
  try {
    // Default pagination values
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Get total count for pagination metadata
    const countResult = await db
      .selectFrom("coins")
      .select(db.fn.count("id").as("count"))
      .executeTakeFirst();

    const totalCount = parseInt(countResult?.count as string) || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated coins with bonding curve IDs
    const coins = await db
      .selectFrom("coins as c")
      .leftJoin("bondingCurve as b", "c.id", "b.coinMetadata")
      .select([
        "c.id",
        "c.name",
        "c.symbol",
        "c.description",
        "c.imageUrl",
        "c.address",
        "c.createdAt",
        "b.id as bondingCurveId",
      ])
      .orderBy("c.createdAt", "desc")
      .limit(limit)
      .offset(offset)
      .execute();

    // For each coin, calculate market data if it has a bonding curve
    const enrichedCoins = await Promise.all(
      coins.map(async (coin) => {
        if (coin.bondingCurveId) {
          const price = await getCurrentPrice(coin.bondingCurveId);
          const marketData = await getMarketData(
            coin.id,
            coin.bondingCurveId,
            price,
          );
          return { ...coin, ...marketData };
        }
        return {
          ...coin,
          change24h: 0,
          volume24h: "0",
          marketCap: "0",
          holders: 0,
        };
      }),
    );

    return res.status(200).json({
      data: enrichedCoins,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching coins:", error);
    return res.status(500).json({
      error: "Failed to fetch coins",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Endpoint to get a coin by ID
 * @route GET /coin/:id
 */
router.get("/coin/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Coin ID is required" });
    }

    // Get the coin with bonding curve ID
    const coin = await db
      .selectFrom("coins as c")
      .leftJoin("bondingCurve as b", "c.id", "b.coinMetadata")
      .select([
        "c.id",
        "c.name",
        "c.symbol",
        "c.description",
        "c.imageUrl",
        "c.address",
        "c.createdAt",
        "b.id as bondingCurveId",
      ])
      .where("c.id", "=", id)
      .executeTakeFirst();

    if (!coin) {
      return res.status(404).json({ error: "Coin not found" });
    }

    // Calculate market data if bonding curve exists
    let marketData = {
      price: 0,
      change24h: 0,
      volume24h: "0",
      marketCap: "0",
      holders: 0,
    };

    if (coin.bondingCurveId) {
      const price = await getCurrentPrice(coin.bondingCurveId);
      marketData = await getMarketData(coin.id, coin.bondingCurveId, price);
    }

    // Return coin with market data
    return res.status(200).json({
      ...coin,
      ...marketData,
    });
  } catch (error) {
    console.error("Error fetching coin:", error);
    return res.status(500).json({
      error: "Failed to fetch coin",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
