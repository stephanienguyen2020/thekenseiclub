"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Share2,
  Twitter,
  CheckCircle2,
  XCircle,
  Trophy,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Flame,
  BarChart3,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { TimeLeft } from "./time-left";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Bet {
  id: string;
  title: string;
  image: string;
  endDate: string;
  totalPool: number;
  yesPool: number;
  noPool: number;
  yesProbability: number;
  noProbability: number;
  isResolved?: boolean;
  result?: "yes" | "no";
  rank?: number;
}

// Define bet phases
type BetPhase = "early" | "middle" | "late" | "final" | "ended";

export function BetCard({ bet }: { bet: Bet }) {
  // Create a local state to track if the bet has ended
  const [hasEnded, setHasEnded] = useState(false);
  const [betPhase, setBetPhase] = useState<BetPhase>("early");
  const [timeProgress, setTimeProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [formattedTimeWithSeconds, setFormattedTimeWithSeconds] =
    useState<string>("");

  // Check if the bet has ended based on endDate and calculate time progress
  useEffect(() => {
    const calculateTimeAndPhase = () => {
      const now = new Date();
      const end = new Date(bet.endDate);
      const isEnded = now >= end;
      setHasEnded(isEnded);

      // Calculate time progress
      const endTime = end.getTime();
      const nowTime = now.getTime();
      const start = endTime - 7 * 24 * 60 * 60 * 1000; // Assuming 7 days duration

      // Calculate time left for countdown
      if (!isEnded) {
        const diff = endTime - nowTime;
        const totalSeconds = Math.floor(diff / 1000);
        setSecondsLeft(totalSeconds);

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // Format with seconds for the prominent timer
        if (days > 0) {
          setFormattedTimeWithSeconds(
            `${days}d ${hours}h ${minutes}m ${seconds}s`
          );
        } else if (hours > 0) {
          setFormattedTimeWithSeconds(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setFormattedTimeWithSeconds(`${minutes}m ${seconds}s`);
        }

        // Format without seconds for other displays
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${minutes}m`);
        }
      } else {
        setTimeLeft("Ended");
        setFormattedTimeWithSeconds("Ended");
        setSecondsLeft(0);
      }

      let progress = 0;

      if (nowTime >= endTime) {
        progress = 100;
        setBetPhase("ended");
      } else if (nowTime <= start) {
        progress = 0;
        setBetPhase("early");
      } else {
        const totalDuration = endTime - start;
        const elapsed = nowTime - start;
        progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

        // Determine bet phase based on progress
        if (progress < 25) {
          setBetPhase("early");
        } else if (progress < 50) {
          setBetPhase("middle");
        } else if (progress < 75) {
          setBetPhase("late");
        } else {
          setBetPhase("final");
        }
      }

      setTimeProgress(progress);
    };

    // Calculate immediately
    calculateTimeAndPhase();

    // Then check every second instead of every minute
    const interval = setInterval(calculateTimeAndPhase, 1000);

    return () => clearInterval(interval);
  }, [bet.endDate]);

  // If the bet has ended but is not marked as resolved, we should treat it as ended
  const isEffectivelyResolved = bet.isResolved || hasEnded;

  const formattedDate = new Date(bet.endDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Calculate payout multiplier for winning side
  const winningPayout =
    bet.result === "yes"
      ? (bet.totalPool / bet.yesPool).toFixed(2)
      : (bet.totalPool / bet.noPool).toFixed(2);

  // Get phase display information
  const getPhaseInfo = () => {
    switch (betPhase) {
      case "early":
        return {
          label: "Early Phase",
          color: "text-blue-400",
          icon: <Clock className="h-3 w-3 mr-1" />,
        };
      case "middle":
        return {
          label: "Middle Phase",
          color: "text-green-400",
          icon: <TrendingUp className="h-3 w-3 mr-1" />,
        };
      case "late":
        return {
          label: "Late Phase",
          color: "text-yellow-400",
          icon: <TrendingUp className="h-3 w-3 mr-1" />,
        };
      case "final":
        return {
          label: "Final Hours",
          color: "text-red-400",
          icon: <Flame className="h-3 w-3 mr-1" />,
        };
      case "ended":
        return {
          label: "Ended",
          color: "text-gray-400",
          icon: <Clock className="h-3 w-3 mr-1" />,
        };
      default:
        return {
          label: "Active",
          color: "text-green-400",
          icon: <Clock className="h-3 w-3 mr-1" />,
        };
    }
  };

  const phaseInfo = getPhaseInfo();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group h-full overflow-visible"
    >
      <Card className="overflow-visible border-white/10 bg-black/80 flex flex-col h-full relative">
        {/* Time Progress Bar */}
        {!isEffectivelyResolved && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-10">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-[#00ff00]"
              style={{ width: `${timeProgress}%` }}
            />
          </div>
        )}

        {/* Top Rank Badge */}
        {bet.rank !== undefined && bet.rank < 3 && (
          <div className="absolute -top-5 -left-3 z-30">
            <div
              className={cn(
                "font-bold text-3xl px-0 py-0 flex items-center justify-center transform -rotate-12",
                bet.rank === 0
                  ? "text-yellow-300"
                  : bet.rank === 1
                  ? "text-gray-300"
                  : "text-amber-500"
              )}
            >
              <span
                className="font-extrabold tracking-wider"
                style={{ textShadow: "3px 3px 5px rgba(0,0,0,0.8)" }}
              >
                TOP{bet.rank + 1}
              </span>
            </div>
          </div>
        )}

        {/* Image */}
        <div className="relative h-48 flex-shrink-0">
          <Image
            src={
              bet.image && bet.image.startsWith("http")
                ? bet.image
                : "/placeholder.svg"
            }
            alt={bet.title}
            fill
            className="object-cover"
            onError={(e) => {
              console.error(`Error loading image for bet ${bet.id}:`, e);
              // Set fallback image
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

          {/* Countdown Timer Badge - Prominent version */}
          {!isEffectivelyResolved && secondsLeft > 0 && (
            <div className="absolute -top-4 -right-4 z-30">
              <div
                className={cn(
                  "px-5 py-2 rounded-full shadow-lg flex items-center justify-center",
                  "bg-blue-500/20 backdrop-blur-sm  text-blue-400"
                )}
              >
                <span className="font-bold text-white text-sm whitespace-nowrap">
                  {formattedTimeWithSeconds}
                </span>
              </div>
            </div>
          )}

          {isEffectivelyResolved ? (
            <div className="absolute top-4 right-4">
              <Badge
                variant="outline"
                className={cn(
                  "backdrop-blur-sm border-white/10",
                  bet.result === "yes"
                    ? "bg-blue-500/20 text-blue-500"
                    : hasEnded && !bet.result
                    ? "bg-yellow-500/20 text-yellow-500"
                    : "bg-red-500/20 text-red-500"
                )}
              >
                {hasEnded && !bet.isResolved ? "Ended" : "Resolved"}
              </Badge>
            </div>
          ) : null}

          {/* Stats Badges */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className="bg-black/80 backdrop-blur-sm border-white/10 text-white flex items-center"
              >
                <Users className="h-3 w-3 mr-1" />
                {Math.floor(bet.totalPool / 100)} users
              </Badge>
            </div>

            {!isEffectivelyResolved &&
              bet.yesProbability > bet.noProbability && (
                <Badge
                  variant="outline"
                  className="bg-black/80 backdrop-blur-sm border-white/10 text-white flex items-center"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Yes trending
                </Badge>
              )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-white mb-4 h-14 line-clamp-2 overflow-hidden">
            {bet.title}
          </h3>

          <div className="space-y-4 flex-grow flex flex-col justify-between">
            {/* Pool Distribution */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span
                  className={cn(
                    "flex items-center gap-1",
                    isEffectivelyResolved
                      ? bet.result === "yes"
                        ? "text-green-400 font-medium"
                        : "text-gray-400"
                      : "text-green-400"
                  )}
                >
                  Yes {(bet.yesProbability * 100).toFixed(0)}%
                  {isEffectivelyResolved && bet.result === "yes" && (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1",
                    isEffectivelyResolved
                      ? bet.result === "no"
                        ? "text-red-400 font-medium"
                        : "text-gray-400"
                      : "text-red-400"
                  )}
                >
                  {isEffectivelyResolved && bet.result === "no" && (
                    <XCircle className="h-4 w-4" />
                  )}
                  No {(bet.noProbability * 100).toFixed(0)}%
                </span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0",
                    isEffectivelyResolved
                      ? "bg-white/20"
                      : "bg-gradient-to-r from-green-400 to-[#00ff00]"
                  )}
                  style={{ width: `${bet.yesProbability * 100}%` }}
                />
              </div>
            </div>

            {/* Time and Pool Info */}
            <div className="mt-4 p-3 rounded-lg border border-white/10 bg-black/40">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-400">
                  {isEffectivelyResolved ? "Ended" : "Ends"}
                </div>
                <div className="text-sm font-medium">{formattedDate}</div>
              </div>

              {!isEffectivelyResolved && (
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BarChart3 className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="text-sm">Volume</span>
                    </div>
                    <div className="text-sm font-medium">
                      ${bet.totalPool.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`text-xs flex items-center ${phaseInfo.color}`}
                    >
                      {phaseInfo.icon}
                      {phaseInfo.label}
                    </div>
                    <div className="text-xs text-gray-400">
                      {bet.yesPool + bet.noPool} participants
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions or Results */}
            <div className="mt-4">
              {isEffectivelyResolved ? (
                <div className="space-y-3">
                  {/* Result Banner */}
                  {bet.result ? (
                    <div
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border",
                        bet.result === "yes"
                          ? "bg-green-500/10 border-green-500/20 text-green-500"
                          : "bg-red-500/10 border-red-500/20 text-red-500"
                      )}
                    >
                      <Trophy className="h-5 w-5" />
                      <div className="flex-1">
                        <span className="font-medium">
                          {bet.result === "yes" ? "Yes" : "No"} was correct
                        </span>
                        <div className="text-sm opacity-90">
                          {bet.result === "yes"
                            ? `${(bet.yesProbability * 100).toFixed(
                                0
                              )}% predicted correctly`
                            : `${(bet.noProbability * 100).toFixed(
                                0
                              )}% predicted correctly`}
                          {" • "}
                          {Number(winningPayout)}x payout
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 text-yellow-500">
                      <Clock className="h-5 w-5" />
                      <div className="flex-1">
                        <span className="font-medium">Bet has ended</span>
                        <div className="text-sm opacity-90">
                          Waiting for resolution
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Share Results */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-white/10 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-white/10 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-white/10 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-2">
                  <Link
                    href={`/bets/place-bet?id=${bet.id}`}
                    className="flex-1"
                  >
                    <Button className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:opacity-90 text-black font-medium">
                      Place Bet
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-white/10 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-white/10 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
