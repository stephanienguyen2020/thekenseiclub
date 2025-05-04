"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Filter,
  Heart,
  MessageSquare,
  Repeat,
  Share2,
  Eye,
} from "lucide-react";
import EnhancedPostInput from "@/components/enhanced-post-input";
import api from "@/lib/api";
import { useCurrentAccount } from "@mysten/dapp-kit";

export default function TweetsPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const currentAccount = useCurrentAccount();
  const [tweets, setTweets] = useState<any[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      const res = await api.get("/posts", {
        params: { userId: currentAccount?.address },
      });
      setTweets(res.data.data);
    };
    fetchPost();
  }, [currentAccount]);

  // Filter tweets
  const filteredTweets = tweets.filter(
    (tweet) =>
      (filter === "all" ||
        (filter === "tokens" && tweet.token) ||
        (filter === "images" && tweet.image)) &&
      (tweet.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tweet.token &&
          tweet.token.symbol.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Stats
  const stats = {
    total: tweets.length,
    tokens: tweets.filter((t) => t.token).length,
    images: tweets.filter((t) => t.image).length,
    likes: tweets.reduce((sum, tweet) => sum + tweet.likes, 0),
    views: tweets.reduce((sum, tweet) => sum + tweet.views, 0),
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black text-white">My Tweets</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border-4 border-black">
          <div className="flex items-center gap-3">
            <div className="bg-[#c0ff00] p-3 rounded-xl border-2 border-black">
              <MessageSquare size={24} className="text-black" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">Total Tweets</div>
              <div className="text-2xl font-black">{stats.total}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border-4 border-black">
          <div className="flex items-center gap-3">
            <div className="bg-[#c0ff00] p-3 rounded-xl border-2 border-black">
              <Heart size={24} className="text-black" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">Total Likes</div>
              <div className="text-2xl font-black">{stats.likes}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border-4 border-black">
          <div className="flex items-center gap-3">
            <div className="bg-[#c0ff00] p-3 rounded-xl border-2 border-black">
              <Eye size={24} className="text-black" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">Total Views</div>
              <div className="text-2xl font-black">
                {stats.views.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border-4 border-black">
          <div className="flex items-center gap-3">
            <div className="bg-[#0046F4] p-3 rounded-xl border-2 border-black">
              <MessageSquare size={24} className="text-white" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">Token Tweets</div>
              <div className="text-2xl font-black">{stats.tokens}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border-4 border-black">
          <div className="flex items-center gap-3">
            <div className="bg-[#0046F4] p-3 rounded-xl border-2 border-black">
              <MessageSquare size={24} className="text-white" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">Image Tweets</div>
              <div className="text-2xl font-black">{stats.images}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Input */}
      <div className="mb-6">
        <EnhancedPostInput />
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-3xl p-6 mb-6 border-4 border-black">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search tweets..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#0039C6]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-xl flex items-center gap-1 border-2 border-black ${
                filter === "all" ? "bg-[#0039C6] text-white" : "bg-gray-100"
              }`}
              onClick={() => setFilter("all")}
            >
              <Filter size={16} />
              <span>All</span>
            </button>
            <button
              className={`px-4 py-2 rounded-xl flex items-center gap-1 border-2 border-black ${
                filter === "tokens" ? "bg-[#c0ff00] text-black" : "bg-gray-100"
              }`}
              onClick={() => setFilter("tokens")}
            >
              <span>Token Tweets</span>
            </button>
            <button
              className={`px-4 py-2 rounded-xl flex items-center gap-1 border-2 border-black ${
                filter === "images" ? "bg-[#0046F4] text-white" : "bg-gray-100"
              }`}
              onClick={() => setFilter("images")}
            >
              <span>With Images</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tweets List */}
      <div className="space-y-6">
        {filteredTweets.length > 0 ? (
          filteredTweets.map((tweet) => (
            <div
              key={tweet.id}
              className="bg-white rounded-3xl p-6 mb-4 border-4 border-black"
            >
              <div className="flex justify-between">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-black">
                    <Image
                      src="/pixel-cool-cat.png"
                      alt="Your avatar"
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">You</h3>
                      <span className="text-gray-500 text-sm">@you.sui</span>
                      <span className="text-gray-400 text-sm">
                        {tweet.timestamp}
                      </span>
                    </div>
                    {tweet.token && (
                      <Link
                        href={`/marketplace/${
                          tweet.token.symbol?.toLowerCase() || ""
                        }`}
                        className="inline-flex items-center gap-1 bg-[#0046F4] text-white px-2 py-0.5 rounded-full text-xs mt-1"
                      >
                        <div className="w-3 h-3 rounded-full overflow-hidden">
                          <Image
                            src={tweet.token.logo || "/placeholder.svg"}
                            alt={tweet.token.name}
                            width={12}
                            height={12}
                          />
                        </div>
                        ${tweet.token.symbol}
                      </Link>
                    )}
                  </div>
                </div>
                <button className="text-gray-500 hover:bg-gray-100 rounded-full p-1">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-3">
                <p className="whitespace-pre-wrap">{tweet.content}</p>
                {tweet.image && (
                  <div className="mt-3 rounded-2xl overflow-hidden border-2 border-black">
                    <Image
                      src={tweet.image || "/placeholder.svg"}
                      alt="Tweet image"
                      width={500}
                      height={300}
                      className="w-full object-cover max-h-[300px]"
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <button
                    className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                      tweet.isLiked
                        ? "bg-blue-100 text-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <Heart
                      size={18}
                      className={
                        tweet.isLiked ? "fill-blue-600 text-blue-600" : ""
                      }
                    />
                    <span>{tweet.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100">
                    <Repeat size={18} />
                    <span>{tweet.boosts}</span>
                  </button>
                  <Link
                    href={`/post/${tweet.id}`}
                    className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100"
                  >
                    <MessageSquare size={18} />
                    <span>{tweet.comments}</span>
                  </Link>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Eye size={16} />
                    <span>{tweet.views.toLocaleString()}</span>
                  </div>

                  <button className="text-gray-500 hover:bg-gray-100 rounded-full p-1">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-8 border-4 border-black text-center">
            <div className="text-gray-400 mb-4">
              <MessageSquare size={48} className="mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-bold mb-2">No tweets found</h3>
            <p className="text-gray-500 mb-6">
              {filter !== "all"
                ? `You don't have any ${
                    filter === "tokens" ? "token" : "image"
                  } tweets.`
                : "You haven't posted any tweets yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
