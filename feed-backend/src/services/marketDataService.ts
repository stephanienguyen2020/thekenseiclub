import { db } from "../db/database";
import { sql } from "kysely";
import { ACTIVE_NETWORK, getClient } from "../utils";

export interface MarketData {
  change24h: number;
  volume24h: string;
  marketCap: string;
  holders: number;
  price: number;
}

export interface PriceHistoryPoint {
  timestamp: Date;
  price: string;
  direction: string;
}

export async function getMarketData(
  coinId: string,
  bondingCurveId: string,
  price: number
): Promise<MarketData> {
  try {
    // Calculate 24h price change
    const change24h = await calculate24hChange(bondingCurveId, price);

    // Calculate 24h volume
    const volume24h = await calculate24hVolume(bondingCurveId);

    // Get estimated market cap (current price * supply estimate)
    const marketCap = await estimateMarketCap(bondingCurveId, price);

    // Get holders count (this would ideally come from blockchain data)
    const holders = await estimateHolders(bondingCurveId);

    return {
      change24h,
      volume24h,
      marketCap,
      holders,
      price,
    };
  } catch (error) {
    console.error("Error calculating market data:", error);
    return {
      change24h: 0,
      volume24h: "0",
      marketCap: "0",
      holders: 0,
      price: 0,
    };
  }
}

async function calculate24hChange(
  bondingCurveId: string,
  currentPrice: number
): Promise<number> {
  try {
    // Get price 24 hours ago
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const price24hAgo = await db
      .selectFrom("rawPrices")
      .select("price")
      .where("bondingCurveId", "=", bondingCurveId)
      .where("timestamp", "<", oneDayAgo)
      .orderBy("timestamp", "desc")
      .limit(1)
      .executeTakeFirst();

    if (currentPrice && price24hAgo) {
      // Current price is already adjusted by getCurrentPrice
      const current = currentPrice;

      // Parse and adjust past price for 9 decimal places
      const rawPastPrice = price24hAgo.price;
      const past = rawPastPrice;

      if (past > 0) {
        return ((current - past) / past) * 100;
      }
    }

    if (currentPrice) {
      return 100;
    }

    return 0;
  } catch (error) {
    console.error("Error calculating 24h change:", error);
    return 0;
  }
}

async function calculate24hVolume(bondingCurveId: string): Promise<string> {
  try {
    // Sum all trade amounts in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const resultBuy = await db
      .selectFrom("rawPrices")
      .select(sql`sum(amount_in)`.as("volume"))
      .where("bondingCurveId", "=", bondingCurveId)
      .where("direction", "=", "BUY")
      .where("timestamp", ">", oneDayAgo)
      .executeTakeFirst();

    const resultSell = await db
      .selectFrom("rawPrices")
      .select(sql`sum(amount_out)`.as("volume"))
      .where("bondingCurveId", "=", bondingCurveId)
      .where("direction", "=", "SELL")
      .where("timestamp", ">", oneDayAgo)
      .executeTakeFirst();

    const buyVolume = resultBuy?.volume
      ? parseFloat(resultBuy.volume.toString())
      : 0;
    const sellVolume = resultSell?.volume
      ? parseFloat(resultSell.volume.toString())
      : 0;
    const totalVolume = (buyVolume + sellVolume) / Math.pow(10, 9);

    return totalVolume.toString();
  } catch (error) {
    console.error("Error calculating 24h volume:", error);
    return "0";
  }
}

async function estimateMarketCap(
  bondingCurveId: string,
  currentPrice: number
): Promise<string> {
  try {
    if (currentPrice) {
      const rawSupply = await getCirculatingSupply(bondingCurveId);
      console.log("currentPrice", currentPrice);

      // Calculate market cap using the adjusted price and supply
      const marketCap = (rawSupply * currentPrice) / Math.pow(10, 9);

      return marketCap.toString();
    }

    return "0";
  } catch (error) {
    console.error("Error estimating market cap:", error);
    return "0";
  }
}

async function estimateHolders(bondingCurveId: string): Promise<number> {
  try {
    // In a real application, you would query the blockchain for holder count
    // For this example, we'll use a random number between 1-500 with a bias toward smaller numbers

    // Check if the coin has been around for a while based on post count
    const holderCount = await db
      .selectFrom("rawPrices")
      .select(db.fn.count("rawPrices.sender").as("count"))
      .where("bondingCurveId", "=", bondingCurveId)
      .groupBy("rawPrices.bondingCurveId")
      .groupBy("rawPrices.sender")
      .executeTakeFirst();

    const count = parseInt(holderCount?.count as string) || 0;

    return count;
  } catch (error) {
    console.error("Error estimating holders:", error);
    return 0;
  }
}

export const getCurrentPrice = async (bondingCurveId: string) => {
  try {
    const client = getClient(ACTIVE_NETWORK);

    const bondingCurveObject = await client.getObject({
      id: bondingCurveId,
      options: {
        showType: true,
        showContent: true,
      },
    });

    //@ts-ignore
    const bondingCurveField = bondingCurveObject.data?.content?.fields;

    if (!bondingCurveField) {
      console.error("Failed to retrieve bonding curve data");
      return 0;
    }

    // Calculate raw price
    const rawPrice =
      (parseFloat(bondingCurveField.virtual_sui_amt) +
        parseFloat(bondingCurveField.sui_balance)) /
      parseFloat(bondingCurveField.token_balance);
    // Round to a reasonable number of decimal places (e.g., 6)
    return rawPrice;
  } catch (error) {
    console.error("Error getting current price:", error);
    return 0;
  }
};

export const getCirculatingSupply = async (bondingCurveId: string) => {
  try {
    const client = getClient(ACTIVE_NETWORK);

    const bondingCurveObject = await client.getObject({
      id: bondingCurveId,
      options: {
        showType: true,
        showContent: true,
      },
    });

    //@ts-ignore
    const bondingCurveField = bondingCurveObject.data?.content?.fields;

    if (!bondingCurveField) {
      console.error("Failed to retrieve bonding curve data");
      return 0;
    }
    return parseFloat(bondingCurveField.token_balance);
  } catch (error) {
    console.error("Error getting circulating supply:", error);
    return 0;
  }
};
