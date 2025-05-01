export interface Coin {
  id: string;
  name: string;
  symbol: string;
  price: number;
  description: string;
  logo: string;
  change24h: number;
  marketCap: number;
  holders: number;
  website: string;
  twitter: string;
  telegram: string;
  proposals: number;
  bondingCurveId: string;
  holdings?: number;
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
