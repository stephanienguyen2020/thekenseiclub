import { TokenData, PoolData, TokenAttributes } from "@/app/types/coins";
import { Pool } from "@/app/types/pool";

export interface ApiResponse {
  data: TokenData;
  included: PoolData[];
}

// Represents a token item (included in the response).
interface Token {
  id: string;
  type: "token";
  attributes: TokenAttributes;
}

// The complete response from the trending pools endpoint.
interface TrendingPoolsResponse {
  data: Pool[];
  included: Token[];
}

// --- Interface for our desired output ---

interface BaseTokenInfo {
  address: string;
  name: string;
  symbol: string;
  image_url: string;
  price: number; // base token price in USDcoin
  price_change_24h: number; // 24h price change percentage
  marketcap: number | null; // market capitalization (may be null)
  volume_24h: number; // 24h trading volume (in USD)
  liquidity: number; // liquidity in USD (reserve_in_usd)
  transactions_24h: number; // total number of transactions in 24h
  active_users_24h: number; // unique users (buyers + sellers) in 24h
}

export async function fetchTokenInfo(token_address: string) {
  const url = `/api/coingecko/token?network=sonic&token_address=${token_address}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const json: ApiResponse = await response.json();

    // Extract base token details from the main data attributes
    const tokenAttrs = json.data.attributes;
    const baseTokenAddress = tokenAttrs.address;
    const baseTokenName = tokenAttrs.name;
    const baseTokenSymbol = tokenAttrs.symbol;
    const baseTokenImageUrl = tokenAttrs.image_url;
    const currentPrice = parseFloat(tokenAttrs.price_usd);
    const volume24hr = parseFloat(tokenAttrs.volume_usd.h24);
    const marketCap = parseFloat(tokenAttrs.market_cap_usd);
    // You might choose liquidity from the token attributes...
    const liquidity = parseFloat(tokenAttrs.total_reserve_in_usd);

    // 3. Extract pool data – here we use the first top pool
    const topPoolRefs = json.data.relationships.top_pools.data;
    if (topPoolRefs.length === 0) {
      throw new Error("No top pool data found");
    }
    const topPoolId = topPoolRefs[0].id;

    // Find the matching pool in the "included" array
    const pool = json.included.find((p) => p.id === topPoolId);
    if (!pool) {
      throw new Error("Top pool details not found in included data");
    }

    // Extract 24hr price change and transaction stats from the pool attributes
    const priceChange24hr = parseFloat(
      pool.attributes.price_change_percentage.h24
    );
    const txStats24hr = pool.attributes.transactions.h24; // contains buys, sells, buyers, sellers

    // If needed, you can also get the pool's 24hr volume:
    // const poolVolume24hr = parseFloat(pool.attributes.volume_usd.h24);

    // Combine the desired details into an object
    const tokenInfo = {
      baseTokenAddress,
      baseTokenName,
      baseTokenSymbol,
      baseTokenImageUrl,
      currentPrice,
      volume24hr,
      priceChange24hr,
      txStats24hr,
      marketCap,
      liquidity,
    };

    console.log("Fetched Token Data:", tokenInfo);
    return tokenInfo;
  } catch (error) {
    console.error("Error fetching token data:", error);
    throw error;
  }
}

export async function fetchTrendingTokens(): Promise<BaseTokenInfo[]> {
  const endpoint = "/api/coingecko/trending-pools";

  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const json: TrendingPoolsResponse = await response.json();
    const { data: pools, included: tokens } = json;

    // Use a Map to collect unique base tokens (by token id).
    const baseTokenMap = new Map<string, BaseTokenInfo>();
    // Exclude these token symbols.
    const excludedSymbols = new Set(["USDC", "SUI", "stSUI"]);

    for (const pool of pools) {
      // Get the base token reference from the pool.
      const baseTokenRef = pool.relationships.base_token.data;
      const tokenId = baseTokenRef.id;
      // Find the token metadata in the "included" array.
      const tokenData = tokens.find((token) => token.id === tokenId);
      if (!tokenData) continue; // Skip if no matching token is found.

      // Skip if the token symbol is in the excluded list.
      if (excludedSymbols.has(tokenData.attributes.symbol)) {
        continue;
      }

      // Extract and convert pool pricing/liquidity data.
      const {
        base_token_price_usd,
        market_cap_usd,
        price_change_percentage,
        volume_usd,
        reserve_in_usd,
        transactions,
      } = pool.attributes;

      const price = parseFloat(base_token_price_usd);
      const priceChange24h = parseFloat(price_change_percentage.h24);
      const marketcap = market_cap_usd ? parseFloat(market_cap_usd) : null;
      const volume24h = parseFloat(volume_usd.h24);
      const liquidity = parseFloat(reserve_in_usd);
      const transactions24h = transactions.h24.buys + transactions.h24.sells;
      const activeUsers24h = transactions.h24.buyers + transactions.h24.sellers;

      // Build the base token info.
      const baseToken: BaseTokenInfo = {
        address: tokenData.attributes.address,
        name: tokenData.attributes.name,
        symbol: tokenData.attributes.symbol,
        image_url: tokenData.attributes.image_url,
        price,
        price_change_24h: priceChange24h,
        marketcap,
        volume_24h: volume24h,
        liquidity,
        transactions_24h: transactions24h,
        active_users_24h: activeUsers24h,
      };

      // If the same token appears in multiple pools, choose the one with higher liquidity.
      if (baseTokenMap.has(tokenId)) {
        const existing = baseTokenMap.get(tokenId)!;
        if (liquidity > existing.liquidity) {
          baseTokenMap.set(tokenId, baseToken);
        }
      } else {
        baseTokenMap.set(tokenId, baseToken);
      }
    }

    return Array.from(baseTokenMap.values());
  } catch (error) {
    console.error(
      "Error fetching from backend, falling back to mock data:",
      error
    );

    // Import mock data
    const { trendingCoins } = await import("@/app/data/mockCoins");

    // Convert mock data to BaseTokenInfo format
    return trendingCoins.map((coin) => ({
      address: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      image_url: coin.logo,
      price: coin.price,
      price_change_24h: coin.change24h,
      marketcap: coin.marketCap,
      volume_24h: coin.volume24h,
      liquidity: coin.marketCap * 0.1, // Estimate liquidity as 10% of market cap
      transactions_24h: Math.floor(Math.random() * 1000) + 500, // Random number of transactions
      active_users_24h: Math.floor(Math.random() * 500) + 100, // Random number of active users
    }));
  }
}
