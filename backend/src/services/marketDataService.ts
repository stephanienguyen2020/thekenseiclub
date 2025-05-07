import { db } from "../db/database";
import { sql } from "kysely";
import { ACTIVE_NETWORK, getClient } from "../utils";
import BigNumber from 'bignumber.js';

// Configure BigNumber
const DECIMALS = 9;
BigNumber.config({
  DECIMAL_PLACES: DECIMALS,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  EXPONENTIAL_AT: [-DECIMALS, DECIMALS]
});

// Cache for SUI to USD rate to avoid frequent API calls
interface RateCache {
  rate: number;
  timestamp: number;
  expiresIn: number; // milliseconds
}

// Cache variable for SUI to USD rate
let rateCache: RateCache | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Function to get SUI to USD conversion rate from CoinGecko API
export async function getSuiToUsdRate(): Promise<number> {
  try {
    // Check if we have a valid cached rate
    const now = Date.now();
    if (rateCache && (now - rateCache.timestamp) < rateCache.expiresIn) {
      console.log(`Using cached SUI to USD rate: ${rateCache.rate} (expires in ${Math.round((rateCache.timestamp + rateCache.expiresIn - now) / 1000)}s)`);
      return rateCache.rate;
    }

    // If no valid cache, fetch from CoinGecko API
    console.log('Fetching fresh SUI to USD rate from CoinGecko API...');
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=usd');

    if (!response.ok) {
      throw new Error(`CoinGecko API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Check if the response contains the expected data
    if (data && data.sui && data.sui.usd) {
      const rate = data.sui.usd;
      console.log(`Received SUI to USD rate: ${rate}`);

      // Update the cache
      rateCache = {
        rate,
        timestamp: now,
        expiresIn: CACHE_DURATION
      };

      return rate;
    } else {
      throw new Error('Invalid response format from CoinGecko API');
    }
  } catch (error) {
    // Log the error and fallback to a default value or cached value if available
    console.error('Error fetching SUI to USD rate:', error);

    if (rateCache) {
      console.warn(`Using expired cached rate: ${rateCache.rate} (expired ${Math.round((Date.now() - rateCache.timestamp - rateCache.expiresIn) / 1000)}s ago)`);
      return rateCache.rate;
    }

    console.warn('Using fallback SUI to USD rate: 0.85');
    return 0.85; // Fallback rate: 1 SUI = 0.85 USD
  }
}

export interface MarketData {
  change24h: number;
  volume24h: string;
  marketCap: string;
  holders: number;
  suiPrice: number;
  price: number; // USD price
}

export interface PriceHistoryPoint {
  timestamp: Date;
  price: string;
  direction: string;
}

export async function getMarketData(
  coinId: string,
  bondingCurveId: string,
  suiPrice: number
): Promise<MarketData> {
  try {
    // Get SUI to USD conversion rate
    const suiToUsdRate = await getSuiToUsdRate();

    // Calculate USD price using BigNumber
    const bnSuiPrice = new BigNumber(suiPrice);
    const bnSuiToUsdRate = new BigNumber(suiToUsdRate);
    const usdPrice = bnSuiPrice.times(bnSuiToUsdRate).toNumber();

    // Calculate 24h price change based on USD price
    const change24h = await calculate24hChange(bondingCurveId, suiPrice, suiToUsdRate);

    // Calculate 24h volume (already in USD)
    const volume24h = await calculate24hVolume(bondingCurveId);

    // Get estimated market cap using USD price
    const marketCap = await estimateMarketCap(bondingCurveId, usdPrice);

    // Get holders count (this would ideally come from blockchain data)
    const holders = await estimateHolders(bondingCurveId);

    return {
      change24h,
      volume24h,
      marketCap,
      holders,
      suiPrice,
      price: usdPrice,
    };
  } catch (error) {
    console.error("Error calculating market data:", error);
    return {
      change24h: 0,
      volume24h: "0",
      marketCap: "0",
      holders: 0,
      suiPrice: 0,
      price: 0,
    };
  }
}

async function calculate24hChange(
  bondingCurveId: string,
  currentSuiPrice: number,
  suiToUsdRate: number
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

    if (currentSuiPrice && price24hAgo) {
      // Convert prices to BigNumber for precise calculations
      const bnCurrentSuiPrice = new BigNumber(currentSuiPrice);
      const bnSuiToUsdRate = new BigNumber(suiToUsdRate);
      const bnPastSuiPrice = new BigNumber(price24hAgo.price);

      // Calculate USD prices
      const currentUsdPrice = bnCurrentSuiPrice.times(bnSuiToUsdRate);
      const pastUsdPrice = bnPastSuiPrice.times(bnSuiToUsdRate);

      if (pastUsdPrice.gt(0)) {
        return currentUsdPrice.minus(pastUsdPrice)
          .dividedBy(pastUsdPrice)
          .times(100)
          .toNumber();
      }
    }

    if (currentSuiPrice) {
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

    const bnBuyVolume = new BigNumber(resultBuy?.volume?.toString() || '0');
    const bnSellVolume = new BigNumber(resultSell?.volume?.toString() || '0');
    const totalVolume = bnBuyVolume.plus(bnSellVolume)
      .dividedBy(new BigNumber(10).pow(9))
      .toString();

    return totalVolume;
  } catch (error) {
    console.error("Error calculating 24h volume:", error);
    return "0";
  }
}

async function estimateMarketCap(
  bondingCurveId: string,
  currentUsdPrice: number
): Promise<string> {
  try {
    if (currentUsdPrice) {
      const rawSupply = await getCirculatingSupply(bondingCurveId);
      const bnSupply = new BigNumber(rawSupply);
      const bnPrice = new BigNumber(currentUsdPrice);

      // Calculate market cap using BigNumber
      const marketCap = bnSupply.times(bnPrice)
        .dividedBy(new BigNumber(10).pow(9))
        .toString();

      return marketCap;
    }

    return "0";
  } catch (error) {
    console.error("Error estimating market cap:", error);
    return "0";
  }
}

async function estimateHolders(bondingCurveId: string): Promise<number> {
  try {
    const holderCount = await db
      .selectFrom("rawPrices")
      .select(db.fn.count("rawPrices.sender").distinct().as("count"))
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
