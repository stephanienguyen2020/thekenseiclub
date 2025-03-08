"use client";
// Test comment to check Git tracking

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Sprout,
  TrendingUp,
  Eye,
  Star,
  Search,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { SparklineChart } from "./SparklineChart";
import type { Chain, FilterOption } from "./types";
import { MarketFilters } from "./MarketFilters";
import { useRouter } from "next/navigation";
import { trendingCoins } from "@/app/data/mockCoins";
import { TrendingCoin } from "@/app/types/coins";
import { Input } from "@/components/ui/input";

const chains: Chain[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  },
  {
    id: "bsc",
    name: "BSC",
    logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
  },
  {
    id: "solana",
    name: "Solana",
    logo: "https://cryptologos.cc/logos/solana-sol-logo.png",
  },
  {
    id: "polygon",
    name: "Polygon",
    logo: "https://cryptologos.cc/logos/polygon-matic-logo.png",
  },
  {
    id: "avalanche",
    name: "Avalanche",
    logo: "https://cryptologos.cc/logos/avalanche-avax-logo.png",
  },
  {
    id: "cardano",
    name: "Cardano",
    logo: "https://cryptologos.cc/logos/cardano-ada-logo.png",
  },
  {
    id: "optimism",
    name: "Optimism",
    logo: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.png",
  },
  {
    id: "tron",
    name: "TRON",
    logo: "https://cryptologos.cc/logos/tron-trx-logo.png",
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    logo: "https://cryptologos.cc/logos/arbitrum-arb-logo.png",
  },
];

const filterOptions: FilterOption[] = [
  { id: "new", label: "New", icon: Sprout },
  { id: "gainers", label: "Gainers", icon: TrendingUp },
  { id: "visited", label: "Most Visited", icon: Eye },
];

// Helper functions for watchlist management
const WATCHLIST_STORAGE_KEY = "hedgefi_watchlist";

const getWatchlistFromStorage = (): string[] => {
  if (typeof window === "undefined") return [];

  try {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      return []; // Return empty array if not authenticated
    }

    const saved = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Failed to load watchlist from storage:", error);
    return [];
  }
};

const saveWatchlistToStorage = (watchlist: string[]) => {
  if (typeof window === "undefined") return;

  try {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      return; // Don't save if not authenticated
    }

    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
  } catch (error) {
    console.error("Failed to save watchlist to storage:", error);
  }
};
interface MemeCoinMarketCapProps {
  watchlistOnly?: boolean;
  coins?: TrendingCoin[]; // Add coins prop
}

