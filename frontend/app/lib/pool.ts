import { Pool, PoolInfo, PoolInfoResponse } from "@/app/types/pool";

interface IncludedItem {
  id: string;
  type: string;
  attributes: {
    name: string;
    address?: string;
    symbol?: string;
    image_url?: string;
    // other properties if needed
  };
}

interface ApiResponse {
  data: Pool[];
  included: IncludedItem[];
}

export async function fetchPoolInfo(
  token_address: string
): Promise<PoolInfoResponse> {
  const url =
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/coins/find_pool?network=sonic&token_address=` +
    token_address;

  // Fetch the API data
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const json: ApiResponse = await response.json();

  // Build a lookup map for the "included" array.
  // This map allows us to quickly find a token or dex by its id.
  const includedMap: { [id: string]: IncludedItem } = {};
  json.included.forEach((item) => {
    includedMap[item.id] = item;
  });

  // Now, process each pool in the "data" array
  const poolInfos: PoolInfo[] = json.data.map((pool) => {
    // Get the related IDs from the pool relationships
    const dexId = pool.relationships.dex.data.id;
    const baseTokenId = pool.relationships.base_token.data.id;
    const quoteTokenId = pool.relationships.quote_token.data.id;

    // Look up the related dex and tokens from our map
    const dex = includedMap[dexId];
    const baseToken = includedMap[baseTokenId];
    const quoteToken = includedMap[quoteTokenId];

    return {
      pool_id: pool.id.split("_")[1] || pool.id,
      dex_name: dex ? dex.attributes.name : "N/A",
      base_token_address: baseToken?.attributes.address || "",
      base_token_name: baseToken?.attributes.name || "",
      base_token_symbol: baseToken?.attributes.symbol || "",
      base_token_image_url: baseToken?.attributes.image_url || "",
      quote_token_address: quoteToken?.attributes.address || "",
      quote_token_name: quoteToken?.attributes.name || "",
      quote_token_symbol: quoteToken?.attributes.symbol || "",
      quote_token_image_url: quoteToken?.attributes.image_url || "",
    };
  });

  const poolInfoCetus = poolInfos.filter((pool) => pool.dex_name === "cetus");
  const poolInfoBluefin = poolInfos.filter(
    (pool) => pool.dex_name === "bluefin"
  );

  return {
    poolInfos,
    poolInfoCetus,
    poolInfoBluefin,
  };
}
