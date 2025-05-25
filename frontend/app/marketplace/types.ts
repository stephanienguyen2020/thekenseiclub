export interface Coin {
  id: string;
  name: string;
  symbol: string;
  price: number;
  value?: number;
  description: string;
  logo: string;
  change24h: number;
  marketCap: number;
  volume24h: number;
  image?: string;
  holders: number;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  github?: string;
  createdAt: string;
  updatedAt: string;
  proposals: number;
  bondingCurveId: string;
  holdings?: number;
  suiPrice: number;
  balance: string;
  tribe?: string;
}

export interface CoinList {
  data: Coin[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
