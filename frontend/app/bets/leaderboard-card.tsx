"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"

interface LeaderboardEntry {
  address: string
  amount: number
  rank: number
}

interface LeaderboardCardProps {
  title: string
  entries: LeaderboardEntry[]
}

export function LeaderboardCard({ title, entries }: LeaderboardCardProps) {
  return (
    <Card className="border-white/10 bg-black">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.address} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    entry.rank === 1
                      ? "bg-yellow-500/20 text-yellow-500"
                      : entry.rank === 2
                        ? "bg-gray-500/20 text-gray-400"
                        : entry.rank === 3
                          ? "bg-orange-500/20 text-orange-500"
                          : "bg-white/5 text-gray-400"
                  }`}
                >
                  {entry.rank}
                </div>
                <span className="font-mono text-sm text-gray-400">{entry.address}</span>
              </div>
              <span className="font-mono text-sm font-medium">${entry.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

