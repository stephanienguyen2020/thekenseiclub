"use client";

import { motion } from "framer-motion";
import { AppLayout } from "../components/app-layout";
import { MemeCoinMarketCap } from "../components/MemeCoinMarketCap";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export default function WatchlistPage() {
  return (
    <AppLayout showFooter={false}>
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
        <div className="container max-w-7xl mx-auto px-4 py-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 pb-6 border-b border-white/10"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="w-fit bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1"
                >
                  <Star className="h-3.5 w-3.5 mr-1.5" />
                  Favorites
                </Badge>
              </div>
              <h1 className="text-4xl font-bold">
                Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500">
                  Watchlist
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Track your favorite tokens and stay updated on their
                performance. Add tokens to your watchlist to monitor them
                closely.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/5 rounded-xl border border-white/10 p-6 overflow-hidden"
          >
            <MemeCoinMarketCap watchlistOnly={true} />
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
