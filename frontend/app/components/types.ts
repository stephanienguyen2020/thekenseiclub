import type { LucideIcon } from "lucide-react";

export interface Chain {
  id: string;
  name: string;
  logo: string;
}

export interface FilterOption {
  id: "latest" | "trending" | "new" | "gainers" | "visited";
  label: string;
  icon: LucideIcon;
}

export interface MemeToken {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  price: string;
  marketCap: string;
  priceChange: number;
  fundingRaised: string;
  chain: string;
}
