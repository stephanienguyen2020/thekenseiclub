import { TokenData, PoolData } from "@/app/types/coins";

const BASE_URL = "https://api.geckoterminal.com/api/v2";

export interface ApiResponse {
  data: TokenData;
  included: PoolData[];
}

export interface OHLCVResponse {
  data: number[][];
}

export interface TrendingPoolsParams {
  network?: string;
  include?: string;
  page?: number;
  duration?: string;
}

export const CoingeckoService = {
  async getToken(tokenAddress: string, network: string = "sonic") {
    const url = `${BASE_URL}/networks/${network}/tokens/${tokenAddress}`;
    const params = new URLSearchParams({
      include: "top_pools"
    });

    const response = await fetch(url + "?" + params.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  },

  async getTrendingPools({
    network = "sonic",
    include = "base_token,quote_token",
    page = 1,
    duration = "1h"
  }: TrendingPoolsParams = {}) {
    const url = new URL(`${BASE_URL}/networks/${network}/trending_pools`);
    
    // Add query parameters
    const params = new URLSearchParams({
      include,
      page: page.toString(),
      duration
    });

    console.log('Requesting URL:', `${url.toString()}?${params.toString()}`);

    const response = await fetch(`${url.toString()}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    
    // Sort the data field based on pool_created_at in descending order
    const sortedData = {
      data: data.data.sort((a: any, b: any) => 
        new Date(b.attributes.pool_created_at).getTime() - 
        new Date(a.attributes.pool_created_at).getTime()
      ),
      included: data.included
    };

    return sortedData;
  },

  async getOHLCV(
    network: string,
    poolAddress: string,
    timeframe: string = "hour",
    aggregate: number = 1,
    limit: number = 100,
    currency: string = "usd",
    token: string = "base"
  ) {
    const url = new URL(`${BASE_URL}/networks/${network}/pools/${poolAddress}/ohlcv/${timeframe}`);
    
    // Add query parameters
    const params = new URLSearchParams({
      aggregate: aggregate.toString(),
      before_timestamp: Math.floor(Date.now() / 1000).toString(),
      limit: limit.toString(),
      currency,
      token
    });

    const response = await fetch(`${url.toString()}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const responseData = await response.json();
    return { data: responseData.data.attributes.ohlcv_list };
  }
};
