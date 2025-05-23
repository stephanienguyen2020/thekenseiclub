"use client";

import { Coin, CoinList } from "@/app/marketplace/types";
import Navbar from "@/components/navbar";
import api from "@/lib/api";
import {
  formatLargeNumber,
  formatPercentage,
  formatPrice,
} from "@/lib/priceUtils";
import { AxiosResponse } from "axios";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Grid,
  List,
  Search,
  Star,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function MarketplacePage() {
  const [sortBy, setSortBy] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [selectedChain, setSelectedChain] = useState("kensei");
  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("watchlist");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [coins, setCoins] = useState<Array<Coin>>([]);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const chainOptions = [
    { value: "kensei", label: "Kensei", color: "#0039C6" },
    { value: "sui", label: "Sui", color: "#4DA2FF", image: "/sui.jpg" },
    { value: "ethereum", label: "ETH", color: "#627EEA", image: "/eth.png" },
  ];

  // Save watchlist to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  // Handle clicking outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsChainDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchCoins = async () => {
      setLoading(true);
      try {
        if (selectedChain === "kensei") {
          // Use existing coins API for Kensei
          const rs: AxiosResponse<CoinList> = await api.get("/coins");
          const coinList = rs.data.data.map((ele) => ({
            ...ele,
            proposals: 8,
          }));
          setCoins(coinList);
        } else {
          // Use nonNativeToken API for Sui and ETH through Next.js API route
          const platform = selectedChain === "sui" ? "sui" : "ethereum";
          const response = await fetch(
            `/api/non-native-token?platform=${platform}&limit=100`
          );

          if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);

            // If we get an error that suggests empty database, try to initialize it
            if (
              response.status === 500 ||
              errorData.error?.includes("Failed to fetch")
            ) {
              console.log("Attempting to initialize token database...");
              try {
                const initResponse = await fetch(
                  "/api/non-native-token/initialize",
                  {
                    method: "POST",
                  }
                );

                if (initResponse.ok) {
                  console.log(
                    "Database initialized successfully, retrying fetch..."
                  );
                  // Retry the original request
                  const retryResponse = await fetch(
                    `/api/non-native-token?platform=${platform}&limit=100`
                  );
                  if (retryResponse.ok) {
                    const retryResult = await retryResponse.json();
                    const coinList = retryResult.tokens.map((token: any) => ({
                      id: token.coingeckoId,
                      name: token.name,
                      symbol: token.symbol.toUpperCase(),
                      logo: token.image,
                      price: token.current_price_usd || 0,
                      change24h:
                        token.market_cap_change_percentage_24h_usd || 0,
                      marketCap: token.market_cap_usd || 0,
                      holders: Math.floor(Math.random() * 10000) + 1000,
                      proposals: Math.floor(Math.random() * 20) + 1,
                    }));
                    setCoins(coinList);
                    return;
                  }
                }
              } catch (initError) {
                console.error("Failed to initialize database:", initError);
              }
            }

            throw new Error(
              `HTTP error! status: ${response.status} - ${
                errorData.error || "Unknown error"
              }`
            );
          }

          const result = await response.json();

          // Transform nonNativeToken data to match Coin interface
          const coinList = result.tokens.map((token: any) => ({
            id: token.coingeckoId,
            name: token.name,
            symbol: token.symbol.toUpperCase(),
            logo: token.image,
            price: token.current_price_usd || 0,
            change24h: token.market_cap_change_percentage_24h_usd || 0,
            marketCap: token.market_cap_usd || 0,
            holders: Math.floor(Math.random() * 10000) + 1000, // Placeholder since API doesn't provide this
            proposals: Math.floor(Math.random() * 20) + 1, // Placeholder
          }));
          setCoins(coinList);
        }
      } catch (error) {
        console.error("Failed to fetch coins:", error);
        setCoins([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, [selectedChain]);

  const toggleWatchlist = (coinId: string) => {
    setWatchlist((prev) =>
      prev.includes(coinId)
        ? prev.filter((id) => id !== coinId)
        : [...prev, coinId]
    );
  };

  const handleChainSelect = (chainValue: string) => {
    setSelectedChain(chainValue);
    setIsChainDropdownOpen(false);
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

  const selectedChainOption = chainOptions.find(
    (option) => option.value === selectedChain
  );

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
            <div className="px-4 py-2 rounded-full flex items-center gap-1">
              {/* Chain Selection Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsChainDropdownOpen(!isChainDropdownOpen)}
                  className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center gap-1 font-medium transition-all"
                >
                  {selectedChainOption?.image ? (
                    <Image
                      src={selectedChainOption.image}
                      width={16}
                      height={16}
                      alt={selectedChainOption.label}
                      className="rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: selectedChainOption?.color }}
                    ></div>
                  )}
                  <span>{selectedChainOption?.label}</span>
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform ${
                      isChainDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isChainDropdownOpen && (
                  <div className="absolute top-full mt-2 w-full bg-white border-2 border-black rounded-xl shadow-lg z-50 overflow-hidden">
                    {chainOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleChainSelect(option.value)}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                          selectedChain === option.value ? "bg-gray-100" : ""
                        }`}
                      >
                        {option.image ? (
                          <Image
                            src={option.image}
                            width={16}
                            height={16}
                            alt={option.label}
                            className="rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: option.color }}
                          ></div>
                        )}
                        <span className="font-medium">{option.label}</span>
                        {selectedChain === option.value && (
                          <ChevronRight size={16} className="ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

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
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0039C6]"></div>
              <span className="ml-3 text-gray-600">
                Loading {selectedChainOption?.label} coins...
              </span>
            </div>
          ) : viewMode === "table" ? (
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
                        {formatPrice(coin.price, {
                          minDecimals: 2,
                          maxDecimals: 8,
                        })}
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
                        {formatLargeNumber(coin.marketCap, { suffix: "" })}
                      </td>
                      <td className="text-right py-4 px-2">
                        {coin.holders.toLocaleString()}
                      </td>
                      <td className="text-right py-4 px-2">{coin.proposals}</td>
                      <td className="text-right py-4 px-2">
                        <Link
                          href={
                            selectedChain === "kensei"
                              ? `/marketplace/${coin.id}`
                              : `/marketplace/external/${coin.id}?chain=${selectedChain}`
                          }
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
                    href={
                      selectedChain === "kensei"
                        ? `/marketplace/${coin.id}`
                        : `/marketplace/external/${coin.id}?chain=${selectedChain}`
                    }
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
                            {formatPrice(coin.price, {
                              minDecimals: 2,
                              maxDecimals: 8,
                            })}
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
                            {formatLargeNumber(coin.marketCap, { suffix: "" })}
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

          {!loading && sortedCoins.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No coins found for {selectedChainOption?.label}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search or selecting a different chain
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
