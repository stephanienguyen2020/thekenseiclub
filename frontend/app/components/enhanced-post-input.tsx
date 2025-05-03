"use client";

import React, { useEffect } from "react";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  ImageIcon,
  X,
  ChevronDown,
  Search,
  MapPin,
  Smile,
  Calendar,
  BarChart2,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useCurrentAccount } from "@mysten/dapp-kit";

interface Token {
  id: string;
  name: string;
  symbol: string;
  logo: string;
}

interface EnhancedPostInputProps {
  preselectedToken?: Token | null;
}

export default function EnhancedPostInput({
  preselectedToken = null,
}: EnhancedPostInputProps) {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(
    preselectedToken
  );
  const [tokenSearchQuery, setTokenSearchQuery] = useState("");
  const [tokens, settokens] = useState<Token[]>([]);
  const currentAccount = useCurrentAccount();

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAllTokens = async () => {
      const res = await api.get("/allCoins");
      settokens(res.data.data);
    };
    fetchAllTokens();
  }, []);

  const filteredTokens = tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(tokenSearchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(tokenSearchQuery.toLowerCase())
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show preview immediately for better UX
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload the file to the API
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "post");
        formData.append("userId", currentAccount?.address || "");

        const response = await api.post("/images", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (
          response.data &&
          response.data.image &&
          response.data.image.gatewayUrl
        ) {
          setUploadedImageUrl(response.data.image.gatewayUrl);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !selectedImage) return;

    try {
      // Use the uploaded image URL if available, otherwise empty array
      const mediaUrls = uploadedImageUrl ? [uploadedImageUrl] : [];

      // Prepare API payload
      const postData = {
        content,
        userId: currentAccount?.address,
        mediaUrls,
        coinId: selectedToken?.id,
      };

      // Send post to backend
      const response = await api.post("/posts", postData);

      // Reset form
      setContent("");
      setSelectedImage(null);
      setUploadedImageUrl(null);
      if (!preselectedToken) {
        setSelectedToken(null);
      }

      // You could add a success notification here
    } catch (error) {
      console.error("Failed to create post:", error);
      // You could add an error notification here
    }
  };

  return (
    <motion.div
      className="bg-white rounded-3xl p-6 mb-6 border-2 border-black"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-black">
          <Image
            src="/pixel-cool-cat.png"
            alt="Your avatar"
            width={48}
            height={48}
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <textarea
            placeholder="What's happening?"
            className="w-full border-none focus:ring-0 resize-none text-lg min-h-[80px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {selectedImage && (
            <div className="relative mt-2 rounded-2xl overflow-hidden border-2 border-black">
              <Image
                src={selectedImage || "/placeholder.svg"}
                alt="Selected image"
                width={500}
                height={300}
                className="w-full object-cover max-h-[300px]"
              />
              <button
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1"
                onClick={() => setSelectedImage(null)}
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-3">
              {/* Media upload */}
              <button
                className="text-[#0046F4] hover:bg-blue-50 rounded-full p-2"
                onClick={() => fileInputRef.current?.click()}
                title="Add media"
              >
                <ImageIcon size={20} />
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </button>

              {/* GIF */}
              <button
                className="text-[#0046F4] hover:bg-blue-50 rounded-full p-2"
                title="Add a GIF"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 11V15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 8H8.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11 11V15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 11H16C16.5304 11 17.0391 11.2107 17.4142 11.5858C17.7893 11.9609 18 12.4696 18 13C18 13.5304 17.7893 14.0391 17.4142 14.4142C17.0391 14.7893 16.5304 15 16 15H14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Location */}
              <button
                className="text-[#0046F4] hover:bg-blue-50 rounded-full p-2"
                title="Add location"
              >
                <MapPin size={20} />
              </button>

              {/* Emoji */}
              <button
                className="text-[#0046F4] hover:bg-blue-50 rounded-full p-2"
                title="Add emoji"
              >
                <Smile size={20} />
              </button>

              {/* Schedule */}
              <button
                className="text-[#0046F4] hover:bg-blue-50 rounded-full p-2"
                title="Schedule post"
              >
                <Calendar size={20} />
              </button>

              {/* AI Enhance */}
              <button
                className="text-[#0046F4] hover:bg-blue-50 rounded-full p-2"
                title="Enhance with AI"
              >
                <BarChart2 size={20} />
              </button>

              {/* Token tagging - only show if not in token-specific feed */}
              {!preselectedToken && (
                <div className="relative">
                  <button
                    className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                      selectedToken
                        ? "bg-[#0046F4] text-white"
                        : "border border-gray-300"
                    }`}
                    onClick={() => setIsTokenDropdownOpen(!isTokenDropdownOpen)}
                  >
                    {selectedToken ? (
                      <>
                        <div className="w-4 h-4 rounded-full overflow-hidden">
                          <Image
                            src={selectedToken.logo || "/placeholder.svg"}
                            alt={selectedToken.name}
                            width={16}
                            height={16}
                          />
                        </div>
                        <span>${selectedToken.symbol}</span>
                      </>
                    ) : (
                      <span>Tag a token</span>
                    )}
                    <ChevronDown size={14} />
                  </button>

                  {isTokenDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg p-2 z-10 min-w-[220px] border-2 border-black">
                      <div className="px-2 py-1 mb-2">
                        <div className="relative">
                          <Search
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={14}
                          />
                          <input
                            type="text"
                            placeholder="Search tokens..."
                            className="w-full pl-8 pr-2 py-1 text-sm rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0039C6]"
                            value={tokenSearchQuery}
                            onChange={(e) =>
                              setTokenSearchQuery(e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="max-h-[200px] overflow-y-auto">
                        {filteredTokens.length > 0 ? (
                          filteredTokens.map((token) => (
                            <button
                              key={token.id}
                              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-lg text-left"
                              onClick={() => {
                                setSelectedToken(token);
                                setIsTokenDropdownOpen(false);
                                setTokenSearchQuery("");
                              }}
                            >
                              <div className="w-5 h-5 rounded-full overflow-hidden">
                                <Image
                                  src={token.logo || "/placeholder.svg"}
                                  alt={token.name}
                                  width={20}
                                  height={20}
                                />
                              </div>
                              <span>{token.name}</span>
                              <span className="text-gray-500 text-sm">
                                ${token.symbol}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">
                            No tokens found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              className={`bg-[#c0ff00] text-black px-5 py-2 rounded-full font-medium border-2 border-black ${
                !content.trim() && !selectedImage
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-opacity-90"
              }`}
              disabled={!content.trim() && !selectedImage}
              onClick={handleSubmit}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
