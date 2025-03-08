"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wallet,
  Activity,
  Users,
  MessageSquare,
  BarChart2,
  PieChart,
  Globe,
  Layers,
  Brain,
} from "lucide-react";
import { SiteHeader } from "@/app/components/site-header";
import { Footer } from "@/app/components/Footer";
import { Input } from "@/components/ui/input";
import Marquee from "react-fast-marquee";
import { SiteLeftbar } from "@/app/components/site-leftbar";

// Import the mock coin data
import { trendingCoins, type Coin } from "@/app/data/mockCoins";
import router from "next/router";

// Import the TopHolders component
import TopHolders, { mockHolders } from "../components/TopHolders";
import CoinsRightBar from "../components/CoinsRightBar";

// import fetching top holders
import { fetchTopHolders } from "@/app/lib/topHolder";
import { fetchTokenInfo } from "@/app/lib/coins";

// Types for enhanced features
type TimeRange = "5M" | "1H" | "4H" | "24H";

type VolumeData = {
  timeRange: TimeRange;
  buyVolume: number;
  sellVolume: number;
  netChange: number;
};

type TraderAnalytics = {
  totalTraders: number;
  activeTraders24h: number;
  avgTradeSize: number;
  topTrader: string;
};

type LiquidityData = {
  totalLiquidity: number;
  liquidityChange24h: number;
  topPool: string;
  poolCount: number;
};

// Add new type for API response
type TokenInfo = {
  baseTokenAddress: string;
  baseTokenImageUrl: string;
  baseTokenName: string;
  baseTokenSymbol: string;
  currentPrice: number;
  liquidity: number;
  marketCap: number;
  priceChange24hr: number;
  txStats24hr: {
    buyers: number;
    buys: number;
    sellers: number;
    sells: number;
  };
  volume24hr: number;
};

const TradingViewWidget = dynamic(
  () => import("../components/trading-view-widget"),
  {
    ssr: false,
  }
);

const getTradingViewWidget = (pool_id: string) => {
  return (
    <iframe
      height="100%"
      width="100%"
      id="geckoterminal-embed"
      title="GeckoTerminal Embed"
      src={`https://www.geckoterminal.com/sui-network/pools/${pool_id}?embed=1&info=0&swaps=0&grayscale=0&light_chart=0`}
      style={{ border: 0 }}
      allow="clipboard-write"
      allowFullScreen
    ></iframe>
  );
};

const timeRanges = ["6H", "1D", "7D", "30D"];

// Add this new component for the title
const TitleMarquee: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="w-full overflow-hidden">
      <Marquee
        gradient={false}
        speed={20}
        delay={2}
        play={true}
        direction="left"
        pauseOnHover={true}
      >
        <span className="text-3xl text-green-400 font-pixel">{text}</span>
      </Marquee>
    </div>
  );
};

// Import the components
import MarketStatsTab from "../components/MarketStatsTab";
import TradersTab from "../components/TradersTab";
import LiquidityTab from "../components/LiquidityTab";
import BubbleMapTab from "../components/BubbleMapTab";
import ActiveWalletsTab from "../components/ActiveWalletsTab";
import CoinTrade from "../components/CoinTrade";
import CoinChat from "../components/CoinChat";

