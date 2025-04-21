"use client"

import { useState } from "react"
import EnhancedPostInput from "@/components/enhanced-post-input"
import PostCard from "@/components/post-card"

interface TokenFeedProps {
  tokenId?: string
  tokenName?: string
  tokenSymbol?: string
  tokenLogo?: string
}

export default function TokenFeed({
  tokenId = "default",
  tokenName = "Unknown Token",
  tokenSymbol = "TOKEN",
  tokenLogo = "/placeholder.svg",
}: TokenFeedProps) {
  const [activeFilter, setActiveFilter] = useState("all")

  // Create preselected token object
  const preselectedToken = {
    id: tokenId,
    name: tokenName,
    symbol: tokenSymbol,
    logo: tokenLogo,
  }

  // Mock posts data specific to this token
  const posts = [
    {
      id: `${tokenId}-1`,
      user: {
        name: "Token Creator",
        handle: "creator.sui",
        avatar: "/pixel-cool-cat.png",
      },
      token: {
        name: tokenName,
        symbol: tokenSymbol,
        logo: tokenLogo,
      },
      content: `Important announcement for all ${tokenSymbol} holders! We're launching a new feature next week that will revolutionize how we interact with the community.`,
      timestamp: "3h ago",
      likes: 156,
      boosts: 48,
      comments: 23,
      signalScore: 210,
      views: 28500,
    },
    {
      id: `${tokenId}-2`,
      user: {
        name: "Whale Holder",
        handle: "whale.sui",
        avatar: "/stylized-shiba-inu.png",
      },
      token: {
        name: tokenName,
        symbol: tokenSymbol,
        logo: tokenLogo,
      },
      content: `Just increased my ${tokenSymbol} position by another 5%! Who's with me? 💎🙌`,
      image: "/crypto-growth-abstract.png",
      timestamp: "1d ago",
      likes: 89,
      boosts: 32,
      comments: 17,
      signalScore: 145,
      views: 15200,
    },
    {
      id: `${tokenId}-3`,
      user: {
        name: "Meme Creator",
        handle: "memegod.sui",
        avatar: "/playful-calico.png",
      },
      token: {
        name: tokenName,
        symbol: tokenSymbol,
        logo: tokenLogo,
      },
      content: `Made this meme for all my ${tokenSymbol} fam! RT if you're still holding!`,
      image: "/hodl-through-anything.png",
      timestamp: "2d ago",
      likes: 67,
      boosts: 29,
      comments: 12,
      signalScore: 98,
      views: 9800,
    },
  ]

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          className={`px-4 py-2 rounded-full font-medium border-2 border-black ${
            activeFilter === "all" ? "bg-[#c0ff00] text-black" : "bg-white text-black"
          }`}
          onClick={() => setActiveFilter("all")}
        >
          All Posts
        </button>
        <button
          className={`px-4 py-2 rounded-full font-medium border-2 border-black ${
            activeFilter === "trending" ? "bg-[#c0ff00] text-black" : "bg-white text-black"
          }`}
          onClick={() => setActiveFilter("trending")}
        >
          Trending
        </button>
      </div>

      {/* Enhanced Post Input pre-configured for this token */}
      <EnhancedPostInput preselectedToken={preselectedToken} />

      {/* Posts Feed */}
      <div>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}
