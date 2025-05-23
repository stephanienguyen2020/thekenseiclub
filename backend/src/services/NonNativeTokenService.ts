import axios from "axios";
import { IOHLC, IToken, OHLC, Token } from "../models/NonNativeToken";

interface CoinGeckoToken {
  id: string;
  symbol: string;
  name: string;
  platforms: { [key: string]: string };
}

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";
const BATCH_SIZE = 4; // Number of pages before long delay
const LONG_DELAY = 2 * 60 * 1000; // 2 minutes in milliseconds
const PAGE_DELAY = 2000; // 2 seconds between pages

export class NonNativeTokenService {
  // Fetch and update token list using pagination
  async updateTokenList(): Promise<IToken[]> {
    try {
      // First get all token IDs and platforms
      console.log("Fetching token list...");
      const listResponse = await axios.get(
        `${COINGECKO_API_BASE}/coins/list?include_platform=true`
      );
      const tokens = listResponse.data as CoinGeckoToken[];
      console.log(`Found ${tokens.length} total tokens`);

      // Create a map of platform data
      const platformMap = new Map(
        tokens.map((token) => [token.id, token.platforms])
      );

      // Process tokens in pages of 250 (max allowed per page)
      const perPage = 250;
      const totalPages = Math.ceil(tokens.length / perPage);
      console.log(
        `Will process ${totalPages} pages in batches of ${BATCH_SIZE}`
      );

      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      for (let page = 1; page <= totalPages; page++) {
        try {
          console.log(`Fetching page ${page} of ${totalPages}`);

          // Get market data for the current page
          const marketResponse = await axios.get(
            `${COINGECKO_API_BASE}/coins/markets`,
            {
              params: {
                vs_currency: "usd",
                order: "market_cap_desc",
                per_page: perPage,
                page: page,
                sparkline: false,
              },
            }
          );

          const pageTokens = marketResponse.data;
          console.log(
            `Processing ${pageTokens.length} tokens from page ${page}`
          );

          const operations = pageTokens.map((token: any) => ({
            updateOne: {
              filter: { coingeckoId: token.id },
              update: {
                $set: {
                  coingeckoId: token.id,
                  symbol: token.symbol,
                  name: token.name,
                  image: token.image,
                  platforms: platformMap.get(token.id) || {},
                  current_price_usd: token.current_price || 0,
                  market_cap_usd: token.market_cap || 0,
                  market_cap_change_percentage_24h_usd:
                    token.market_cap_change_percentage_24h || 0,
                  updatedAt: new Date(),
                },
              },
              upsert: true,
            },
          }));

          if (operations.length > 0) {
            await Token.bulkWrite(operations);
            console.log(
              `Updated ${operations.length} tokens from page ${page}`
            );
          }

          // Add appropriate delay based on batch position
          if (page < totalPages) {
            if (page % BATCH_SIZE === 0) {
              // Long delay after every BATCH_SIZE pages
              const minutes = LONG_DELAY / (60 * 1000);
              console.log(
                `Completed batch of ${BATCH_SIZE} pages. Waiting ${minutes} minutes before next batch...`
              );
              await delay(LONG_DELAY);
            } else {
              // Short delay between pages within a batch
              console.log(
                `Waiting ${PAGE_DELAY / 1000} seconds before next page...`
              );
              await delay(PAGE_DELAY);
            }
          }
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 429) {
            console.log("Rate limit hit, waiting 5 minutes before retrying...");
            await delay(LONG_DELAY);
            page--; // Retry the same page
            continue;
          }
          console.error(`Error processing page ${page}:`, error);
          // Continue with next page for other types of errors
          continue;
        }
      }

      return await Token.find().sort({ market_cap_usd: -1 });
    } catch (error) {
      console.error("Error updating token list:", error);
      throw error;
    }
  }

  // Get token list from database with pagination and filtering
  async getTokenList(
    page: number = 1,
    limit: number = 10,
    platform?: string
  ): Promise<{
    tokens: IToken[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const query = platform
        ? { [`platforms.${platform}`]: { $exists: true } }
        : {};
      const skip = (page - 1) * limit;

      const [tokens, total] = await Promise.all([
        Token.find(query).skip(skip).limit(limit).sort({ market_cap_usd: -1 }),
        Token.countDocuments(query),
      ]);

      return {
        tokens,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Error fetching token list:", error);
      throw error;
    }
  }

  // Get token by ID
  async getTokenById(coingeckoId: string): Promise<IToken | null> {
    try {
      const token = await Token.findOne({ coingeckoId });
      if (!token) {
        return null;
      }
      return token;
    } catch (error) {
      console.error("Error fetching token by ID:", error);
      throw error;
    }
  }

  // Get OHLC data from database
  async getOHLCData(
    coinId: string,
    vsCurrency: string = "usd"
  ): Promise<IOHLC[]> {
    return await OHLC.find({
      coingeckoId: coinId,
      vs_currency: vsCurrency,
    }).sort({ timestamp: 1 });
  }

  // Fetch and update OHLC data for all tokens
  async updateAllOHLCData(
    vsCurrency: string = "usd",
    days: number = 365
  ): Promise<{
    success: number;
    failed: number;
    errors: { id: string; error: string }[];
  }> {
    try {
      const listResponse = await axios.get(`${COINGECKO_API_BASE}/coins/list`);
      const tokens = listResponse.data;
      console.log(`Found ${tokens.length} total tokens`);

      const batchSize = 4; // Process 4 tokens at a time
      const longDelay = 1 * 60 * 1000; // 1 minutes in milliseconds
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      let success = 0;
      let failed = 0;
      const errors: { id: string; error: string }[] = [];

      // Process tokens in batches
      for (let i = 0; i < tokens.length; i += batchSize) {
        console.log(`Processing batch starting at index ${i}`);
        const batch = tokens.slice(i, i + batchSize);

        for (const token of batch) {
          try {
            console.log(`Fetching OHLC data for token: ${token.id}`);
            const response = await axios.get(
              `${COINGECKO_API_BASE}/coins/${token.id}/ohlc?vs_currency=${vsCurrency}&days=${days}`
            );
            const ohlcData = response.data;

            let timeframe = "4d"; // default for 31+ days
            if (days <= 2) timeframe = "30m";
            else if (days <= 30) timeframe = "4h";

            const operations = ohlcData.map((data: number[]) => ({
              updateOne: {
                filter: {
                  coingeckoId: token.id,
                  timestamp: new Date(data[0]),
                  vs_currency: vsCurrency,
                },
                update: {
                  $set: {
                    coingeckoId: token.id,
                    timestamp: new Date(data[0]),
                    open: data[1],
                    high: data[2],
                    low: data[3],
                    close: data[4],
                    vs_currency: vsCurrency,
                    timeframe: timeframe,
                  },
                },
                upsert: true,
              },
            }));

            if (operations.length > 0) {
              await OHLC.bulkWrite(operations);
              console.log(`Updated OHLC data for token: ${token.id}`);
            }
            success++;
          } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 429) {
              console.log(
                "Rate limit hit, waiting 2 minutes before retrying..."
              );
              await delay(longDelay);
              i--; // Retry the same batch
              failed = Math.max(0, failed - 1); // Adjust failed count since we're retrying
              break; // Exit the inner loop to retry the batch
            }
            failed++;
            errors.push({
              id: token.id,
              error: error instanceof Error ? error.message : "Unknown error",
            });
            console.error(`Error processing token ${token.id}:`, error);
          }
        }

        // Add delay after each batch
        if (i + batchSize < tokens.length) {
          console.log(
            `Completed batch. Waiting 2 minutes before next batch...`
          );
          await delay(longDelay);
        }
      }

      return { success, failed, errors };
    } catch (error) {
      console.error("Error updating OHLC data for all tokens:", error);
      throw error;
    }
  }
}
