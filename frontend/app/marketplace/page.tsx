"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  TrendingUp,
  Clock,
  Star,
  ChevronUp,
  ChevronDown,
  Grid,
  List,
} from "lucide-react";
import Navbar from "@/components/navbar";
import api from "@/lib/api";
import { Coin, CoinList } from "@/app/marketplace/types";
import { AxiosResponse } from "axios";
import { formatPrice, formatPercentage, formatLargeNumber } from '@/lib/priceUtils';

export default function MarketplacePage() {
  const [sortBy, setSortBy] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("watchlist");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [coins, setCoins] = useState<Array<Coin>>([]);

  // Save watchlist to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    const fetchCoins = async () => {
      const rs: AxiosResponse<CoinList> = await api.get("/coins");
      const coinList = rs.data.data.map((ele) => ({
        ...ele,
        proposals: 8,
      }));
      setCoins(coinList);
    };
    fetchCoins();
  }, []);

  const toggleWatchlist = (coinId: string) => {
    setWatchlist((prev) =>
      prev.includes(coinId)
        ? prev.filter((id) => id !== coinId)
        : [...prev, coinId]
    );
  };

  const filteredCoins = coins.filter(
    (coin: Coin) =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedCoins = [...filteredCoins].sort((a, b) => {
    switch (sortBy) {
      case "trending":
        return b.holders - a.holders;
      case "newest":
        return b.id.localeCompare(a.id); // Just for demo, would use timestamp in real app
      case "marketCap":
        return b.marketCap - a.marketCap;
      case "priceChange":
        return b.change24h - a.change24h;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-[#0039C6]">
      <div className="max-w-8xl mx-auto px-4 py-8">
        {/* Header with authenticated navbar */}
        <Navbar isAuthenticated={true} />

        {/* Search and Filter */}
        <div className="bg-white rounded-3xl p-6 mb-8 mt-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search meme coins..."
                className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0039C6]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded-full flex items-center gap-1 ${
                  sortBy === "trending"
                    ? "bg-[#0039C6] text-white"
                    : "bg-gray-100"
                }`}
                onClick={() => setSortBy("trending")}
              >
                <TrendingUp size={16} />
                <span>Trending</span>
              </button>
              <button
                className={`px-4 py-2 rounded-full flex items-center gap-1 ${
                  sortBy === "newest"
                    ? "bg-[#0039C6] text-white"
                    : "bg-gray-100"
                }`}
                onClick={() => setSortBy("newest")}
              >
                <Clock size={16} />
                <span>Newest</span>
              </button>
              <button
                className={`px-4 py-2 rounded-full flex items-center gap-1 ${
                  sortBy === "marketCap"
                    ? "bg-[#0039C6] text-white"
                    : "bg-gray-100"
                }`}
                onClick={() => setSortBy("marketCap")}
              >
                <Star size={16} />
                <span>Market Cap</span>
              </button>
              <div className="flex border-2 border-gray-200 rounded-full overflow-hidden">
                <button
                  className={`p-2 ${
                    viewMode === "table"
                      ? "bg-[#0039C6] text-white"
                      : "bg-white"
                  }`}
                  onClick={() => setViewMode("table")}
                  aria-label="Table view"
                >
                  <List size={16} />
                </button>
                <button
                  className={`p-2 ${
                    viewMode === "cards"
                      ? "bg-[#0039C6] text-white"
                      : "bg-white"
                  }`}
                  onClick={() => setViewMode("cards")}
                  aria-label="Card view"
                >
                  <Grid size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Coins List */}
        <div className="bg-white rounded-3xl p-6">
          {viewMode === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-center py-4 px-2">Watchlist</th>
                    <th className="text-left py-4 px-2">#</th>
                    <th className="text-left py-4 px-2">Coin</th>
                    <th className="text-right py-4 px-2">Price</th>
                    <th className="text-right py-4 px-2">24h</th>
                    <th className="text-right py-4 px-2">Market Cap</th>
                    <th className="text-right py-4 px-2">Holders</th>
                    <th className="text-right py-4 px-2">Proposals</th>
                    <th className="text-right py-4 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCoins.map((coin, index) => (
                    <tr
                      key={coin.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="text-center py-4 px-2">
                        <button
                          onClick={() => toggleWatchlist(coin.id)}
                          className={`p-2 rounded-full transition-all ${
                            watchlist.includes(coin.id)
                              ? "bg-[#c0ff00] text-black border-2 border-black"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                          aria-label={
                            watchlist.includes(coin.id)
                              ? "Remove from watchlist"
                              : "Add to watchlist"
                          }
                        >
                          <Star
                            size={18}
                            className={
                              watchlist.includes(coin.id) ? "fill-black" : ""
                            }
                          />
                        </button>
                      </td>
                      <td className="py-4 px-2">{index + 1}</td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <Image
                            src={coin.logo || "/placeholder.svg"}
                            width={32}
                            height={32}
                            alt={coin.name}
                            className="rounded-full"
                          />
                          <div>
                            <div className="font-medium">{coin.name}</div>
                            <div className="text-sm text-gray-500">
                              {coin.symbol}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-4 px-2">
                        {formatPrice(coin.price, { minDecimals: 2, maxDecimals: 8 })}
                      </td>
                      <td className="text-right py-4 px-2">
                        <span
                          className={`flex items-center justify-end gap-1 ${
                            coin.change24h >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {coin.change24h >= 0 ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                          {formatPercentage(coin.change24h)}
                        </span>
                      </td>
                      <td className="text-right py-4 px-2">
                        {formatLargeNumber(coin.marketCap, { suffix: 'M' })}
                      </td>
                      <td className="text-right py-4 px-2">
                        {coin.holders.toLocaleString()}
                      </td>
                      <td className="text-right py-4 px-2">{coin.proposals}</td>
                      <td className="text-right py-4 px-2">
                        <Link
                          href={`/marketplace/${coin.id}`}
                          className="bg-[#0039C6] text-white px-4 py-1 rounded-full text-sm hover:bg-opacity-90 transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCoins.map((coin) => (
                <div key={coin.id} className="relative">
                  <button
                    onClick={() => toggleWatchlist(coin.id)}
                    className={`absolute top-3 right-3 p-2 rounded-full z-10 transition-all ${
                      watchlist.includes(coin.id)
                        ? "bg-[#c0ff00] text-black border-2 border-black"
                        : "bg-white hover:bg-gray-100 border-2 border-gray-200"
                    }`}
                    aria-label={
                      watchlist.includes(coin.id)
                        ? "Remove from watchlist"
                        : "Add to watchlist"
                    }
                  >
                    <Star
                      size={18}
                      className={
                        watchlist.includes(coin.id) ? "fill-black" : ""
                      }
                    />
                  </button>
                  <Link
                    href={`/marketplace/${coin.id}`}
                    className="block h-full"
                  >
                    <div className="bg-white rounded-xl border-2 border-black p-4 hover:shadow-lg transition-shadow h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={coin.logo || "/placeholder.svg"}
                            width={48}
                            height={48}
                            alt={coin.name}
                            className="rounded-full object-cover w-full h-full"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{coin.name}</h3>
                          <p className="text-gray-500">{coin.symbol}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <p className="text-xs text-gray-500">Price</p>
                          <p className="font-medium truncate">
                            {formatPrice(coin.price, { minDecimals: 2, maxDecimals: 8 })}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <p className="text-xs text-gray-500">24h</p>
                          <p
                            className={`font-medium flex items-center ${
                              coin.change24h >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {coin.change24h >= 0 ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                            {formatPercentage(coin.change24h)}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <p className="text-xs text-gray-500">Market Cap</p>
                          <p className="font-medium">
                            {formatLargeNumber(coin.marketCap, { suffix: 'M' })}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <p className="text-xs text-gray-500">Holders</p>
                          <p className="font-medium">
                            {coin.holders.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <button className="w-full bg-[#0039C6] text-white py-2 rounded-full text-sm hover:bg-opacity-90 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