export function MemeCoinMarketCap({
  watchlistOnly = false,
  coins = [], // Default to empty array
}: MemeCoinMarketCapProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [activeFilter, setActiveFilter] = useState<
    "latest" | "trending" | "new" | "gainers" | "visited"
  >("new");
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const itemsPerPage = 5;
  const [searchTerm, setSearchTerm] = useState("");

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const loadWatchlist = () => {
      const savedWatchlist = getWatchlistFromStorage();
      setFavorites(savedWatchlist);
      setIsLoaded(true);
    };

    loadWatchlist();

    // Add event listener to sync watchlist across tabs/windows
    window.addEventListener("storage", (event) => {
      if (event.key === WATCHLIST_STORAGE_KEY) {
        const newWatchlist = event.newValue ? JSON.parse(event.newValue) : [];
        setFavorites(newWatchlist);
      }
    });

    return () => {
      window.removeEventListener("storage", () => {});
    };
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      saveWatchlistToStorage(favorites);
    }
  }, [favorites, isLoaded]);

  const handleFavoriteToggle = (coinId: string) => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

    if (!isAuthenticated) {
      // Show inline login warning instead of alert
      const warningElement = document.createElement("div");
      warningElement.className =
        "fixed z-50 flex items-center gap-2 p-4 text-black rounded-lg shadow-lg bottom-4 right-4 bg-yellow-500/90";
      warningElement.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <span>Please log in to add tokens to your watchlist</span>
      `;
      document.body.appendChild(warningElement);

      // Remove the warning after 3 seconds
      setTimeout(() => {
        warningElement.classList.add(
          "opacity-0",
          "transition-opacity",
          "duration-300"
        );
        setTimeout(() => {
          document.body.removeChild(warningElement);
        }, 300);
      }, 3000);

      return;
    }

    setFavorites((prev) => {
      const newFavorites = prev.includes(coinId)
        ? prev.filter((id) => id !== coinId)
        : [...prev, coinId];

      // Immediately save to localStorage to ensure consistency
      saveWatchlistToStorage(newFavorites);
      return newFavorites;
    });
  };

  // Filter and sort coins based on active filter and watchlist setting
  const filteredCoins = useMemo(() => {
    // Use provided coins data instead of trendingCoins
    let filtered = [...coins];

    // Filter by favorites if watchlistOnly is true
    if (watchlistOnly) {
      filtered = filtered.filter((coin) => favorites.includes(coin.address));
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (coin) =>
          coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by chain if selected
    if (selectedChain) {
      // This is a placeholder - in a real app, you'd filter by chain
      // filtered = filtered.filter(coin => coin.chain === selectedChain.id)
    }

    // Sort based on active filter
    switch (activeFilter) {
      case "latest":
      case "new":
        filtered = filtered.sort(
          (a, b) => parseFloat(b.marketCap) - parseFloat(a.marketCap)
        );
        break;
      case "trending":
      case "gainers":
        filtered = filtered.sort((a, b) => {
          // Parse change values (removing % and converting to numbers)
          const changeA = parseFloat(a.change.replace("%", ""));
          const changeB = parseFloat(b.change.replace("%", ""));
          return changeB - changeA;
        });
        break;
      case "visited":
        filtered = filtered.sort(
          (a, b) => parseFloat(b.volume) - parseFloat(a.volume)
        );
        break;
    }

    return filtered;
  }, [
    activeFilter,
    selectedChain,
    favorites,
    watchlistOnly,
    coins,
    searchTerm,
  ]);

  const totalPages = Math.ceil(filteredCoins.length / itemsPerPage);

  const getCurrentPageItems = () => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredCoins.slice(start, end);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, selectedChain, watchlistOnly, favorites]);

  const handleCoinClick = (coinAddress: string) => {
    router.push(`/coins/${coinAddress}`);
  };

  return (
    <section className="w-full py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <div className="flex flex-col items-center justify-between gap-4 mb-6 md:flex-row">
          <MarketFilters
            chains={chains}
            filterOptions={filterOptions}
            selectedChain={selectedChain}
            activeFilter={activeFilter}
            onChainSelect={setSelectedChain}
            onFilterSelect={setActiveFilter}
          />

          <div className="relative w-full md:w-auto md:min-w-[300px]">
            <Search
              className="absolute text-gray-500 transform -translate-y-1/2 left-3 top-1/2"
              size={16}
            />
            <Input
              type="text"
              placeholder="Search tokens by name or symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pr-4 pl-9"
            />
          </div>
        </div>

        {/* Table section */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-4 text-left"></th>
                <th className="px-4 py-4 text-left">#</th>
                <th className="px-4 py-4 text-left">Name</th>
                <th className="px-4 py-4 text-right">Price</th>
                <th className="px-4 py-4 text-right">24h %</th>
                <th className="px-4 py-4 text-right">Market Cap</th>
                <th className="px-4 py-4 text-right">Volume(24h)</th>
                <th className="px-4 py-4 text-right"># Holders</th>
                <th className="px-4 py-4 text-right">Last 7 Days</th>
              </tr>
            </thead>
            <tbody>
              {getCurrentPageItems().length > 0 ? (
                getCurrentPageItems().map((coin, index) => (
                  <tr
                    key={coin.address}
                    className="transition-colors duration-200 border-b border-gray-800 cursor-pointer hover:bg-gray-900/50 hover:shadow-lg"
                    onClick={() => handleCoinClick(coin.address)}
                  >
                    <td className="px-4 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavoriteToggle(coin.address);
                        }}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            favorites.includes(coin.address)
                              ? "text-yellow-500 fill-yellow-500"
                              : ""
                          }`}
                        />
                      </Button>
                    </td>
                    <td className="px-4 py-4 text-gray-400">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0 w-8 h-8 overflow-hidden rounded-full">
                          <img
                            src={coin.image}
                            alt={`${coin.name} logo`}
                            className="object-contain w-full h-full"
                            onError={(e) => {
                              // Fallback if image fails to load
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/32x32?text=?";
                            }}
                          />
                        </div>
                        <div>
                          <span className="font-semibold">{coin.name}</span>
                          <span className="block text-sm text-gray-400">
                            {coin.symbol}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">${coin.price}</td>
                    <td
                      className={`text-right py-4 px-4 ${
                        !coin.change.startsWith("-")
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {!coin.change.startsWith("-") ? (
                        <ArrowUp className="inline w-4 h-4" />
                      ) : (
                        <ArrowDown className="inline w-4 h-4" />
                      )}
                      {coin.change}
                    </td>
                    <td className="px-4 py-4 text-right">
                      ${parseFloat(coin.marketCap).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span>${parseFloat(coin.volume).toLocaleString()}</span>
                        <span className="text-sm text-gray-400">
                          {(coin.volume_24h / coin.price).toLocaleString(
                            undefined,
                            { maximumFractionDigits: 2 }
                          )}
                          {" " + coin.symbol}
                          {coin.transactions} transactions
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {coin.holders} holders
                    </td>
                    <td className="px-4 py-4">
                      <SparklineChart
                        data={coin.sparklineData}
                        color={
                          !coin.change.startsWith("-") ? "#22c55e" : "#ef4444"
                        }
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-gray-400">
                    {watchlistOnly ? (
                      <div className="flex flex-col items-center gap-2">
                        <Star className="w-8 h-8 mb-2" />
                        <p className="text-lg font-medium">
                          Your watchlist is empty
                        </p>
                        <p>Star some coins to add them to your watchlist</p>
                      </div>
                    ) : (
                      "No coins match your filters"
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredCoins.length > 0 && (
          <div className="flex justify-center mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </motion.div>
    </section>
  );
}
