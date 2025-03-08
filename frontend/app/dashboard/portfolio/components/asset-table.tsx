"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, LineChart, History, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { AutoShillModal } from "./auto-shill-modal";
import { TradeModal } from "./trade-modal";
import { useRouter } from "next/navigation";

import { autoShill } from "@/app/lib/chat";

interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: "defi" | "nft" | "layer1" | "layer2" | "meme" | "stablecoin";
  price: number;
  priceChange: number;
  priceChangePercent: number;
  dailyPL: number;
  avgCost: number;
  pl: number;
  plPercent: number;
  value: number;
  holdings: number;
  address?: string;
}

const mockAssets: Asset[] = [
  {
    id: "ethereum",
    symbol: "WETH",
    name: "Ethereum",
    address: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    category: "layer1",
    avgCost: 2500,
    holdings: 2,
    price: 3500,
    priceChange: 150,
    priceChangePercent: 4.5,
    dailyPL: 300,
    pl: 2000,
    plPercent: 40,
    value: 7000,
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    address: "So11111111111111111111111111111111111111112",
    category: "layer1",
    avgCost: 80,
    holdings: 300,
    price: 145,
    priceChange: 12,
    priceChangePercent: 9.2,
    dailyPL: 3600,
    pl: 19500,
    plPercent: 81.25,
    value: 43500,
  },
  {
    id: "pepe",
    symbol: "PEPE",
    name: "Pepe",
    address: "0x6982508145454ce325ddbe47a25d4ec3d2311933",
    category: "meme",
    avgCost: 0.000001,
    holdings: 50000000,
    price: 0.000003,
    priceChange: 0.0000005,
    priceChangePercent: 20,
    dailyPL: 25,
    pl: 100,
    plPercent: 200,
    value: 150,
  },
  {
    id: "blur",
    symbol: "BLUR",
    name: "Blur",
    address: "0x5283d291dbcf85356a21ba090e6db59121208b44",
    category: "nft",
    avgCost: 0.45,
    holdings: 5000,
    price: 0.65,
    priceChange: 0.05,
    priceChangePercent: 8.3,
    dailyPL: 250,
    pl: 1000,
    plPercent: 44.4,
    value: 3250,
  },
  {
    id: "uniswap",
    symbol: "UNI",
    name: "Uniswap",
    address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    category: "defi",
    avgCost: 4.2,
    holdings: 1000,
    price: 7.8,
    priceChange: 0.3,
    priceChangePercent: 4,
    dailyPL: 300,
    pl: 3600,
    plPercent: 85.7,
    value: 7800,
  },
  {
    id: "dogecoin",
    symbol: "DOGE",
    name: "Dogecoin",
    address: "0x4206931337dc273a630d328da6441786bfad668f",
    category: "meme",
    avgCost: 0.08,
    holdings: 50000,
    price: 0.15,
    priceChange: 0.01,
    priceChangePercent: 7.1,
    dailyPL: 500,
    pl: 3500,
    plPercent: 87.5,
    value: 7500,
  },
  {
    id: "polygon",
    symbol: "MATIC",
    name: "Polygon",
    address: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
    category: "layer2",
    avgCost: 0.9,
    holdings: 10000,
    price: 1.2,
    priceChange: 0.05,
    priceChangePercent: 4.3,
    dailyPL: 500,
    pl: 3000,
    plPercent: 33.3,
    value: 12000,
  },
  {
    id: "aave",
    symbol: "AAVE",
    name: "Aave",
    address: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
    category: "defi",
    avgCost: 80,
    holdings: 50,
    price: 120,
    priceChange: 5,
    priceChangePercent: 4.3,
    dailyPL: 250,
    pl: 2000,
    plPercent: 50,
    value: 6000,
  },
  {
    id: "apecoin",
    symbol: "APE",
    name: "ApeCoin",
    address: "0x4d224452801aced8b2f0aebe155379bb5d594381",
    category: "nft",
    avgCost: 3.5,
    holdings: 2000,
    price: 2.8,
    priceChange: -0.2,
    priceChangePercent: -6.7,
    dailyPL: -400,
    pl: -1400,
    plPercent: -20,
    value: 5600,
  },
  {
    id: "bonk",
    symbol: "BONK",
    name: "Bonk",
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    category: "meme",
    avgCost: 0.000002,
    holdings: 100000000,
    price: 0.000004,
    priceChange: 0.0000005,
    priceChangePercent: 14.3,
    dailyPL: 50,
    pl: 200,
    plPercent: 100,
    value: 400,
  },
];

