"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Bot, LineChart, Settings } from "lucide-react"

export function QuickActions() {
  const actions = [
    {
      label: "New Prediction",
      icon: Plus,
      variant: "default" as const,
    },
    {
      label: "Auto Shill",
      icon: Bot,
      variant: "outline" as const,
    },
    {
      label: "Analytics",
      icon: LineChart,
      variant: "outline" as const,
    },
    {
      label: "Settings",
      icon: Settings,
      variant: "outline" as const,
    },
  ]

  return (
    <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-4">
          {actions.map((action) => (
            <Button key={action.label} variant={action.variant} className="gap-2">
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

