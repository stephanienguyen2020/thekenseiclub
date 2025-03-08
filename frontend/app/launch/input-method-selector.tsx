"use client"

import { Bot, Edit, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type InputMethod = "ai-joke" | "ai-tweet" | "manual"

interface InputMethodSelectorProps {
  selected: InputMethod
  onSelect: (method: InputMethod) => void
}

export function InputMethodSelector({ selected, onSelect }: InputMethodSelectorProps) {
  const methods = [
    {
      id: "ai-joke" as const,
      icon: Bot,
      title: "AI Generator",
      description: "Enter a joke or meme idea",
    },
    {
      id: "ai-tweet" as const,
      icon: Twitter,
      title: "From Tweet",
      description: "Use a tweet as inspiration",
    },
    {
      id: "manual" as const,
      icon: Edit,
      title: "Manual Entry",
      description: "Enter details yourself",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {methods.map((method) => (
        <Button
          key={method.id}
          variant="outline"
          className={cn(
            "h-auto flex flex-col items-center gap-2 p-6 hover:border-primary/50 hover:bg-primary/5",
            selected === method.id && "border-primary/50 bg-primary/5",
          )}
          onClick={() => onSelect(method.id)}
        >
          <method.icon className="h-8 w-8" />
          <div className="text-center">
            <h3 className="font-semibold">{method.title}</h3>
            <p className="text-sm text-muted-foreground">{method.description}</p>
          </div>
        </Button>
      ))}
    </div>
  )
}

