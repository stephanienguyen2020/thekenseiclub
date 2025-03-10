"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Send, Repeat2, History, Download } from "lucide-react"

export function QuickActions() {
  const actions = [
    {
      label: "Add Asset",
      icon: Plus,
      variant: "default" as const,
    },
    {
      label: "Send",
      icon: Send,
      variant: "outline" as const,
    },
    {
      label: "Swap",
      icon: Repeat2,
      variant: "outline" as const,
    },
    {
      label: "History",
      icon: History,
      variant: "outline" as const,
    },
    {
      label: "Export",
      icon: Download,
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

