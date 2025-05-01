"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageSquare,
  Repeat,
  MoreHorizontal,
  Clock,
  Eye,
  Bookmark,
  Share2,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

interface PostCardProps {
  post: {
    id: string;
    user: {
      id: string;
      name: string;
      handle: string;
      avatar: string;
    };
    token?: {
      id: string;
      name: string;
      symbol: string;
      logo: string;
    };
    content: string;
    image?: string;
    timestamp: string;
    likes: number;
    boosts: number;
    comments: number;
    signalScore: number;
    isLiked?: boolean;
    isBoosted?: boolean;
    views?: number;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBoosted, setIsBoosted] = useState(post.isBoosted || false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [boosts, setBoosts] = useState(post.boosts);
  const views = post.views || Math.floor(Math.random() * 10000) + 1000;

  useEffect(() => {
    const fetchIsLiked = async () => {
      const rs = await api.get("/posts/isLiked", {
        params: {
          postId: post.id,
          userId: post.user.id,
        },
      });
      setIsLiked(rs.data.isLiked);
    };
    fetchIsLiked();
  });

  const handleLike = () => {
    const likePost = async () => {
      await api.post("/likes", {
        postId: post.id,
        userId: post.user.id,
        isLike: !isLiked,
      });

      setLikes(isLiked ? likes - 1 : likes + 1);
      setIsLiked(!isLiked);
    };
    likePost();
  };

  const handleBoost = () => {
    if (isBoosted) {
      setBoosts(boosts - 1);
    } else {
      setBoosts(boosts + 1);
    }
    setIsBoosted(!isBoosted);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <motion.div
      className="bg-white rounded-3xl p-6 mb-4 border-2 border-black"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between">
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-black">
            <Image
              src={post.user.avatar || "/placeholder.svg"}
              alt={post.user.name}
              width={48}
              height={48}
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold">{post.user.name}</h3>
              <span className="text-gray-500 text-sm">@{post.user.handle}</span>
              <span className="text-gray-400 text-sm flex items-center gap-1">
                <Clock size={12} />
                {post.timestamp}
              </span>
            </div>
            {post.token && (
              <Link
                href={`/marketplace/${post.token.id?.toLowerCase() || ""}`}
                className="inline-flex items-center gap-1 bg-[#0046F4] text-white px-2 py-0.5 rounded-full text-xs mt-1"
              >
                <div className="w-3 h-3 rounded-full overflow-hidden">
                  <Image
                    src={post.token.logo || "/placeholder.svg"}
                    alt={post.token.name}
                    width={12}
                    height={12}
                  />
                </div>
                ${post.token.symbol}
              </Link>
            )}
          </div>
        </div>
        <button className="text-gray-500 hover:bg-gray-100 rounded-full p-1">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="mt-3">
        <p className="whitespace-pre-wrap">{post.content}</p>
        {post.image && (
          <div className="mt-3 rounded-2xl overflow-hidden border-2 border-black">
            <Image
              src={post.image || "/placeholder.svg"}
              alt="Post image"
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
              isLiked ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
            }`}
            onClick={handleLike}
          >
            <Heart
              size={18}
              className={isLiked ? "fill-blue-600 text-blue-600" : ""}
            />
            <span>{likes}</span>
          </button>
          <button
            className={`flex items-center gap-1 px-3 py-1 rounded-full ${
              isBoosted ? "bg-green-100 text-green-600" : "hover:bg-gray-100"
            }`}
            onClick={handleBoost}
          >
            <Repeat
              size={18}
              className={isBoosted ? "fill-green-600 text-green-600" : ""}
            />
            <span>{boosts}</span>
          </button>
          <Link
            href={`/post/${post.id}`}
            className="flex items-center gap-1 px-3 py-1 rounded-full hover:bg-gray-100"
          >
            <MessageSquare size={18} />
            <span>{post.comments}</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <Eye size={16} />
            <span>{views.toLocaleString()}</span>
          </div>

          <button
            className={`text-gray-500 hover:bg-gray-100 rounded-full p-1 ${
              isBookmarked ? "text-blue-600" : ""
            }`}
            onClick={handleBookmark}
          >
            <Bookmark
              size={18}
              className={isBookmarked ? "fill-blue-600" : ""}
            />
          </button>

          <button className="text-gray-500 hover:bg-gray-100 rounded-full p-1">
            <Share2 size={18} />
          </button>

          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#c0ff00] text-black font-medium border border-black">
            <span>Signal: {post.signalScore}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
