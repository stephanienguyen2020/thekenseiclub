"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Bot, User } from "lucide-react"

interface ChatMessageProps {
  text: string
  isBot: boolean
  timestamp?: string
  avatar?: string
  name?: string
}

export function ChatMessage({ text, isBot, timestamp, avatar, name }: ChatMessageProps) {
  // Split long messages into paragraphs
  const paragraphs = text.split("\n").filter((p) => p.trim())

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex w-full gap-3 px-4", isBot ? "justify-start" : "justify-end")}
    >
      {isBot && (
        <Avatar>
          <AvatarImage src={avatar} />
          <AvatarFallback>
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div className="flex flex-col gap-1">
        {name && (
          <span className="text-sm text-muted-foreground">
            {name} • {timestamp || "Just now"}
          </span>
        )}
        <div
          className={cn(
            "relative max-w-[80%] space-y-2 rounded-2xl px-4 py-3",
            isBot ? "bg-muted text-foreground" : "bg-gradient-to-r from-blue-600 to-blue-700 text-primary-foreground",
          )}
        >
          {paragraphs.map((paragraph, idx) => (
            <p key={idx} className="text-sm leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
      {!isBot && (
        <Avatar>
          <AvatarImage src={avatar} />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  )
}

