// Define the Coin type
export type Coin = {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  sparkline: number[];
  liquidity: number;
  logo: string;
};

// Export the trending coins data
export const trendingCoins: Coin[] = [
  {
    id: "dogecoin",
    name: "Dogecoin",
    symbol: "DOGE",
    price: 0.2455,
    liquidity: 1000000,
    change1h: -0.14,
    change24h: 1.58,
    change7d: -9.93,
    marketCap: 36379981120,
    volume24h: 885839156,
    circulatingSupply: 148.15e9,
    sparkline: [
      0.26, 0.25, 0.24, 0.25, 0.26, 0.25, 0.24, 0.23, 0.24, 0.25, 0.24, 0.245,
    ],
    logo: "https://cryptologos.cc/logos/dogecoin-doge-logo.png",
  },
  {
    id: "shiba-inu",
    name: "Shiba Inu",
    symbol: "SHIB",
    price: 0.00001558,
    change1h: -0.15,
    change24h: 2.68,
    change7d: -4.18,
    marketCap: 9183229003,
    volume24h: 146263727,
    circulatingSupply: 589.25e12,
    sparkline: [
      0.000016, 0.0000155, 0.0000158, 0.0000157, 0.0000156, 0.0000155,
      0.0000157, 0.0000156, 0.0000155, 0.0000158, 0.0000156, 0.00001558,
    ],
    liquidity: 1000000,
    logo: "https://cryptologos.cc/logos/shiba-inu-shib-logo.png",
  },
  {
    id: "pepe",
    name: "PEPE",
    symbol: "PEPE",
    price: 0.00009562,
    change1h: -0.44,
    change24h: 4.01,
    change7d: -3.98,
    marketCap: 4022751797,
    volume24h: 485824771,
    circulatingSupply: 420.68e12,
    sparkline: [
      0.000098, 0.000096, 0.000095, 0.000097, 0.000096, 0.000094, 0.000095,
      0.000096, 0.000095, 0.000094, 0.000095, 0.00009562,
    ],
    liquidity: 1000000,
    logo: "https://cryptologos.cc/logos/pepe-pepe-logo.png",
  },
  {
    id: "trump",
    name: "TRUMP",
    symbol: "TRUMP",
    price: 16.48,
    change1h: -0.24,
    change24h: 2.43,
    change7d: -13.04,
    marketCap: 3297979858,
    volume24h: 576895263,
    circulatingSupply: 199.99e6,
    sparkline: [
      18.5, 17.8, 17.2, 16.8, 16.5, 16.2, 16.4, 16.3, 16.5, 16.4, 16.45, 16.48,
    ],
    liquidity: 1000000,
    logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/24383.png",
  },
  {
    id: "bonk",
    name: "BONK",
    symbol: "BONK",
    price: 0.00001606,
    change1h: -0.26,
    change24h: 3.03,
    change7d: -10.52,
    marketCap: 1242482471,
    volume24h: 72068303,
    circulatingSupply: 77.34e12,
    sparkline: [
      0.0000165, 0.0000162, 0.0000161, 0.000016, 0.0000159, 0.0000161, 0.000016,
      0.0000161, 0.0000159, 0.000016, 0.0000161, 0.00001606,
    ],
    liquidity: 1000000,
    logo: "https://cryptologos.cc/logos/bonk-bonk-logo.png",
  },
];
