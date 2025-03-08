"use client";

import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BetFiltersProps {
  activeFilter: "all" | "active" | "resolved";
  selectedCategory: string | null;
  onFilterChange: (filter: "all" | "active" | "resolved") => void;
  onCategoryChange: (category: string | null) => void;
}

const categories = [
  "Crypto",
  "Politics",
  "Sports",
  "Entertainment",
  "Technology",
  "Finance",
];

export function BetFilters({
  activeFilter,
  selectedCategory,
  onFilterChange,
  onCategoryChange,
}: BetFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={activeFilter === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("all")}
        className="border-white/10"
      >
        <Filter className="mr-2 h-4 w-4" />
        All Bets
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="border-white/10">
            <Calendar className="mr-2 h-4 w-4" />
            {selectedCategory || "Categories"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onCategoryChange(null)}>
            All Categories
          </DropdownMenuItem>
          {categories.map((category) => (
            <DropdownMenuItem
              key={category}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
