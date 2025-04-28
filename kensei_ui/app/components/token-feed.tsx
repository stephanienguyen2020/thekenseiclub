"use client"

import {useEffect, useState} from "react"
import EnhancedPostInput from "@/components/enhanced-post-input"
import PostCard from "@/components/post-card"
import api from "@/lib/api";

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
  const [posts, setPosts] = useState<any[]>([]);

  const preselectedToken = {
    id: tokenId,
    name: tokenName,
    symbol: tokenSymbol,
    logo: tokenLogo,
  }

  useEffect(() => {
    const fetchPost = async () => {
      const res = await api.get("/posts", {
        params: {
          coinId: tokenId,
        }
      });
      setPosts(res.data.data);
      console.log(res.data);
    }
    fetchPost();
  }, [])

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
