"use client";

import { AppLayout } from "../components/app-layout";
import { MemeCoinMarketCap } from "../components/MemeCoinMarketCap";
import { fetchTrendingTokens } from "@/app/lib/coins";
import { useState, useEffect } from "react";
import { TrendingCoin } from "@/app/types/coins";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

function Sparkline({
  data,
  width = 60,
  height = 20,
  color = "#4ade80",
}: SparklineProps) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const points = data
    .map(
      (value, index) =>
        `${(index / (data.length - 1)) * width},${
          height - ((value - min) / range) * height
        }`
    )
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MarketcapPage(): JSX.Element {
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchTrendingTokensData = async () => {
      if (!mounted) return;

      try {
        setIsLoading(true);
        const tokens = await fetchTrendingTokens();

        if (!mounted) return;

        const updatedCoins: TrendingCoin[] = tokens.map((token) => ({
          name: token.name,
          price: token.price,
          volume_24h: token.volume_24h,
          symbol: token.symbol,
          change: `${
            token.price_change_24h >= 0 ? "+" : ""
          }${token.price_change_24h.toFixed(2)}%`,
          marketCap: token.marketcap?.toString() || "0",
          volume: token.volume_24h.toString(),
          image: token.image_url,
          address: token.address,
          listed: "Recently",
          sparklineData: [1, 1, 1, 1, 1, 1, 1],
          holders: `${token.active_users_24h}`,
          transactions: `${token.transactions_24h}`,
        }));

        if (mounted) {
          setTrendingCoins(updatedCoins);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching trending tokens:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTrendingTokensData();

    const interval = setInterval(fetchTrendingTokensData, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <AppLayout showFooter={false}>
      <div className="relative z-10 container py-8">
        <h1 className="mb-2 text-4xl font-bold">
          Today's Meme Coin Prices by{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-[#00ff00] to-emerald-400">
            Market Cap
          </span>
        </h1>
        <p className="mb-8 text-muted-foreground">
          Track and analyze the latest meme coins across multiple chains
        </p>
        <MemeCoinMarketCap coins={trendingCoins} />
      </div>
    </AppLayout>
  );
}
