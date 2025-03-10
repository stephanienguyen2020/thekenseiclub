"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Trophy,
  XCircle,
  ArrowRight,
  Wallet,
  Target,
} from "lucide-react";
import Link from "next/link";

const betStats = {
  activeBets: 3,
  totalBets: 42,
  wonBets: 28,
  lostBets: 11,
  totalWinnings: "$12,450",
  winRate: "66.7%",
  totalStaked: "$25,890",
  avgReturn: "48.2%",
  bestWin: "$5,400",
  activeValue: "$2,800",
};

export function BetsSection() {
  return (
    <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            My{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-[#00ff00]">
              Bets
            </span>
          </h2>
          <Link href="/bets">
            <Button variant="outline" className="border-white/10">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-[#00ff00]" />
              <span className="text-gray-400">Active</span>
            </div>
            <p className="text-2xl font-bold">{betStats.activeBets}</p>
            <p className="text-sm text-gray-400 mt-1">
              Value: {betStats.activeValue}
            </p>
          </div>
          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-green-400" />
              <span className="text-gray-400">Won</span>
            </div>
            <p className="text-2xl font-bold">{betStats.wonBets}</p>
            <p className="text-sm text-gray-400 mt-1">
              of {betStats.totalBets} total
            </p>
          </div>
          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-5 w-5 text-red-400" />
              <span className="text-gray-400">Lost</span>
            </div>
            <p className="text-2xl font-bold">{betStats.lostBets}</p>
            <p className="text-sm text-gray-400 mt-1">
              Rate:{" "}
              {(100 - Number.parseFloat(betStats.winRate.slice(0, -1))).toFixed(
                1
              )}
              %
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-5 w-5 text-yellow-400" />
              <span className="text-gray-400">Total Staked</span>
            </div>
            <p className="text-xl font-bold">{betStats.totalStaked}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-purple-400" />
              <span className="text-gray-400">Best Win</span>
            </div>
            <p className="text-xl font-bold">{betStats.bestWin}</p>
          </div>
        </div>

        <div className="flex justify-between items-center p-4 bg-black/40 rounded-lg border border-white/10">
          <div>
            <p className="text-sm text-gray-400">Total Winnings</p>
            <p className="text-xl font-bold text-green-400">
              {betStats.totalWinnings}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Avg Return</p>
            <p className="text-xl font-bold text-blue-400">
              {betStats.avgReturn}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Win Rate</p>
            <p className="text-xl font-bold text-blue-400">
              {betStats.winRate}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
