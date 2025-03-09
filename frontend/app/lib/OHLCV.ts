import { fetchPoolInfo } from "./pool";

// Define the interface for a single OHLCV entry.
export interface OHLCVEntry {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }
  
  // Define the raw API response interface where `data` is an array of number arrays.
  interface RawOHLCVResponse {
    data: number[][];
  }
  
  /**
   * Fetch OHLCV data from the API and convert each data point into a structured object.
   *
   * @param poolAddress - The pool address to query.
   * @param limit - The number of data points to return.
   * @param timeframe - The timeframe for each data point (e.g., 'hour').
   * @returns A promise that resolves to an array of OHLCVEntry objects.
   */
  export async function fetchOHLCV(
    poolAddress: string,
    limit: number,
    timeframe: string
  ): Promise<OHLCVEntry[]> {
    const network = 'aurora'; // Fixed parameter
    const baseUrl = '/api/coingecko/ohlcv';
  
    // Build the URL with query parameters
    const url = new URL(baseUrl, window.location.origin);
    url.searchParams.append('network', network);
    url.searchParams.append('pool_address', poolAddress);
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('timeframe', timeframe);
  
    // Call the API using fetch
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch OHLCV data: ${response.status} ${response.statusText}`);
    }
  
    // Parse the raw JSON response
    const rawResult: RawOHLCVResponse = await response.json();
  
    // Map each inner array to an OHLCVEntry object
    const entries: OHLCVEntry[] = rawResult.data.map((entry) => {
      // Destructure the array assuming the order: [timestamp, open, high, low, close, volume]
      const [timestamp, open, high, low, close, volume] = entry;
      return { timestamp, open, high, low, close, volume };
    });
  
    return entries;
}
  
  // =======================================================
  // Secondary function: fetchOHLCVForToken
  // =======================================================
  
  /**
   * Fetches OHLCV data for a given token address.
   *
   * This function performs the following steps:
   * 1. Uses the token address to fetch pool information.
   * 2. Retrieves the first entry from the poolInfos array.
   * 3. Extracts the pool_id from that entry.
   * 4. Invokes the fetchOHLCV function with the pool_id.
   *
   * @param tokenAddress - The token address to look up pool info for.
   * @param limit - The number of OHLCV data points to fetch.
   * @param timeframe - The timeframe for each OHLCV data point (e.g., 'hour').
   * @returns A promise that resolves to an array of OHLCVEntry objects.
   */
  export async function fetchOHLCVForToken(
    tokenAddress: string,
    limit: number,
    timeframe: string
  ): Promise<OHLCVEntry[]> {
    // Retrieve pool info for the given token address.
    const poolInfoResponse = await fetchPoolInfo(tokenAddress);
  
    if (!poolInfoResponse.poolInfos || poolInfoResponse.poolInfos.length === 0) {
      throw new Error(`No pool info found for token address: ${tokenAddress}`);
    }
  
    // Retrieve the first pool's info and extract its pool_id.
    const firstPool = poolInfoResponse.poolInfos[0];
    const poolId = firstPool.pool_id.split('_')[1] ?? firstPool.pool_id;
  
    // Use the poolId as the pool address in the OHLCV call.
    const ohlcvData = await fetchOHLCV(poolId, limit, timeframe);
  
    return ohlcvData;
  }
  