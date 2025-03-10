"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Filter,
  TrendingUp,
  TrendingDown,
  Dices,
  Award,
  BarChart,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout } from "../../components/app-layout";
import { BetCard } from "../../bets/bet-card";
import { BetFilters } from "../../bets/bet-filters";
import { useBettingService } from "@/services/BettingService";
import { useAccount } from "wagmi";
import { ethers } from "ethers";

// Interface for bet data from smart contract
interface ContractBet {
  id: number;
  creator: string;
  amount: bigint;
  title: string;
  description: string;
  category: string;
  twitterHandle: string;
  endDate: bigint;
  initialPoolAmount: bigint;
  imageURL: string;
  isClosed: boolean;
  supportCount: number;
  againstCount: number;
  outcome: boolean;
}

// Interface for bet card display
interface DisplayBet {
  id: string;
  title: string;
  image: string;
  category: string;
  endDate: string;
  totalPool: number;
  yesPool: number;
  noPool: number;
  yesProbability: number;
  noProbability: number;
  isResolved?: boolean;
  result?: "yes" | "no";
}

export default function MyBetsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "resolved"
  >("all");
  const [showFilters, setShowFilters] = useState(false);
  const [bets, setBets] = useState<ContractBet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const bettingService = useBettingService();
  const { address, isConnected } = useAccount();

  // Add state for mounted status
  const [isMounted, setIsMounted] = useState(false);

  // Add a function to refresh the bets data
  const refreshBets = async () => {
    try {
      setIsLoading(true);
      const allBets = await bettingService.getAllBets();
      setBets(allBets);
    } catch (error) {
      console.error("Error refreshing bets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update useEffect to handle mounting and fetch bets
  useEffect(() => {
    let mounted = true;

    const fetchBets = async () => {
      try {
        if (!isConnected) {
          router.push("/bets");
          return;
        }

        setIsLoading(true);
        const allBets = await bettingService.getAllBets();

        if (mounted) {
          setBets(allBets);
          setIsLoading(false);
          setIsMounted(true);
        }
      } catch (error) {
        console.error("Error fetching bets:", error);
        if (mounted) {
          setIsLoading(false);
          setIsMounted(true);
        }
      }
    };

    fetchBets();

    return () => {
      mounted = false;
    };
  }, [isConnected, router]); // Remove bettingService from dependencies

  // Filter bets based on user's involvement
  const myBets = bets.filter(
    (bet) =>
      bet.creator.toLowerCase() === address?.toLowerCase() ||
      bet.twitterHandle.toLowerCase() === address?.toLowerCase()
  );

  // Filter active bets - must not be closed and end date must be in the future
  const activeBets = myBets.filter((bet) => {
    const endDate = new Date(Number(bet.endDate) * 1000);
    const now = new Date();
    return !bet.isClosed && endDate > now;
  });

  // Filter past bets - either closed or end date has passed
  const pastBets = myBets.filter((bet) => {
    const endDate = new Date(Number(bet.endDate) * 1000);
    const now = new Date();
    return bet.isClosed || endDate <= now;
  });

  // Add a periodic check for ended bets - moved after activeBets declaration
  useEffect(() => {
    if (!isMounted) return;

    // Function to check if any active bets have ended
    const checkForEndedBets = () => {
      const now = new Date();

      // Check if any active bets have ended
      const hasEndedBets = activeBets.some((bet) => {
        const endDate = new Date(Number(bet.endDate) * 1000);
        return endDate <= now;
      });

      // If we found ended bets, trigger a refresh
      if (hasEndedBets) {
        console.log("Found ended bets in MyBetsPage, refreshing...");
        refreshBets();
      }
    };

    // Check every minute
    const interval = setInterval(checkForEndedBets, 60000);

    return () => clearInterval(interval);
  }, [activeBets, isMounted, bettingService]);

  // Calculate statistics
  const totalBets = myBets.length;
  const wonBets = pastBets.filter((bet) => bet.outcome).length;
  const lostBets = pastBets.filter((bet) => !bet.outcome).length;
  const pendingBets = activeBets.length;
  const winRate = totalBets > 0 ? Math.round((wonBets / totalBets) * 100) : 0;

  // Calculate total profit/loss with proper BigInt handling
  const totalProfit = pastBets.reduce((acc, bet) => {
    const amount = Number(ethers.formatEther(BigInt(bet.initialPoolAmount)));
    return acc + (bet.outcome ? amount : -amount);
  }, 0);

  // Filter bets based on search term and category
  const filteredActiveBets = activeBets.filter(
    (bet) =>
      (bet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedCategory || bet.category === selectedCategory)
  );

  const filteredPastBets = pastBets.filter(
    (bet) =>
      (bet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bet.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!selectedCategory || bet.category === selectedCategory)
  );

  // Return loading state until component is mounted
  if (!isMounted) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
          <div className="container py-8">
            <div className="flex items-center justify-center h-[60vh]">
              <div className="space-y-4 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-green-400 mx-auto" />
                <p className="text-muted-foreground">Loading your bets...</p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Update the convertToDisplayBet function to handle dates consistently
  const convertToDisplayBet = (bet: ContractBet): DisplayBet => {
    const totalParticipants =
      Number(bet.supportCount) + Number(bet.againstCount);
    const yesProbability =
      totalParticipants > 0
        ? Number(bet.supportCount) / totalParticipants
        : 0.5;
    const noProbability =
      totalParticipants > 0
        ? Number(bet.againstCount) / totalParticipants
        : 0.5;

    // Format the date in UTC to ensure consistency
    const date = new Date(Number(bet.endDate) * 1000);
    const endDateISO = date.toISOString();

    // Ensure initialPoolAmount is treated as BigInt
    const poolAmount = BigInt(bet.initialPoolAmount.toString());

    return {
      id: bet.id.toString(),
      title: bet.title,
      image: bet.imageURL,
      category: bet.category,
      endDate: endDateISO,
      totalPool: Number(ethers.formatEther(poolAmount)),
      yesPool: Number(bet.supportCount),
      noPool: Number(bet.againstCount),
      yesProbability: yesProbability * 100,
      noProbability: noProbability * 100,
      isResolved: bet.isClosed,
      result: bet.isClosed ? (bet.outcome ? "yes" : "no") : undefined,
    };
  };

  if (!isConnected) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
          <div className="container py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-lg mx-auto mt-20 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-8 rounded-xl shadow-xl"
            >
              <h2 className="text-2xl font-bold mb-4">
                Authentication Required
              </h2>
              <p className="text-lg">
                You need to be signed in to view your bets. Redirecting to the
                bets page...
              </p>
            </motion.div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
        <div className="container py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header section */}
            <div className="relative mb-12 pb-6 border-b border-white/10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    My{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                      Bets
                    </span>
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Track and manage your prediction market portfolio
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search markets..."
                      className="pl-10 w-full sm:w-[300px] bg-white/5 border-white/10 focus:border-green-500/50 transition-colors"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowFilters(!showFilters)}
                      className={`border-white/10 hover:border-green-500/50 transition-colors ${
                        showFilters ? "bg-green-500/10 border-green-500/50" : ""
                      }`}
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 transition-colors"
                      asChild
                    >
                      <Link href="/bets/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Create a Bet
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Bets Card */}
                <Card className="bg-white/5 border-white/10 hover:border-green-500/50 transition-all hover:transform hover:scale-[1.02] cursor-pointer">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Dices className="h-4 w-4 text-green-400" />
                      Total Markets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold">{totalBets}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">
                          {pendingBets} active
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-500/10 text-gray-400">
                          {pastBets.length} completed
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Win Rate Card */}
                <Card className="bg-white/5 border-white/10 hover:border-green-500/50 transition-all hover:transform hover:scale-[1.02] cursor-pointer">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Award className="h-4 w-4 text-green-400" />
                      Success Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold">{winRate}%</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-500/10 text-green-400">
                          {wonBets} won
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-500/10 text-red-400">
                          {lostBets} lost
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Profit Card */}
                <Card className="bg-white/5 border-white/10 hover:border-green-500/50 transition-all hover:transform hover:scale-[1.02] cursor-pointer">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      {totalProfit >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                      Total Profit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div
                        className={`text-3xl font-bold ${
                          totalProfit >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {totalProfit > 0 ? "+" : ""}
                        {totalProfit.toFixed(4)} ETH
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Lifetime profit/loss
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Pool Size Card */}
                <Card className="bg-white/5 border-white/10 hover:border-green-500/50 transition-all hover:transform hover:scale-[1.02] cursor-pointer">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <BarChart className="h-4 w-4 text-green-400" />
                      Active Pool Size
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold">
                        {ethers.formatEther(
                          activeBets.reduce(
                            (acc, bet) =>
                              acc + BigInt(bet.initialPoolAmount.toString()),
                            BigInt(0)
                          )
                        )}{" "}
                        ETH
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Total active pool size
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="pt-6">
                    <BetFilters
                      activeFilter={activeFilter}
                      selectedCategory={selectedCategory}
                      onFilterChange={setActiveFilter}
                      onCategoryChange={setSelectedCategory}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Tabs */}
            <div className="bg-white/5 rounded-xl p-6">
              <Tabs defaultValue="active" className="mb-8">
                <TabsList className="bg-white/5 p-1">
                  <TabsTrigger
                    value="active"
                    className="data-[state=active]:bg-blue-500"
                  >
                    Active Markets
                  </TabsTrigger>
                  <TabsTrigger
                    value="past"
                    className="data-[state=active]:bg-red-500"
                  >
                    Past Markets
                  </TabsTrigger>
                  <TabsTrigger
                    value="created"
                    className="data-[state=active]:bg-green-500"
                  >
                    Created by Me
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-green-400" />
                    </div>
                  ) : filteredActiveBets.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredActiveBets.map((bet) => (
                        <BetCard key={bet.id} bet={convertToDisplayBet(bet)} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Dices className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-medium mb-2">
                        No active markets found
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        You don't have any active markets matching your search
                        criteria.
                      </p>
                      <Button asChild>
                        <Link href="/bets">Browse Markets</Link>
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="past" className="mt-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-green-400" />
                    </div>
                  ) : filteredPastBets.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredPastBets.map((bet) => (
                        <BetCard key={bet.id} bet={convertToDisplayBet(bet)} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Dices className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-medium mb-2">
                        No past markets found
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        You don't have any past markets matching your search
                        criteria.
                      </p>
                      <Button asChild>
                        <Link href="/bets">Browse Markets</Link>
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="created" className="mt-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-green-400" />
                    </div>
                  ) : myBets.filter(
                      (bet) =>
                        bet.creator.toLowerCase() === address?.toLowerCase()
                    ).length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {myBets
                        .filter(
                          (bet) =>
                            bet.creator.toLowerCase() === address?.toLowerCase()
                        )
                        .map((bet) => (
                          <BetCard
                            key={bet.id}
                            bet={convertToDisplayBet(bet)}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Dices className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-medium mb-2">
                        No created markets yet
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        You haven't created any bets yet.
                      </p>
                      <Button asChild>
                        <Link href="/bets/create">
                          <Plus className="h-4 w-4 mr-2" />
                          Create a Bet
                        </Link>
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
