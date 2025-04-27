"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import EnhancedPostInput from "@/components/enhanced-post-input";
import PostCard from "@/components/post-card";

export default function FeedPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  // Mock posts data
  const posts = [
    {
      id: "1",
      user: {
        name: "Crypto Chad",
        handle: "chad.sui",
        avatar: "/pixel-cool-cat.png",
      },
      token: {
        name: "Pepe",
        symbol: "PEPE",
        logo: "/happy-frog-on-a-lilypad.png",
      },
      content:
        "Just bought more $PEPE! This meme coin is going to the moon! 🚀🚀🚀",
      timestamp: "2h ago",
      likes: 42,
      boosts: 12,
      comments: 5,
      signalScore: 89,
      isLiked: true,
      views: 8700,
    },
    {
      id: "2",
      user: {
        name: "Doge Lover",
        handle: "dogelover.sui",
        avatar: "/stylized-shiba-inu.png",
      },
      token: {
        name: "Doge",
        symbol: "DOGE",
        logo: "/stylized-shiba-inu.png",
      },
      content:
        "Who else thinks $DOGE is the original and best meme coin? Been holding since 2013! 💎🙌",
      image: "/Shiba-Inu-Meme.png",
      timestamp: "5h ago",
      likes: 128,
      boosts: 37,
      comments: 14,
      signalScore: 156,
      views: 24500,
    },
    {
      id: "3",
      user: {
        name: "Meme Master",
        handle: "mememaster.sui",
        avatar: "/playful-calico.png",
      },
      token: {
        name: "Cat Coin",
        symbol: "CAT",
        logo: "/playful-calico.png",
      },
      content:
        "Just created a proposal for $CAT to fund community meme contests! Go vote now and let's make this happen! 🐱\n\nVoting ends in 48 hours.",
      timestamp: "1d ago",
      likes: 76,
      boosts: 23,
      comments: 8,
      signalScore: 112,
      views: 15300,
    },
    {
      id: "4",
      user: {
        name: "Wojak",
        handle: "wojak.sui",
        avatar: "/Distressed-Figure.png",
      },
      content: "tfw you buy the top and sell the bottom 😭",
      image: "/plummeting-crypto.png",
      timestamp: "2d ago",
      likes: 210,
      boosts: 45,
      comments: 32,
      signalScore: 178,
      views: 32100,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0039C6]">
      <div className="max-w-7xl mx-auto px-4 py-8">
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
