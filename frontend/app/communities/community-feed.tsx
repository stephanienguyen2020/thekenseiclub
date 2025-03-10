"use client"

import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2, Target, Coins } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { FeedItem } from "./types"

interface CommunityFeedProps {
  items: FeedItem[]
}

export function CommunityFeed({ items }: CommunityFeedProps) {
  // Simple function to format date
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="p-6 border-white/10 bg-black">
            {/* Author Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={item.author.avatar} />
                  <AvatarFallback>{item.author.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <Link href="#" className="font-semibold hover:text-sky-400 transition-colors">
                      {item.author.name}
                    </Link>
                    {item.type === "bets" && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        <Target className="mr-1 h-3 w-3" />
                        Created a Bet
                      </Badge>
                    )}
                    {item.type === "coins" && (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                        <Coins className="mr-1 h-3 w-3" />
                        Launched Token
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(item.timestamp)}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <p className="text-sm text-gray-200">{item.content}</p>

              {/* Image if exists */}
              {item.image && (
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image src={item.image || "/placeholder.svg"} alt="Post image" fill className="object-cover" />
                </div>
              )}

              {/* Bet or Token Card if exists */}
              {(item.type === "bets" || item.type === "coins") && item.linkedItem && (
                <Link
                  href="#"
                  className="block p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item.linkedItem.image && (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.linkedItem.image || "/placeholder.svg"}
                          alt="Item image"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-sky-400">{item.linkedItem.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.linkedItem.description}</p>
                    </div>
                  </div>
                </Link>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 pt-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-sky-400">
                  <Heart className="mr-1 h-4 w-4" />
                  {item.likes}
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-sky-400">
                  <MessageCircle className="mr-1 h-4 w-4" />
                  {item.comments}
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-sky-400">
                  <Share2 className="mr-1 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

