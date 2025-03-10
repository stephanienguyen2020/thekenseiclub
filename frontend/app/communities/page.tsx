"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "../components/app-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Image, BarChart } from "lucide-react";
import { CommunityFilters } from "./community-filters";
import { CommunityFeed } from "./community-feed";
import { useAccount } from "wagmi";

export default function CommunitiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "bets" | "coins" | "discussions"
  >("all");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Use wagmi account hook
  const { isConnected } = useAccount();

  // Check authentication status
  useEffect(() => {
    const savedAuth = localStorage.getItem("isAuthenticated");
    setIsAuthenticated(savedAuth === "true" || isConnected);
  }, [isConnected]);

  return (
    <AppLayout showFooter={false}>
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container py-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-[#00ff00]">
                  Communities
                </span>
              </h1>
              <p className="text-muted-foreground mt-2">
                Connect with other traders and share insights
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search communities..."
                className="pl-8 w-[200px] md:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Post Creation Card */}
          {isAuthenticated ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 backdrop-blur-sm rounded-xl p-4 mb-8 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-[#00ff00]" />
                <Input
                  placeholder="Share your thoughts with the community..."
                  className="bg-transparent border-white/10"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    <BarChart className="h-4 w-4 mr-2" />
                    Poll
                  </Button>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-blue-500/10 border border-blue-500/20 text-blue-500 p-3 rounded-md mb-6"
            >
              Please sign in to create posts and interact with the community
            </motion.div>
          )}

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-3">
              <CommunityFilters
                activeFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
              />
            </div>
            <div className="col-span-12 md:col-span-9">
              <CommunityFeed items={[]} />
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
