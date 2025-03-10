"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AppLayout } from "../components/app-layout";
import { Input } from "@/components/ui/input";
import { Search, Rocket, Loader2, AlertCircle, Wallet } from "lucide-react";
import { LeaderboardCard } from "./leaderboard-card";
import { BetFilters } from "./bet-filters";
import { BetSection } from "./bet-section";
import { PastBetsSlider } from "./past-bets-slider";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useBettingService } from "@/services/BettingService";
import { ethers } from "ethers";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useWalletClient } from "wagmi";
import { Bet } from "./types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Our internal type for blockchain data
interface BlockchainBet {
  id: number;
  title: string;
  description: string;
  category: string;
  createdBy: string;
  endDate: Date;
  endDateFormatted: string;
  isActive: boolean;
  status: string;
  poolAmount: string;
  joinAmount: string;
  participants: number;
  imageUrl: string;
  votesYes: number;
  votesNo: number;
  outcome: boolean;
  resolved: boolean;
}

export default function BetsPage() {
  // Page state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeCurrentPage, setActiveCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<"all" | "120min" | "12hours">(
    "all"
  );

  // Bets data state
  const [bets, setBets] = useState<Bet[]>([]);
  const [activeBets, setActiveBets] = useState<Bet[]>([]);
  const [pastBets, setPastBets] = useState<Bet[]>([]);
  const [totalVolume, setTotalVolume] = useState("0.000");

  // Check wallet connection
  const { data: walletClient } = useWalletClient();
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  // Services and utilities
  const bettingService = useBettingService();
  const { toast } = useToast();

  // Track if data has been fetched to prevent refetching
  const dataFetched = useRef(false);

  // Update wallet connection status and trigger fetch
  useEffect(() => {
    const isConnected = !!walletClient;
    setIsWalletConnected(isConnected);

    if (isConnected) {
      // Reset dataFetched when wallet connects
      dataFetched.current = false;
      handleRefresh();
    }
  }, [walletClient]);

  // Fetch bets data when wallet is connected
  useEffect(() => {
    if (!isWalletConnected || dataFetched.current) return;

    async function fetchBets() {
      try {
        setLoading(true);
        dataFetched.current = true;

        const allBets = await bettingService.getAllBets();

        if (!allBets || allBets.length === 0) {
          setBets([]);
          setActiveBets([]);
          setPastBets([]);
          setTotalVolume("0.000");
          setLoading(false);
          return;
        }

        // Process bets data
        const processedBets = allBets
          .map((bet, index) => {
            if (!bet) return null;

            try {
              // Format values with safety checks
              const joinAmount = bet.amount
                ? ethers.formatEther(bet.amount.toString())
                : "0";

              const poolAmount = bet.initialPoolAmount
                ? ethers.formatEther(bet.initialPoolAmount.toString())
                : "0";

              // Calculate dates and status
              const currentDate = new Date();
              const endDateTimestamp = bet.endDate
                ? Number(bet.endDate) * 1000
                : currentDate.getTime() + 30 * 24 * 60 * 60 * 1000;

              const endDate = new Date(endDateTimestamp);
              const isActive = currentDate < endDate && !bet.isClosed;

              // Return formatted bet
              return {
                id: Number(bet.id || index),
                title: bet.title || `Bet #${bet.id || index}`,
                description: bet.description || "No description provided",
                category: bet.category || "Uncategorized",
                createdBy: bet.creator || "Unknown",
                endDate: endDate,
                endDateFormatted: endDate.toLocaleString(),
                isActive: isActive,
                status: isActive ? "active" : "closed",
                poolAmount: poolAmount || "0",
                joinAmount: joinAmount || "0",
                participants:
                  (Number(bet.supportCount) || 0) +
                  (Number(bet.againstCount) || 0),
                imageUrl: bet.imageURL || "/placeholder.svg",
                votesYes: Number(bet.supportCount) || 0,
                votesNo: Number(bet.againstCount) || 0,
                outcome: Boolean(bet.outcome),
                resolved: Boolean(bet.isClosed),
              };
            } catch (error) {
              console.warn(`Error formatting bet at index ${index}:`, error);
              return null;
            }
          })
          .filter(Boolean) as BlockchainBet[];

        // Convert to UI format
        const formattedBets = processedBets.map((bet) => ({
          id: String(bet.id),
          title: bet.title,
          image: bet.imageUrl,
          category: bet.category,
          endDate: bet.endDateFormatted,
          totalPool: parseFloat(bet.poolAmount),
          yesPool:
            parseFloat(bet.poolAmount) *
            (bet.votesYes / (bet.votesYes + bet.votesNo || 1)),
          noPool:
            parseFloat(bet.poolAmount) *
            (bet.votesNo / (bet.votesYes + bet.votesNo || 1)),
          yesProbability:
            (bet.votesYes / (bet.votesYes + bet.votesNo || 1)) * 100,
          noProbability:
            (bet.votesNo / (bet.votesYes + bet.votesNo || 1)) * 100,
          isResolved: bet.resolved,
          result: bet.resolved
            ? bet.outcome
              ? ("yes" as const)
              : ("no" as const)
            : undefined,
        }));

        // Update all state in a batch
        const active = formattedBets.filter((bet) => {
          // Check if the bet is not resolved and the end date is in the future
          const endDate = new Date(bet.endDate);
          const now = new Date();
          return !bet.isResolved && endDate > now;
        });

        const past = formattedBets.filter((bet) => {
          // A bet is considered past if it's either resolved or its end date has passed
          const endDate = new Date(bet.endDate);
          const now = new Date();
          return bet.isResolved || endDate <= now;
        });

        const volume = formattedBets.reduce(
          (acc, bet) => acc + bet.totalPool,
          0
        );

        // Set all state at once
        setBets(formattedBets);
        setActiveBets(active);
        setPastBets(past);
        setTotalVolume(volume.toFixed(3));
      } catch (error) {
        console.error("Error fetching bets:", error);
        toast({
          title: "Error fetching bets",
          description: "Failed to load bets from the blockchain.",
          variant: "destructive",
        });

        setBets([]);
        setActiveBets([]);
        setPastBets([]);
        setTotalVolume("0.000");
      } finally {
        setLoading(false);
      }
    }

    fetchBets();
  }, [bettingService, isWalletConnected, toast]);

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    dataFetched.current = false;
    setLoading(true);
  }, []);

  // Add a periodic check for ended bets
  useEffect(() => {
    // Function to check if any active bets have ended
    const checkForEndedBets = () => {
      const now = new Date();

      // Check if any active bets have ended
      const hasEndedBets = activeBets.some((bet) => {
        const endDate = new Date(bet.endDate);
        return endDate <= now;
      });

      // If we found ended bets, trigger a refresh
      if (hasEndedBets) {
        console.log("Found ended bets, refreshing...");
        handleRefresh();
      }
    };

    // Check every minute
    const interval = setInterval(checkForEndedBets, 60000);

    return () => clearInterval(interval);
  }, [activeBets]);

  // Reset pagination when filters change
  useEffect(() => {
    setActiveCurrentPage(1);
  }, [searchTerm, selectedCategory, timeFilter]);

  // Filter bets based on search term, category, and time filter
  const filteredActiveBets = activeBets.filter((bet) => {
    // First apply search and category filters
    const matchesSearchAndCategory =
      (bet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedCategory || bet.category === selectedCategory);

    // Then apply time filter if needed
    if (timeFilter === "all") {
      return matchesSearchAndCategory;
    }

    // Get the current time
    const now = new Date();
    const endDate = new Date(bet.endDate);

    // Calculate time difference in milliseconds
    const timeDiff = endDate.getTime() - now.getTime();

    // Convert to hours and minutes
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (timeFilter === "120min") {
      // Show bets ending within the next 120 minutes (2 hours)
      return matchesSearchAndCategory && hoursDiff <= 2;
    } else if (timeFilter === "12hours") {
      // Show bets ending within the next 12 hours
      return matchesSearchAndCategory && hoursDiff <= 12;
    }

    return matchesSearchAndCategory;
  });

  // Calculate counts for each time filter
  const betsIn120Min = activeBets.filter((bet) => {
    const now = new Date();
    const endDate = new Date(bet.endDate);
    const timeDiff = endDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return (
      hoursDiff <= 2 &&
      (bet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedCategory || bet.category === selectedCategory)
    );
  }).length;

  const betsIn12Hours = activeBets.filter((bet) => {
    const now = new Date();
    const endDate = new Date(bet.endDate);
    const timeDiff = endDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    return (
      hoursDiff <= 12 &&
      (bet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedCategory || bet.category === selectedCategory)
    );
  }).length;

  const filteredPastBets = pastBets.filter(
    (bet) =>
      (bet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedCategory || bet.category === selectedCategory)
  );

  return (
    <AppLayout showFooter={false}>
      <div className="py-8">
        <div className="container pt-2 pl-12 max-w-[1600px] mx-auto px-4">
          {/* Header */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                  Prediction Markets
                </h1>
                <p className="text-muted-foreground">
                  Place your bets and challenge others on future events
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/bets/create">
                  <Button className="bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-400/90 hover:to-blue-500/90">
                    <Rocket className="mr-2 h-4 w-4" />
                    Create Prediction
                  </Button>
                </Link>
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                  <div className="text-sm">
                    <span className="text-gray-400">Total Volume:</span>{" "}
                    <span className="font-mono font-medium text-white">
                      {totalVolume} S
                    </span>
                  </div>
                  <div className="w-px h-4 bg-white/10" />
                  <div className="text-sm">
                    <span className="text-gray-400">Active Bets:</span>{" "}
                    <span className="font-mono font-medium text-white">
                      {activeBets.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Warning - show when wallet is not connected */}
          {!isWalletConnected && !loading && (
            <div className="mb-8">
              <Alert
                variant="default"
                className="bg-yellow-500/10 border-yellow-500/20"
              >
                <Wallet className="h-5 w-5 text-yellow-500" />
                <AlertTitle>Wallet Not Connected</AlertTitle>
                <AlertDescription>
                  Connect your wallet to interact with bets on the blockchain
                  and see the latest data.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search bets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12"
              />
            </div>
            <BetFilters
              activeFilter="all"
              selectedCategory={selectedCategory}
              onFilterChange={() => {}}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Time Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Time Filter:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 rounded-full p-0 text-muted-foreground"
                    >
                      <span className="sr-only">Time filter info</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                      </svg>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>Filter active bets by their remaining time:</p>
                    <ul className="mt-2 list-disc list-inside text-xs">
                      <li>
                        <span className="font-medium">All:</span> Show all
                        active bets
                      </li>
                      <li>
                        <span className="font-medium">120 Minutes:</span> Show
                        bets ending within 2 hours
                      </li>
                      <li>
                        <span className="font-medium">12 Hours:</span> Show bets
                        ending within 12 hours
                      </li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={timeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFilter("all")}
                className={
                  timeFilter === "all"
                    ? "bg-gradient-to-r from-blue-400 to-[#00ff00] text-black font-medium"
                    : "border-white/10 hover:bg-blue-500/10 hover:text-blue-400"
                }
              >
                <span className="flex items-center gap-1">
                  All
                  <span className="inline-flex items-center justify-center ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-black/30">
                    {loading ? (
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      filteredActiveBets.length
                    )}
                  </span>
                </span>
              </Button>
              <Button
                variant={timeFilter === "120min" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFilter("120min")}
                className={
                  timeFilter === "120min"
                    ? "bg-gradient-to-r from-blue-400 to-blue-500 text-black font-medium"
                    : "border-white/10 hover:bg-blue-500/10 hover:text-blue-400"
                }
              >
                <span className="flex items-center gap-1">
                  120 Minutes
                  <span className="inline-flex items-center justify-center ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-black/30">
                    {loading ? (
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      betsIn120Min
                    )}
                  </span>
                  {timeFilter === "120min" && (
                    <span className="inline-flex items-center justify-center w-4 h-4 ml-1 bg-black/30 rounded-full">
                      <span className="w-2 h-2 bg-black rounded-full"></span>
                    </span>
                  )}
                </span>
              </Button>
              <Button
                variant={timeFilter === "12hours" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFilter("12hours")}
                className={
                  timeFilter === "12hours"
                    ? "bg-gradient-to-r from-blue-400 to-blue-500 text-black font-medium"
                    : "border-white/10 hover:bg-blue-500/10 hover:text-blue-400"
                }
              >
                <span className="flex items-center gap-1">
                  12 Hours
                  <span className="inline-flex items-center justify-center ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-black/30">
                    {loading ? (
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      betsIn12Hours
                    )}
                  </span>
                  {timeFilter === "12hours" && (
                    <span className="inline-flex items-center justify-center w-4 h-4 ml-1 bg-black/30 rounded-full">
                      <span className="w-2 h-2 bg-black rounded-full"></span>
                    </span>
                  )}
                </span>
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
              <p className="text-muted-foreground mb-6">
                Loading bets from the blockchain...
              </p>
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="border-white/10"
              >
                Refresh Data
              </Button>
            </div>
          )}

          {/* No Bets State */}
          {!loading && bets.length === 0 && (
            <div className="col-span-12 space-y-4">
              <Alert variant="default" className="bg-black/40 border-white/10">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                <AlertTitle>No Bets Found</AlertTitle>
                <AlertDescription>
                  {isWalletConnected
                    ? "There are currently no bets on the blockchain. Be the first to create one!"
                    : "Connect your wallet to see and interact with bets."}
                </AlertDescription>
              </Alert>

              <div className="text-center py-10">
                <Link href="/bets/create">
                  <Button className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-400/90 hover:to-blue-500/90">
                    <Rocket className="mr-2 h-4 w-4" />
                    Create a Bet
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Main Content */}
          {!loading && bets.length > 0 && (
            <div className="grid grid-cols-12 gap-6">
              {/* Bets Sections */}
              <div className="col-span-12 lg:col-span-9 space-y-12">
                {/* Active Bets */}
                {filteredActiveBets.length > 0 ? (
                  <BetSection
                    title={`Active Bets${
                      timeFilter !== "all"
                        ? timeFilter === "120min"
                          ? " (Next 2 Hours)"
                          : " (Next 12 Hours)"
                        : ""
                    }`}
                    bets={filteredActiveBets}
                    currentPage={activeCurrentPage}
                    onPageChange={setActiveCurrentPage}
                    itemsPerPage={6}
                    showViewAll={true}
                  />
                ) : (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">
                      {`Active Bets${
                        timeFilter !== "all"
                          ? timeFilter === "120min"
                            ? " (Next 2 Hours)"
                            : " (Next 12 Hours)"
                          : ""
                      }`}
                    </h2>
                    <div className="text-center py-10 border border-white/10 rounded-xl bg-black/20">
                      <p className="text-muted-foreground">
                        No active bets available
                        {timeFilter !== "all"
                          ? ` in the selected time range`
                          : ""}
                      </p>
                    </div>
                  </div>
                )}

                {/* Past Bets */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Past Bets</h2>
                    <Link
                      href="/bets/history"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      View All Past Bets
                    </Link>
                  </div>
                  {filteredPastBets.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-white/10">
                      <PastBetsSlider bets={filteredPastBets} />
                    </div>
                  ) : (
                    <div className="text-center py-10 border border-white/10 rounded-xl bg-black/20">
                      <p className="text-muted-foreground">
                        No past bets found
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Leaderboards */}
              <div className="col-span-12 lg:col-span-3 space-y-6">
                <LeaderboardCard
                  title="Top Bettors"
                  entries={[
                    { address: "0x1234...5678", amount: 1000, rank: 1 },
                    { address: "0x8765...4321", amount: 750, rank: 2 },
                    { address: "0x9876...5432", amount: 500, rank: 3 },
                    { address: "0x5432...1098", amount: 250, rank: 4 },
                    { address: "0x1098...7654", amount: 100, rank: 5 },
                  ]}
                />
                <LeaderboardCard
                  title="Recent Winners"
                  entries={[
                    { address: "0xabcd...efgh", amount: 2500, rank: 1 },
                    { address: "0xijkl...mnop", amount: 1500, rank: 2 },
                    { address: "0xqrst...uvwx", amount: 1000, rank: 3 },
                    { address: "0xyzab...cdef", amount: 750, rank: 4 },
                    { address: "0xghij...klmn", amount: 500, rank: 5 },
                  ]}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
