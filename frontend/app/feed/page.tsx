"use client";

import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/navbar";
import EnhancedPostInput from "@/components/enhanced-post-input";
import PostCard from "@/components/post-card";
import api from "@/lib/api";
import { TRIBE_OPTIONS } from "@/lib/tribes";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function FeedPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedTribe, setSelectedTribe] = useState<string>("all");
  const [isTribeDropdownOpen, setIsTribeDropdownOpen] = useState(false);

  const tribeDropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tribeDropdownRef.current &&
        !tribeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTribeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchPost = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedTribe !== "all") {
        params.append("tribe", selectedTribe);
      }

      const url = `/posts${params.toString() ? `?${params.toString()}` : ""}`;
      console.log("Fetching posts with URL:", url);
      const res = await api.get(url);
      console.log("Posts fetched:", res.data.data);
      setPosts(res.data.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    console.log("useEffect triggered with selectedTribe:", selectedTribe);
    fetchPost();
  }, [selectedTribe]);

  const handleTribeSelect = (tribeValue: string) => {
    console.log("Tribe selected:", tribeValue);
    setSelectedTribe(tribeValue);
    setIsTribeDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0039C6]">
      <Navbar isAuthenticated={true} />
      <div className="max-w-8xl mx-auto px-12 py-8 pt-24">
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

            {/* Tribe Filter Dropdown */}
            <div className="relative flex-shrink-0" ref={tribeDropdownRef}>
              <button
                onClick={() => {
                  console.log(
                    "Dropdown clicked, current state:",
                    isTribeDropdownOpen
                  );
                  setIsTribeDropdownOpen(!isTribeDropdownOpen);
                }}
                className="px-4 py-2 rounded-full font-medium border-2 border-black bg-white text-black hover:bg-gray-100 flex items-center gap-2 transition-all whitespace-nowrap"
              >
                <span className="text-lg">
                  {
                    TRIBE_OPTIONS.find(
                      (option) => option.value === selectedTribe
                    )?.emoji
                  }
                </span>
                <span>
                  {
                    TRIBE_OPTIONS.find(
                      (option) => option.value === selectedTribe
                    )?.label
                  }
                </span>
                <ChevronDown
                  size={16}
                  className={`transform transition-transform ${
                    isTribeDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isTribeDropdownOpen && (
                <div
                  className="fixed bg-white border-2 border-black rounded-xl shadow-lg z-[9999] overflow-hidden min-w-[200px]"
                  style={{
                    top: tribeDropdownRef.current?.getBoundingClientRect()
                      .bottom
                      ? tribeDropdownRef.current.getBoundingClientRect()
                          .bottom +
                        window.scrollY +
                        8
                      : "auto",
                    left: tribeDropdownRef.current?.getBoundingClientRect().left
                      ? tribeDropdownRef.current.getBoundingClientRect().left +
                        window.scrollX
                      : "auto",
                  }}
                >
                  {TRIBE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleTribeSelect(option.value)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                        selectedTribe === option.value ? "bg-gray-100" : ""
                      }`}
                    >
                      <span className="text-lg">{option.emoji}</span>
                      <span className="font-medium">{option.label}</span>
                      {selectedTribe === option.value && (
                        <ChevronRight size={16} className="ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
