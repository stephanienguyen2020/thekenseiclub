export interface TokenHolder {
  holder_address: string;
  percentage: number;
  token_name: string;
  symbol: string;
}

export interface TopTokenHolders {
  data: TokenHolder[];
}

export interface TrendingCoin {
  name: string;
  symbol: string;
  change: string;
  marketCap: string;
  volume: string;
  listed?: string;
  sparklineData: number[];
  image?: string;
  holders?: string;
  transactions?: string;
  address: string;
  price: number;
  volume_24h: number;
}

export interface TokenAttributes {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  image_url: string;
  coingecko_coin_id: string;
  total_supply: string;
  price_usd: string;
  fdv_usd: string;
  total_reserve_in_usd: string;
  volume_usd: {
    h24: string;
    [key: string]: string;
  };
  market_cap_usd: string;
}

export interface TopPoolRef {
  id: string;
  type: string;
}

export interface TokenRelationships {
  top_pools: {
    data: TopPoolRef[];
  };
}

export interface TokenData {
  id: string;
  type: string;
  attributes: TokenAttributes;
  relationships: TokenRelationships;
}

export interface PriceChangePercentage {
  m5: string;
  h1: string;
  h6: string;
  h24: string;
}

export interface TransactionStats {
  buys: number;
  sells: number;
  buyers: number;
  sellers: number;
}

export interface PoolTransactions {
  m5: TransactionStats;
  m15: TransactionStats;
  m30: TransactionStats;
  h1: TransactionStats;
  h24: TransactionStats;
}

export interface PoolVolumeUSD {
  m5: string;
  h1: string;
  h6: string;
  h24: string;
}

export interface PoolAttributes {
  base_token_price_usd: string;
  base_token_price_native_currency: string;
  quote_token_price_usd: string;
  quote_token_price_native_currency: string;
  base_token_price_quote_token: string;
  quote_token_price_base_token: string;
  address: string;
  name: string;
  pool_created_at: string;
  token_price_usd: string;
  fdv_usd: string;
  market_cap_usd: string;
  price_change_percentage: PriceChangePercentage;
  transactions: PoolTransactions;
  volume_usd: PoolVolumeUSD;
  reserve_in_usd: string;
}

export interface PoolRelationships {
  base_token: { data: { id: string; type: string } };
  quote_token: { data: { id: string; type: string } };
  dex: { data: { id: string; type: string } };
}

export interface PoolData {
  id: string;
  type: string;
  attributes: PoolAttributes;
  relationships: PoolRelationships;
}
