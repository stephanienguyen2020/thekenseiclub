import express from "express";
import { BondingCurveSDK, CoinSDK } from "coin-sdk/dist/src";
import { ACTIVE_NETWORK, getClient } from "../utils";
import { db } from "../db/database";
import { getCurrentPrice, getMarketData } from "../services/marketDataService";
import { balanceService } from "../services/balanceService";
import { getActiveAddress } from "coin-sdk/dist/src/utils/sui-utils";

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
    console.log("Coin deployed successfully:", rs);
    return res.status(200).json({
      message: "Coin deployed successfully",
      network: ACTIVE_NETWORK,
      coin: {
        id: rs.coinMetadata,
      },
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
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = (page - 1) * limit;
    const userId = req.query.userId;

    // Get total count for pagination metadata
    let countQuery = db
      .selectFrom("coins")
      .select(db.fn.count("id").as("count"));

    let coinsQuery = db
      .selectFrom("coins as c")
      .leftJoin("bondingCurve as b", "c.id", "b.coinMetadata")
      .select([
        "c.id",
        "c.name",
        "c.symbol",
        "c.description",
        "c.logo",
        "c.address",
        "c.createdAt",
        "b.id as bondingCurveId",
      ])
      .orderBy("c.createdAt", "desc")
      .limit(limit)
      .offset(offset);
    console.log("coinsQuery");
    if (userId) {
      console.log("coinsQuery???", userId);

      countQuery = countQuery.where("address", "=", userId);
      coinsQuery = coinsQuery.where("address", "=", userId);
    }

    const countResult = await countQuery.executeTakeFirst();

    const totalCount = parseInt(countResult?.count as string) || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated coins with bonding curve IDs
    const coins = await coinsQuery.execute();

    // For each coin, calculate market data if it has a bonding curve
    const enrichedCoins = await Promise.all(
      coins.map(async (coin) => {
        if (coin.bondingCurveId) {
          const price = await getCurrentPrice(coin.bondingCurveId);
          const marketData = await getMarketData(
            coin.id,
            coin.bondingCurveId,
            price
          );
          return { ...coin, ...marketData };
        }
        return {
          ...coin,
          suiPrice: 0,
          price: 0, // USD price
          change24h: 0,
          volume24h: "0",
          marketCap: "0",
          holders: 0,
        };
      })
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
        "c.logo",
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
      suiPrice: 0,
      price: 0, // USD price
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

/**
 * Endpoint to get all coins without pagination
 * @route GET /allCoins
 */
router.get("/allCoins", async (req: any, res: any) => {
  try {
    // Get all coins directly from coins table without joins
    const coins = await db
      .selectFrom("coins")
      .select([
        "id",
        "name",
        "symbol",
        "description",
        "logo",
        "address",
        "createdAt",
      ])
      .orderBy("createdAt", "desc")
      .execute();

    return res.status(200).json({
      data: coins,
    });
  } catch (error) {
    console.error("Error fetching all coins:", error);
    return res.status(500).json({
      error: "Failed to fetch all coins",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Endpoint to get all coins held by a wallet address
 * @route GET /holding-coins/:walletAddress
 */
router.get("/holding-coins/:walletAddress", async (req: any, res: any) => {
  try {
    const { walletAddress } = req.params;
    // Default pagination values
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = (page - 1) * limit;

    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    // Get all coin balances for the wallet address
    const allCoins = await balanceService.getAllCoinBalances(walletAddress);

    // Count total coins for pagination
    const totalCount = allCoins.length;
    const totalPages = Math.ceil(totalCount / limit);

    // Apply pagination
    const paginatedCoins = allCoins.slice(offset, offset + limit);

    // For each coin, try to enrich it with data from our database
    const enrichedCoins = await Promise.all(
      paginatedCoins.map(async (coin) => {
        try {
          // Try to find matching coin in our database by looking for similar coin type
          const dbCoin = await db
            .selectFrom("coins as c")
            .leftJoin("bondingCurve as b", "c.id", "b.coinMetadata")
            .select([
              "c.id",
              "c.name",
              "c.symbol",
              "c.description",
              "c.logo",
              "c.address",
              "c.createdAt",
              "b.id as bondingCurveId",
            ])
            .where("c.id", "=", coin.id as string)
            .executeTakeFirst();

          console.log("dbCoin", dbCoin);

          // If found in our database, enrich with market data
          if (dbCoin && dbCoin.bondingCurveId) {
            const price = await getCurrentPrice(dbCoin.bondingCurveId);
            const marketData = await getMarketData(
              dbCoin.id,
              dbCoin.bondingCurveId,
              price
            );

            return {
              ...coin,
              name: dbCoin.name || coin.symbol,
              description: dbCoin.description || "No description available",
              logo: dbCoin.logo || "",
              suiPrice: marketData.suiPrice,
              price: marketData.price, // USD price
              change24h: marketData.change24h,
              volume24h: marketData.volume24h,
              marketCap: marketData.marketCap,
              holders: marketData.holders,
              holdings: coin.balance,
            };
          }

          // If not found, return basic coin data
          return {
            ...coin,
            name: coin.symbol,
            description: "No description available",
            logo: "",
            suiPrice: 0,
            price: 0, // USD price
            change24h: 0,
            volume24h: "0",
            marketCap: "0",
            holders: 0,
          };
        } catch (error) {
          // In case of any error processing a coin, return basic data
          console.error(`Error enriching coin data for ${coin.symbol}:`, error);
          return {
            ...coin,
            name: coin.symbol,
            description: "No description available",
            logo: "",
            suiPrice: 0,
            price: 0,
            change24h: 0,
            volume24h: "0",
            marketCap: "0",
            holders: 0,
          };
        }
      })
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
    console.error("Error fetching holding coins:", error);
    return res.status(500).json({
      error: "Failed to fetch holding coins",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/migrate", async (req: any, res: any) => {
  try {
    const { bondingCurveId, packageId } = req.query;
    const client = getClient(ACTIVE_NETWORK);
    const bondingCurve: any = await client.getObject({
      id: bondingCurveId,
      options: {
        showType: true,
        showContent: true,
        showDisplay: true,
        showOwner: true,
        showPreviousTransaction: true,
      },
    });
    const bondingCurveData = bondingCurve.data?.content.fields;

    if (
      bondingCurveData.token_balance <= bondingCurveData.target_supply_threshold
    ) {
      const bondingCurveSdk = new BondingCurveSDK(
        bondingCurveId,
        client,
        packageId
      );
      const result = await bondingCurveSdk.migrateToFlowx(getActiveAddress());
      return res.status(200).json({
        message: "Migration successful",
        result,
      });
    } else {
      return res.status(400).json({
        error:
          "Migration not allowed. Token balance exceeds target supply threshold.",
      });
    }
  } catch (error) {
    console.error("Error during migration:", error);
    return res.status(500).json({
      error: "Failed to migrate bonding curve",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