const getCoinLogo = (symbol: string) => {
  const coinLogos: { [key: string]: string } = {
    BTC: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/btc.png",
    WETH: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/eth.png",
    SOL: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/sol.png",
    PEPE: "https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg?1682922725",
    BLUR: "https://assets.coingecko.com/coins/images/28453/large/blur.png?1670745921",
    UNI: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/uni.png",
    DOGE: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/doge.png",
    MATIC:
      "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/matic.png",
    AAVE: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/128/color/aave.png",
    APE: "https://assets.coingecko.com/coins/images/24383/large/apecoin.jpg?1647476455",
    BONK: "https://assets.coingecko.com/coins/images/28600/large/bonk.jpg?1672304290",
  };

  return coinLogos[symbol.toUpperCase()] || "/placeholder.svg";
};

interface AssetTableProps {
  searchQuery: string;
}

const formatNumber = (num: number): string => {
  if (Math.abs(num) >= 1) {
    return num.toFixed(2);
  }
  return num.toPrecision(3);
};

export function AssetTable({ searchQuery }: AssetTableProps) {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isShillModalOpen, setIsShillModalOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const router = useRouter();

  const filteredAssets = assets.filter(
    (asset) =>
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAutoShill = async (asset: Asset) => {
    setSelectedAsset(asset);
    setIsShillModalOpen(true);
    await autoShill(asset, "c3bd776c-4465-037f-9c7a-bf94dfba78d9");
  };

  return (
    <Card className="overflow-hidden border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left">Asset</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">24h P/L</th>
              <th className="px-4 py-3 text-right">Avg. Cost</th>
              <th className="px-4 py-3 text-right">Holdings</th>
              <th className="px-4 py-3 text-right">P/L</th>
              <th className="px-4 py-3 text-right">P/L(%)</th>
              <th className="px-4 py-3 text-right">Value</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((asset) => (
              <tr
                key={asset.id}
                className="border-b border-white/10 hover:bg-white/5"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 overflow-hidden rounded-full bg-white/10">
                      <Image
                        src={getCoinLogo(asset.symbol) || "/placeholder.svg"}
                        alt={asset.name}
                        width={32}
                        height={32}
                      />
                    </div>
                    <div>
                      <div className="font-medium">
                        <span
                          className="font-semibold transition-colors cursor-pointer hover:text-blue-500"
                          onClick={() => router.push(`/coins/${asset.id}`)}
                        >
                          {asset.name}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span
                          className="block text-sm text-gray-400 transition-colors cursor-pointer hover:text-blue-500"
                          onClick={() => router.push(`/coins/${asset.id}`)}
                        >
                          {asset.symbol}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  ${formatNumber(asset.price)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={
                      asset.dailyPL >= 0 ? "text-green-500" : "text-red-500"
                    }
                  >
                    ${formatNumber(asset.dailyPL)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  ${formatNumber(asset.avgCost)}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatNumber(asset.holdings)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={
                      asset.pl >= 0 ? "text-green-500" : "text-red-500"
                    }
                  >
                    ${formatNumber(asset.pl)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={
                      asset.plPercent >= 0 ? "text-green-500" : "text-red-500"
                    }
                  >
                    {formatNumber(asset.plPercent)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  ${formatNumber(asset.value)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-gradient-to-r from-blue-400 to-blue-500"
                      onClick={() => handleAutoShill(asset)}
                    >
                      Auto Shill
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <LineChart className="w-4 h-4 mr-2" />
                          View Chart
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <History className="w-4 h-4 mr-2" />
                          Transaction History
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedAsset && (
        <AutoShillModal
          isOpen={isShillModalOpen}
          onClose={() => setIsShillModalOpen(false)}
          asset={selectedAsset}
        />
      )}
      {selectedAsset && (
        <TradeModal
          isOpen={isTradeModalOpen}
          onClose={() => setIsTradeModalOpen(false)}
          asset={selectedAsset}
        />
      )}
    </Card>
  );
}