export default function CoinPage() {
  const { id } = useParams();
  const [amount, setAmount] = useState("");
  const [total, setTotal] = useState("");
  const balance = 500;
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [coinData, setCoinData] = useState<Coin | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");

  // Mock volume data
  const volumeData: VolumeData[] = [
    { timeRange: "5M", buyVolume: 1.4, sellVolume: 1.4, netChange: -2.07 },
    { timeRange: "1H", buyVolume: 7.8, sellVolume: 7.8, netChange: -2.03 },
    { timeRange: "4H", buyVolume: 15.2, sellVolume: 14.8, netChange: -1.69 },
    { timeRange: "24H", buyVolume: 45.6, sellVolume: 42.4, netChange: 8.04 },
  ];

  // Available timeframes
  const timeframes = ["6H", "12H", "1D", "3D", "7D", "30D"];

  useEffect(() => {
    // Check authentication status on client side
    const fetchCoin = async () => {
      try {
        const tokenInfo = await fetchTokenInfo(id as string);
        console.log("tokenInfo", tokenInfo);
        if (tokenInfo) {
          // Convert API data to match our Coin type structure
          const apiCoin: Coin = {
            id: id as string,
            name: tokenInfo.baseTokenName,
            symbol: tokenInfo.baseTokenSymbol,
            price: tokenInfo.currentPrice,
            change1h: 0, // Not provided in API
            change24h: tokenInfo.priceChange24hr,
            change7d: 0, // Not provided in API
            marketCap: tokenInfo.marketCap,
            volume24h: tokenInfo.volume24hr,
            liquidity: tokenInfo.liquidity,
            circulatingSupply: 0, // Not provided in API
            sparkline: [], // Not provided in API
            logo: tokenInfo.baseTokenImageUrl,
          };

          setCoinData(apiCoin);
          setLoading(false);
        } else {
          // Fallback to mock data if API returns nothing
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching token info:", error);
        setLoading(false);
      }
    };
    const savedAuth = localStorage.getItem("isAuthenticated");
    setIsAuthenticated(savedAuth === "true");

    // Fetch coin data based on ID
    if (id) {
      fetchCoin();
    }
  }, [id]);

  // Redirect if not authenticated for trading functionality
  const handleTradeAction = () => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }
    // Handle trade action for authenticated users
  };

  const handlePercentageClick = (percentage: number) => {
    const newAmount = ((balance * percentage) / 100).toFixed(2);
    setAmount(newAmount);
    setTotal(newAmount);
  };

  // Mock market stats
  const marketStats = {
    price: "$0.00123",
    change24h: "+5.67%",
    volume24h: "$1,234,567",
    marketCap: "$12,345,678",
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      <SiteHeader />

      <div className="flex flex-1 pt-16">
        {/* Show sidebar when authenticated */}
        {isAuthenticated && (
          <div className="fixed top-16 left-0 bottom-0 z-40 w-[280px]">
            <SiteLeftbar />
          </div>
        )}

        <main
          className={`flex-1 ${isAuthenticated ? "ml-0 md:ml-[280px]" : ""} ${
            coinData ? "pr-0 lg:pr-[500px]" : ""
          }`}
        >
          <div className="container p-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-t-2 border-b-2 rounded-full animate-spin border-gray-400/30"></div>
              </div>
            ) : coinData ? (
              <div className="grid grid-cols-12 gap-6">
                {/* Chart and Analytics */}
                <div className="col-span-12">
                  {/* Chart Card */}
                  <Card className="mb-6 border border-gray-400/30">
                    <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                      <CardTitle className="flex items-center gap-2 text-xl font-bold">
                        <span>{coinData.symbol}/USDT</span>
                        <span className="text-sm text-green-400">(+8.56%)</span>
                      </CardTitle>
                      <div className="w-full overflow-x-auto sm:w-auto">
                        <div className="flex gap-2 min-w-max">
                          {timeframes.map((timeframe) => (
                            <Button
                              key={timeframe}
                              variant={
                                selectedTimeframe === timeframe
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => setSelectedTimeframe(timeframe)}
                            >
                              {timeframe}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="w-full p-0">
                      <TradingViewWidget symbol={coinData.symbol} />
                    </CardContent>
                  </Card>

                  {/* Analytics Tabs */}
                  <Card className="border border-gray-400/30">
                    <CardContent className="p-4">
                      <Tabs defaultValue="market-stats">
                        <div className="pb-2 overflow-x-auto">
                          <TabsList className="inline-flex mb-4 min-w-max">
                            <TabsTrigger value="market-stats">
                              <Globe className="w-4 h-4 mr-2" />
                              Market Stats
                            </TabsTrigger>
                            <TabsTrigger value="holders">
                              <Users className="w-4 h-4 mr-2" />
                              Top Holders
                            </TabsTrigger>
                            <TabsTrigger value="traders">
                              <Activity className="w-4 h-4 mr-2" />
                              Traders
                            </TabsTrigger>
                            <TabsTrigger value="liquidity">
                              <Layers className="w-4 h-4 mr-2" />
                              Liquidity
                            </TabsTrigger>
                            <TabsTrigger value="bubble-map">
                              <PieChart className="w-4 h-4 mr-2" />
                              Bubble Map
                            </TabsTrigger>
                            <TabsTrigger value="wallets">
                              <Wallet className="w-4 h-4 mr-2" />
                              Active Wallets
                            </TabsTrigger>
                          </TabsList>
                        </div>

                        {/* Tab Content */}
                        <TabsContent value="market-stats">
                          <MarketStatsTab
                            coinData={coinData}
                            volumeData={volumeData}
                          />
                        </TabsContent>
                        <TabsContent value="holders">
                          <TopHolders holders={mockHolders} />
                        </TabsContent>
                        <TabsContent value="traders">
                          <TradersTab />
                        </TabsContent>
                        <TabsContent value="liquidity">
                          <LiquidityTab />
                        </TabsContent>
                        <TabsContent value="bubble-map">
                          <BubbleMapTab />
                        </TabsContent>
                        <TabsContent value="wallets">
                          <ActiveWalletsTab />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Section - Trading/Chat Interface - Now using the fixed component */}
                {coinData && (
                  <CoinsRightBar
                    symbol={coinData.symbol}
                    isAuthenticated={isAuthenticated}
                    handleTradeAction={handleTradeAction}
                  />
                )}
              </div>
            ) : (
              <div className="py-12 text-center">
                <h2 className="mb-4 text-2xl font-bold">Coin not found</h2>
                <p className="mb-6">
                  The coin you're looking for doesn't exist or has been removed.
                </p>
                <Button onClick={() => router.push("/")}>Return to Home</Button>
              </div>
            )}
          </div>
        </main>
      </div>
      {/* Only show footer when not logged in */}
      {!isAuthenticated && <Footer />}
    </div>
  );
}
