// Define interfaces for the response (you can expand these as needed)
export interface Pool {
  id: string;
  type: string;
  attributes: Record<string, any>;
  relationships: {
    base_token: { data: { id: string; type: string } };
    quote_token: { data: { id: string; type: string } };
    dex: { data: { id: string; type: string } };
  };
}

// Define the interface for our parsed pool info
export interface PoolInfo {
  pool_id: string;
  dex_name: string;
  base_token_address: string;
  base_token_name: string;
  base_token_symbol: string;
  base_token_image_url: string;
  quote_token_address: string;
  quote_token_name: string;
  quote_token_symbol: string;
  quote_token_image_url: string;
}

export interface PoolInfoResponse {
  poolInfos: PoolInfo[];
  poolInfoCetus?: PoolInfo[];
  poolInfoBluefin?: PoolInfo[];
}
