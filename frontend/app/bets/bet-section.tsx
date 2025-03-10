"use client";

import { motion } from "framer-motion";
import { BetCard } from "./bet-card";
import type { Bet } from "./types";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BetSectionProps {
  title: string;
  bets: Bet[];
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  showViewAll?: boolean;
}

export function BetSection({
  title,
  bets,
  currentPage,
  onPageChange,
  itemsPerPage = 6,
  showViewAll = false,
}: BetSectionProps) {
  // Log when bets change
  useEffect(() => {
    console.log(`BetSection "${title}" received ${bets.length} bets`);
  }, [bets, title]);

  // Add ranks to bets based on total pool value
  const rankedBets = useMemo(() => {
    // Sort bets by total pool value in descending order and consider other factors
    const sortedBets = [...bets].sort((a, b) => {
      // Primary sort by total pool value
      const poolDiff = b.totalPool - a.totalPool;

      if (poolDiff !== 0) return poolDiff;

      // Secondary sort by activity (yes/no votes ratio)
      const aActivity = a.yesPool + a.noPool;
      const bActivity = b.yesPool + b.noPool;

      if (bActivity !== aActivity) return bActivity - aActivity;

      // Tertiary sort by end date (more recent end dates first)
      return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
    });

    // Add rank property to each bet
    return sortedBets.map((bet, index) => ({
      ...bet,
      rank: index,
    }));
  }, [bets]);

  const totalPages = Math.ceil(rankedBets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBets = rankedBets.slice(startIndex, endIndex);
  const totalBets = rankedBets.length;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <span className="text-sm text-muted-foreground">
            {totalBets} total
          </span>
        </div>
        {showViewAll && (
          <Link
            href={`/bets/all?filter=${title.toLowerCase()}`}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            View All {title}
          </Link>
        )}
      </div>

      {currentBets.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 auto-rows-fr">
            {currentBets.map((bet) => {
              // Log each bet to help with debugging
              console.log(`Rendering bet: ${bet.id} - ${bet.title}`);
              try {
                return (
                  <motion.div
                    key={bet.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="h-full"
                  >
                    <BetCard bet={bet} />
                  </motion.div>
                );
              } catch (error) {
                console.error(`Error rendering bet ${bet.id}:`, error);
                return (
                  <div
                    key={bet.id}
                    className="border border-red-500 rounded-md p-4"
                  >
                    <p>Error rendering bet</p>
                    <p className="text-xs text-red-400">{String(error)}</p>
                  </div>
                );
              }
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                Showing {startIndex + 1}-
                {Math.min(startIndex + itemsPerPage, totalBets)} of {totalBets}{" "}
                bets
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) onPageChange(currentPage - 1);
                      }}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show first page, last page, and pages around current page
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              onPageChange(page);
                            }}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    // Show ellipsis for breaks in page numbers
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages)
                          onPageChange(currentPage + 1);
                      }}
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
        </>
      ) : (
        <div className="border border-white/10 rounded-xl bg-black/20 p-10 text-center">
          <p className="text-muted-foreground">
            No {title.toLowerCase()} available
          </p>
        </div>
      )}
    </section>
  );
}
