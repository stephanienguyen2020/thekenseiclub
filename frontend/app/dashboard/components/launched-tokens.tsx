"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, TrendingUp, Users, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";

const tokenStats = {
  totalLaunched: 12,
  trending: 3,
  totalHolders: "25.4K",
  totalVolume: "$1.2M",
};

const chainDistribution = [
  { chain: "ETH", percentage: 45 },
  { chain: "BSC", percentage: 30 },
  { chain: "SOL", percentage: 25 },
];

export function LaunchedTokens() {
  return (
    <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Launched{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-[#00ff00]">
              Tokens
            </span>
          </h2>
          <Link href="/launch">
            <Button variant="outline" className="border-white/10">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="h-5 w-5 text-blue-400" />
              <span className="text-gray-400">Total Launched</span>
            </div>
            <p className="text-2xl font-bold">{tokenStats.totalLaunched}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <span className="text-gray-400">Trending</span>
            </div>
            <p className="text-2xl font-bold">{tokenStats.trending}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-purple-400" />
              <span className="text-gray-400">Total Holders</span>
            </div>
            <p className="text-2xl font-bold">{tokenStats.totalHolders}</p>
          </div>
          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-5 w-5 text-yellow-400" />
              <span className="text-gray-400">Total Volume</span>
            </div>
            <p className="text-2xl font-bold">{tokenStats.totalVolume}</p>
          </div>
        </div>

        <div className="mt-2">
          <p className="text-sm text-gray-400 mb-3">Chain Distribution</p>
          <div className="flex gap-2">
            {chainDistribution.map((chain) => (
              <div
                key={chain.chain}
                className="flex-1 bg-black/40 rounded-lg p-2 text-center border border-white/10"
              >
                <p className="text-sm font-medium">{chain.chain}</p>
                <p className="text-lg font-bold text-blue-400">
                  {chain.percentage}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
