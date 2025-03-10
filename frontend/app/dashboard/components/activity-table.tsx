"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Activity {
  id: string
  type: "prediction" | "trade" | "shill" | "system"
  user: {
    name: string
    avatar: string
  }
  action: string
  target: string
  amount?: string
  status: "success" | "pending" | "failed"
  timestamp: string
}

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "prediction",
    user: {
      name: "Alex",
      avatar: "/placeholder.svg",
    },
    action: "Created prediction",
    target: "Will BTC reach $100k by Q2 2025?",
    amount: "$5,000",
    status: "success",
    timestamp: "2 min ago",
  },
  {
    id: "2",
    type: "trade",
    user: {
      name: "Sarah",
      avatar: "/placeholder.svg",
    },
    action: "Bought",
    target: "PEPE",
    amount: "$1,200",
    status: "success",
    timestamp: "5 min ago",
  },
  {
    id: "3",
    type: "shill",
    user: {
      name: "Mike",
      avatar: "/placeholder.svg",
    },
    action: "Started auto-shill",
    target: "DOGE",
    status: "pending",
    timestamp: "15 min ago",
  },
  {
    id: "4",
    type: "system",
    user: {
      name: "System",
      avatar: "/placeholder.svg",
    },
    action: "Resolved prediction",
    target: "Will ETH 2.0 launch in March?",
    status: "success",
    timestamp: "30 min ago",
  },
]

interface ActivityTableProps {
  searchQuery: string
}

export function ActivityTable({ searchQuery }: ActivityTableProps) {
  const [activities] = useState<Activity[]>(mockActivities)

  const filteredActivities = activities.filter(
    (activity) =>
      activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.target.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
      <div className="p-6">
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 rounded-lg bg-black/40 border border-white/5"
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={activity.user.avatar} />
                  <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{activity.user.name}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{activity.action}</span>
                    <Badge
                      variant="outline"
                      className={
                        activity.status === "success"
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : activity.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                      }
                    >
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.target}
                    {activity.amount && <span className="ml-2 font-medium text-white">{activity.amount}</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{activity.timestamp}</span>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

