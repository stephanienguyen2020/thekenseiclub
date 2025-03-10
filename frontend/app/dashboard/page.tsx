"use client";

import { motion } from "framer-motion";
import { AppLayout } from "../components/app-layout";
import { PortfolioOverview } from "./portfolio/components/portfolio-overview";
import { PortfolioChart } from "./portfolio/components/portfolio-chart";
import { PortfolioAnalytics } from "./portfolio/components/portfolio-analytics";
import { BetsSection } from "./components/bets-section";
import { LaunchedTokens } from "./components/launched-tokens";
import { MemeNews } from "./components/meme-news";
import { AboutMemes } from "./components/about-memes";
import { useAccount } from "wagmi";
import { useWallet } from "../providers/WalletProvider";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "lucide-react";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { isAuthenticated } = useWallet();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  return (
    <AppLayout>
      <div className="px-4 pr-[390px] max-w-full overflow-x-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 max-w-5xl mx-auto mt-6">
          <h1 className="text-3xl md:text-4xl font-bold">
            Portfolio{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
              Snapshot
            </span>
          </h1>

          {/* Connected Wallet Display */}
          {walletAddress && (
            <div className="flex items-center gap-2 mt-2 md:mt-0 p-3 rounded-md bg-blue-500/10 border border-blue-500/20">
              <Wallet className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Connected:</span>
              <span className="text-sm text-muted-foreground">
                {walletAddress.substring(0, 6)}...
                {walletAddress.substring(walletAddress.length - 4)}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4 max-w-5xl mx-auto">
          {/* Portfolio Overview */}
          <div className="mb-4">
            <PortfolioOverview />
          </div>

          {/* Main Content Grid - Adjusted for better responsiveness */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
            {/* Chart - Takes 8/12 width on large screens and has more height */}
            <div className="lg:col-span-8 bg-gray-900/50 rounded-xl border border-blue-500/10 overflow-hidden min-h-[500px]">
              <PortfolioChart />
            </div>

            {/* Analytics - Takes 4/12 width on large screens */}
            <div className="lg:col-span-4 bg-gray-900/50 rounded-xl border border-blue-500/10 overflow-hidden">
              <PortfolioAnalytics />
            </div>
          </div>

          {/* Bottom Grid - Responsive layout that stacks on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900/50 rounded-xl p-4 border border-blue-500/10 h-full">
              <BetsSection />
            </div>
            <div className="bg-gray-900/50 rounded-xl p-4 border border-blue-500/10 h-full">
              <LaunchedTokens />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Right Sidebar - Adjusted width */}
      <div className="fixed top-[64px] right-0 w-[370px] h-[calc(100vh-64px)] overflow-y-auto bg-gray-900/50 backdrop-blur-sm border-l border-blue-500/10">
        <div className="p-4 space-y-6">
          <MemeNews />
          <AboutMemes />
        </div>
      </div>
    </AppLayout>
  );
}
