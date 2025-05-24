import { BondingCurveSDK, CoinSDK } from "coin-sdk/dist/src";
import { getActiveAddress } from "coin-sdk/dist/src/utils/sui-utils";
import express from "express";
import { db } from "../db/database";
import { balanceService } from "../services/balanceService";
import { daoService } from "../services/daoService";
import { getCurrentPrice, getMarketData } from "../services/marketDataService";
import { ACTIVE_NETWORK, getClient } from "../utils";

const router = express.Router();

/**
 * Utility function to get coin tribe
 */
async function getCoinTribe(coinId: string): Promise<string> {
  try {
    const coinTribe = await db
      .selectFrom("coinTribes")
      .select(["tribe"])
      .where("coinId", "=", coinId)
      .executeTakeFirst();

    return coinTribe?.tribe || "wildcards";
  } catch (error) {
    console.error("Error fetching coin tribe:", error);
    return "wildcards";
  }
}

/**
 * Utility function to enrich coin data with default tribe if missing
 */
function enrichCoinWithTribe(coin: any) {
  return {
    ...coin,
    tribe: coin.tribe || "wildcards",
  };
}

/**
 * Endpoint to deploy a new coin on the Sui blockchain
 * @route POST /coin
 */
router.post("/coin", async (req: any, res: any) => {
  try {
    // Validate required fields
    const { name, symbol, description, iconUrl, address, tribe } = req.body;

    if (!name || !symbol || !description || !iconUrl) {
      return res.status(400).json({
        error:
          "Missing required fields. Please provide name, symbol, description, iconUrl, and address.",
      });
    }

    const suiClient = getClient(ACTIVE_NETWORK);
    const rs = await CoinSDK.deployNewCoin({ ...req.body, client: suiClient });
    console.log("Coin deployed successfully:", rs);

    console.log("tribe", tribe);
    console.log("rs.coinMetadata", rs.coinMetadata);

    // Insert the coin-tribe relationship if provided
    if (tribe && rs.coinMetadata) {
      console.log("Inserting coin-tribe relationship:", {
        coinId: rs.coinMetadata,
        tribe,
      });
      try {
        await db
          .insertInto("coinTribes")
          .values({
            coinId: rs.coinMetadata,
            tribe: tribe,
          })
          .execute();
      } catch (dbError) {
        console.error("Error inserting coin-tribe relationship:", dbError);
        // Don't fail the request if tribe insert fails
      }
    }

    return res.status(200).json({
      message: "Coin deployed successfully",
      network: ACTIVE_NETWORK,
      coin: {
        id: rs.coinMetadata,
        tribe: tribe || "wildcards",
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
 * Endpoint to get tribe for a specific coin
 * @route GET /coin/:id/tribe
 */
router.get("/coin/:id/tribe", async (req: any, res: any) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Coin ID is required" });
    }

    const coinTribe = await db
      .selectFrom("coinTribes")
      .select(["tribe"])
      .where("coinId", "=", id)
      .executeTakeFirst();

    return res.status(200).json({
      coinId: id,
      tribe: coinTribe?.tribe || "wildcards",
    });
  } catch (error) {
    console.error("Error fetching coin tribe:", error);
    return res.status(500).json({
      error: "Failed to fetch coin tribe",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Endpoint to get all coins with pagination and tribe information
 * @route GET /coins
 * @returns {Object} Response containing paginated coins with tribe data
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
      .leftJoin("coinTribes as ct", "c.id", "ct.coinId")
      .select([
        "c.id",
        "c.name",
        "c.symbol",
        "c.description",
        "c.logo",
        "c.address",
        "c.createdAt",
        "ct.tribe",
        "b.id as bondingCurveId",
      ])
      .orderBy("c.createdAt", "desc")
      .limit(limit)
      .offset(offset);

    if (userId) {
      countQuery = countQuery.where("address", "=", userId);
      coinsQuery = coinsQuery.where("address", "=", userId);
    }

    const countResult = await countQuery.executeTakeFirst();

    const totalCount = parseInt(countResult?.count as string) || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated coins with bonding curve IDs
    const coins = await coinsQuery.execute();

    // For each coin, calculate market data if it has a bonding curve
    let enrichedCoins = await Promise.all(
      coins.map(async (coin) => {
        const enrichedCoin = enrichCoinWithTribe(coin);
        if (coin.bondingCurveId) {
          const price = await getCurrentPrice(coin.bondingCurveId);
          const marketData = await getMarketData(
            coin.id,
            coin.bondingCurveId,
            price
          );
          return { ...enrichedCoin, ...marketData };
        }

        // For coins without bonding curve, get proposal count
        const proposals = await daoService.getProposalsByToken(coin.id);

        return {
          ...enrichedCoin,
          suiPrice: 0,
          price: 0, // USD price
          change24h: 0,
          volume24h: "0",
          marketCap: "0",
          holders: 0,
          proposals: proposals.length,
        };
      })
    );

    enrichedCoins = enrichedCoins.filter(
      (coin) => coin.price && coin.price > 0 && coin.price !== Infinity
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
 * Endpoint to get a coin by ID with tribe information
 * @route GET /coin/:id
 * @returns {Object} Response containing coin details with tribe data
 */
router.get("/coin/:id", async (req: any, res: any) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Coin ID is required" });
    }

    // Get the coin with bonding curve ID and tribe information
    const coin = await db
      .selectFrom("coins as c")
      .leftJoin("bondingCurve as b", "c.id", "b.coinMetadata")
      .leftJoin("coinTribes as ct", "c.id", "ct.coinId")
      .select([
        "c.id",
        "c.name",
        "c.symbol",
        "c.description",
        "c.logo",
        "c.address",
        "c.createdAt",
        "ct.tribe",
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
      proposals: 0,
    };

    if (coin.bondingCurveId) {
      const price = await getCurrentPrice(coin.bondingCurveId);
      marketData = await getMarketData(coin.id, coin.bondingCurveId, price);
    } else {
      // Even if there's no bonding curve, we still want to get the proposal count
      const proposals = await daoService.getProposalsByToken(coin.id);
      marketData.proposals = proposals.length;
    }

    // Return coin with market data and tribe information
    return res.status(200).json({
      ...enrichCoinWithTribe(coin),
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
 * Endpoint to get all coins without pagination, including tribe information
 * @route GET /allCoins
 * @returns {Object} Response containing all coins with tribe data
 */
router.get("/allCoins", async (req: any, res: any) => {
  try {
    // Get all coins with tribe information
    const coins = await db
      .selectFrom("coins as c")
      .leftJoin("coinTribes as ct", "c.id", "ct.coinId")
      .select([
        "c.id",
        "c.name",
        "c.symbol",
        "c.description",
        "c.logo",
        "c.address",
        "c.createdAt",
        "ct.tribe",
      ])
      .orderBy("c.createdAt", "desc")
      .execute();

    // Enrich each coin with default tribe if missing
    const enrichedCoins = coins.map(enrichCoinWithTribe);

    return res.status(200).json({
      data: enrichedCoins,
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
            .leftJoin("coinTribes as ct", "c.id", "ct.coinId")
            .select([
              "c.id",
              "c.name",
              "c.symbol",
              "c.description",
              "c.logo",
              "c.address",
              "c.createdAt",
              "ct.tribe",
              "b.id as bondingCurveId",
            ])
            .where("c.id", "=", coin.id as string)
            .executeTakeFirst();

          // If found in our database, enrich with market data
          if (dbCoin && dbCoin.bondingCurveId) {
            const price = await getCurrentPrice(dbCoin.bondingCurveId);
            const marketData = await getMarketData(
              dbCoin.id,
              dbCoin.bondingCurveId,
              price
            );

            const enrichedDbCoin = enrichCoinWithTribe(dbCoin);

            return {
              ...coin,
              name: enrichedDbCoin.name || coin.symbol,
              description:
                enrichedDbCoin.description || "No description available",
              logo: enrichedDbCoin.logo || "",
              tribe: enrichedDbCoin.tribe,
              suiPrice: marketData.suiPrice,
              price: marketData.price, // USD price
              change24h: marketData.change24h,
              volume24h: marketData.volume24h,
              marketCap: marketData.marketCap,
              holders: marketData.holders,
              holdings: coin.balance,
            };
          }

          // If not found, do not include in the list returned
          return null;
        } catch (error) {
          // In case of any error processing a coin, do not include in the list returned
          console.error(`Error enriching coin data for ${coin.symbol}:`, error);
          return null;
        }
      })
    );

    // Filter out null values (coins not found or with errors)
    const filteredCoins = enrichedCoins.filter((coin) => coin !== null);

    // Update pagination counts based on filtered results
    const filteredCount = filteredCoins.length;
    const filteredTotalPages = Math.ceil(filteredCount / limit);

    return res.status(200).json({
      data: filteredCoins.sort((a: any, b: any) => b.holdings - a.holdings),
      pagination: {
        total: filteredCount,
        page,
        limit,
        totalPages: filteredTotalPages,
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

/**
 * Endpoint to get a coin by name
 * @route GET /coin/name/:name
 */
router.get("/coin/name/:name", async (req: any, res: any) => {
  try {
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({ error: "Coin name is required" });
    }

    // Get the coin with bonding curve ID
    const coin = await db
      .selectFrom("coins as c")
      .leftJoin("bondingCurve as b", "c.id", "b.coinMetadata")
      .leftJoin("coinTribes as ct", "c.id", "ct.coinId")
      .select([
        "c.id",
        "c.name",
        "c.symbol",
        "c.description",
        "c.logo",
        "c.address",
        "c.createdAt",
        "ct.tribe",
        "b.id as bondingCurveId",
      ])
      .where("c.name", "=", name)
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
      proposals: 0,
    };

    if (coin.bondingCurveId) {
      const price = await getCurrentPrice(coin.bondingCurveId);
      marketData = await getMarketData(coin.id, coin.bondingCurveId, price);
    } else {
      // Even if there's no bonding curve, we still want to get the proposal count
      const proposals = await daoService.getProposalsByToken(coin.id);
      marketData.proposals = proposals.length;
    }

    // Return coin with market data
    return res.status(200).json({
      ...coin,
      ...marketData,
    });
  } catch (error) {
    console.error("Error fetching coin by name:", error);
    return res.status(500).json({
      error: "Failed to fetch coin by name",
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
        client as any,
        packageId
      );
      await bondingCurveSdk.migrateToFlowx(getActiveAddress());
      return res.status(200).json({
        message: "Migration successful",
      });
    } else {
      return res.status(200).json({
        message: "Target supply threshold not reached",
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
