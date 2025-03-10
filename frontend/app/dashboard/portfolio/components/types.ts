export interface Asset {
  id: string
  symbol: string
  name: string
  category: "defi" | "nft" | "layer1" | "layer2" | "meme" | "stablecoin"
  price: number
  priceChange: number
  priceChangePercent: number
  dailyPL: number
  avgCost: number
  pl: number
  plPercent: number
  value: number
  holdings: number
  address?: string
}

