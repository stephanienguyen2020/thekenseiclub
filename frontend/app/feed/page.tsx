"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import EnhancedPostInput from "@/components/enhanced-post-input";
import PostCard from "@/components/post-card";
import api from "@/lib/api";

export default function FeedPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      const res = await api.get("/posts");
      setPosts(res.data.data);
    };
    fetchPost();
  }, []);

  return (
    <div className="min-h-screen bg-[#0039C6]">
      <div className="max-w-8xl mx-auto px-12 py-8">
        {/* Header with authenticated navbar */}
        <Navbar isAuthenticated={true} />

        <div className="mt-8">
          <h1 className="text-3xl font-black text-white mb-6">
            Community Feed
          </h1>

          {/* Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              className={`px-4 py-2 rounded-full font-medium border-2 border-black ${
                activeFilter === "all"
                  ? "bg-[#c0ff00] text-black"
                  : "bg-white text-black"
              }`}
              onClick={() => setActiveFilter("all")}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded-full font-medium border-2 border-black ${
                activeFilter === "trending"
                  ? "bg-[#c0ff00] text-black"
                  : "bg-white text-black"
              }`}
              onClick={() => setActiveFilter("trending")}
            >
              Trending
            </button>
            <button
              className={`px-4 py-2 rounded-full font-medium border-2 border-black ${
                activeFilter === "yourCoins"
                  ? "bg-[#c0ff00] text-black"
                  : "bg-white text-black"
              }`}
              onClick={() => setActiveFilter("yourCoins")}
            >
              Your Coins
            </button>
            <button
              className={`px-4 py-2 rounded-full font-medium border-2 border-black ${
                activeFilter === "following"
                  ? "bg-[#c0ff00] text-black"
                  : "bg-white text-black"
              }`}
              onClick={() => setActiveFilter("following")}
            >
              Following
            </button>
          </div>

          {/* Enhanced Post Input */}
          <EnhancedPostInput />

          {/* Posts Feed */}
          <div>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
