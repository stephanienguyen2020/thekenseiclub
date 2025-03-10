"use client"

import { Button } from "@/components/ui/button"
import { MessageSquare, Coins, Target, Filter } from "lucide-react"

interface CommunityFiltersProps {
  activeFilter: "all" | "bets" | "coins" | "discussions"
  onFilterChange: (filter: "all" | "bets" | "coins" | "discussions") => void
}

export function CommunityFilters({ activeFilter, onFilterChange }: CommunityFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={activeFilter === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("all")}
        className="border-white/10"
      >
        <Filter className="mr-2 h-4 w-4" />
        All Activity
      </Button>
      <Button
        variant={activeFilter === "discussions" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("discussions")}
        className="border-white/10"
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        Discussions
      </Button>
      <Button
        variant={activeFilter === "bets" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("bets")}
        className="border-white/10"
      >
        <Target className="mr-2 h-4 w-4" />
        New Bets
      </Button>
      <Button
        variant={activeFilter === "coins" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("coins")}
        className="border-white/10"
      >
        <Coins className="mr-2 h-4 w-4" />
        New Coins
      </Button>
    </div>
  )
}

