"use client";

import Navbar from "@/components/navbar";
import {
  formatLargeNumber,
  formatPercentage,
  formatPrice,
} from "@/lib/priceUtils";
import { ArrowLeft, Building, LineChart, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ExternalCoin {
  id: string;
  coingeckoId: string;
  name: string;
  symbol: string;
  logo: string;
  price: number;
  change24h: number;
  marketCap: number;
  holders: number;
  proposals: number;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  volume24h?: number;
  image?: string;
  platforms?: { [key: string]: string };
}

const chainOptions: {
  [key: string]: { label: string; color: string; image: string };
} = {
  sui: { label: "Sui", color: "#4DA2FF", image: "/sui.jpg" },
  ethereum: { label: "ETH", color: "#627EEA", image: "/eth.png" },
};

export default function ExternalTokenDetailPage() {
  const [activeTab, setActiveTab] = useState("info");
  const params = useParams();
  const searchParams = useSearchParams();
  const id = typeof params.id === "string" ? params.id : "";
  const chain = searchParams.get("chain") || "sui";
  const [coin, setCoin] = useState<ExternalCoin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch external coin data
        const response = await fetch(`/api/non-native-token/${id}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch token data: ${response.status}`);
        }

        const tokenData = await response.json();

        // Transform the external token data to match our interface
        const coinData: ExternalCoin = {
          id: tokenData.coingeckoId,
          coingeckoId: tokenData.coingeckoId,
          name: tokenData.name,
          symbol: tokenData.symbol?.toUpperCase() || "",
          logo: tokenData.image || "/placeholder.svg",
          price: tokenData.current_price_usd || 0,
          change24h: tokenData.market_cap_change_percentage_24h_usd || 0,
          marketCap: tokenData.market_cap_usd || 0,
          holders: Math.floor(Math.random() * 10000) + 1000, // Placeholder
          proposals: Math.floor(Math.random() * 20) + 1, // Placeholder
          description: `${tokenData.name} is a cryptocurrency token on the ${
            chainOptions[chain]?.label || chain
          } blockchain.`,
          volume24h: 0, // Not available in current API
          image: tokenData.image,
          platforms: tokenData.platforms || {},
        };

        setCoin(coinData);
        setError(null);
      } catch (err) {
        console.error("Error fetching external token data:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, chain]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0039C6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-lg">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-[#c0ff00] border-r-[#c0ff00] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg font-medium">Loading token details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0039C6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-lg">
          <div className="flex flex-col items-center">
            <p className="text-red-500 text-lg font-medium">Error: {error}</p>
            <Link
              href="/marketplace"
              className="mt-4 bg-[#0039C6] text-white px-4 py-2 rounded-full"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const chainInfo = chainOptions[chain];

  return (
    <div className="min-h-screen bg-[#0039C6]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <Navbar isAuthenticated={true} />

        <div className="flex items-center mb-8 mt-4">
          <Link href="/marketplace" className="flex items-center gap-2">
            <ArrowLeft className="text-white" />
            <div className="bg-white text-black px-3 py-1 rounded-full text-sm font-bold">
              {chainInfo?.label || chain.toUpperCase()}
            </div>
            <div className="bg-[#c0ff00] text-black px-3 py-1 rounded-full text-sm font-bold">
              EXTERNAL
            </div>
          </Link>
        </div>

        {/* Coin Info Card */}
        <div className="bg-white rounded-3xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Image
              src={coin?.logo || "/placeholder.svg"}
              width={80}
              height={80}
              alt={coin?.name || ""}
              className="rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{coin?.name}</h1>
                <span className="bg-gray-100 px-2 py-1 rounded-full text-sm">
                  {coin?.symbol}
                </span>
                {chainInfo?.image ? (
                  <Image
                    src={chainInfo.image}
                    width={16}
                    height={16}
                    alt={`${chainInfo.label} Network`}
                    className="rounded-full"
                  />
                ) : (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: chainInfo?.color }}
                    title={`${chainInfo?.label} Network`}
                  ></div>
                )}
              </div>
              <p className="text-gray-600 mb-4">{coin?.description}</p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2">
                  <LineChart size={16} />
                  <div>
                    {formatPrice(coin?.price || 0, {
                      minDecimals: 2,
                      maxDecimals: 8,
                    })}
                  </div>
                  <div
                    className={`text-sm ${
                      (coin?.change24h || 0) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {(coin?.change24h || 0) >= 0 ? "+" : ""}
                    {formatPercentage(coin?.change24h || 0)}
                  </div>
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2">
                  <Building size={16} />
                  <span>
                    Market Cap:{" "}
                    {formatLargeNumber(coin?.marketCap || 0, { suffix: "" })}
                  </span>
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2">
                  <Users size={16} />
                  <span>{coin?.holders.toLocaleString() || 0} holders</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-[#c0ff00] text-black px-4 py-2 rounded-full text-sm font-bold border-2 border-black">
                Follow
              </button>
              {coin?.platforms && coin.platforms[chain] && (
                <a
                  href={`https://${
                    chain === "ethereum" ? "etherscan.io" : "suiexplorer.com"
                  }/token/${coin.platforms[chain]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-100 p-2 rounded-full"
                  title="View on Explorer"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.44 4 16.08 4 12C4 11.38 4.08 10.79 4.21 10.21L9 15V16C9 17.1 9.9 18 11 18V19.93ZM17.9 17.39C17.64 16.58 16.9 16 16 16H15V13C15 12.45 14.55 12 14 12H8V10H10C10.55 10 11 9.55 11 9V7H13C14.1 7 15 6.1 15 5V4.59C17.93 5.78 20 8.65 20 12C20 14.08 19.2 15.97 17.9 17.39Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-3xl p-4 flex gap-4 border-b">
          <button
            className={`px-4 py-2 rounded-full ${
              activeTab === "info" ? "bg-[#0039C6] text-white" : "bg-gray-100"
            }`}
            onClick={() => setActiveTab("info")}
          >
            Token Info
          </button>
          <button
            className={`px-4 py-2 rounded-full ${
              activeTab === "trading"
                ? "bg-[#0039C6] text-white"
                : "bg-gray-100"
            }`}
            onClick={() => setActiveTab("trading")}
          >
            External Links
          </button>
          <button
            className={`px-4 py-2 rounded-full ${
              activeTab === "feed" ? "bg-[#0039C6] text-white" : "bg-gray-100"
            }`}
            onClick={() => setActiveTab("feed")}
          >
            Token Feed
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-b-3xl p-6">
          {activeTab === "info" && (
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <Building size={20} className="text-[#0039C6]" />
                Token Information
              </h2>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold mb-2">Network</h3>
                  <div className="flex items-center gap-2">
                    {chainInfo?.image ? (
                      <Image
                        src={chainInfo.image}
                        width={16}
                        height={16}
                        alt={chainInfo.label}
                        className="rounded-full"
                      />
                    ) : (
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: chainInfo?.color }}
                      ></div>
                    )}
                    <span>{chainInfo?.label}</span>
                  </div>
                </div>

                {coin?.platforms && coin.platforms[chain] && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-semibold mb-2">Contract Address</h3>
                    <div className="flex items-center gap-2">
                      <code className="bg-white px-2 py-1 rounded text-sm font-mono border flex-1 break-all">
                        {coin.platforms[chain]}
                      </code>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(coin.platforms![chain])
                        }
                        className="bg-[#0039C6] text-white px-3 py-1 rounded text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold mb-2">CoinGecko ID</h3>
                  <code className="bg-white px-2 py-1 rounded text-sm font-mono border">
                    {coin?.coingeckoId}
                  </code>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold mb-2">External Links</h3>
                  <div className="flex gap-2">
                    <a
                      href={`https://www.coingecko.com/en/coins/${coin?.coingeckoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#0039C6] text-white px-4 py-2 rounded-full text-sm"
                    >
                      View on CoinGecko
                    </a>
                    {coin?.platforms && coin.platforms[chain] && (
                      <a
                        href={`https://${
                          chain === "ethereum"
                            ? "etherscan.io"
                            : "suiexplorer.com"
                        }/token/${coin.platforms[chain]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-100 px-4 py-2 rounded-full text-sm border-2 border-black"
                      >
                        View on Explorer
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "feed" && (
            <div className="text-center py-10">
              <div className="text-gray-400 mb-4">
                <Building size={48} className="mx-auto opacity-50" />
              </div>
              <h3 className="text-xl font-bold mb-2">Token Feed Coming Soon</h3>
              <p className="text-gray-500 mb-6">
                Social features for external tokens are under development.
              </p>
              <Link
                href="/marketplace"
                className="bg-[#0039C6] text-white px-6 py-2 rounded-full"
              >
                Back to Marketplace
              </Link>
            </div>
          )}

          {activeTab === "trading" && (
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                <LineChart size={20} className="text-[#0039C6]" />
                External Trading Links
              </h2>

              <div className="space-y-4">
                <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl">
                  <h3 className="font-semibold text-yellow-800 mb-2">
                    ⚠️ External Token Notice
                  </h3>
                  <p className="text-yellow-700 text-sm">
                    This token is hosted on {chainInfo?.label} network. Trading
                    is available through external platforms.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <a
                    href={`https://www.coingecko.com/en/coins/${coin?.coingeckoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-50 p-4 rounded-xl border-2 border-black hover:bg-gray-100 transition-colors"
                  >
                    <h4 className="font-semibold mb-2">CoinGecko</h4>
                    <p className="text-gray-600 text-sm">
                      View detailed market data and charts
                    </p>
                  </a>

                  {chain === "ethereum" && (
                    <a
                      href={`https://app.uniswap.org/#/swap?outputCurrency=${coin?.platforms?.ethereum}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-50 p-4 rounded-xl border-2 border-black hover:bg-gray-100 transition-colors"
                    >
                      <h4 className="font-semibold mb-2">Uniswap</h4>
                      <p className="text-gray-600 text-sm">
                        Trade on Ethereum's leading DEX
                      </p>
                    </a>
                  )}

                  {chain === "sui" && (
                    <a
                      href="https://cetus.zone/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-50 p-4 rounded-xl border-2 border-black hover:bg-gray-100 transition-colors"
                    >
                      <h4 className="font-semibold mb-2">Cetus</h4>
                      <p className="text-gray-600 text-sm">
                        Trade on Sui's leading DEX
                      </p>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
