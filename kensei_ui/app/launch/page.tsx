"use client";

import { useState, type ChangeEvent } from "react";
import Image from "next/image";
import { Upload, Sparkles } from "lucide-react";
import Navbar from "@/components/navbar";
import axios from "axios";
import api from "@/lib/api";
import { CoinResponse } from "@/app/launch/types";
import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";

type LaunchMethod = "auto" | "manual";

export default function LaunchTokenPage() {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const [launchMethod, setLaunchMethod] = useState<LaunchMethod>("auto");
  const [description, setDescription] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isCreatingToken, setIsCreatingToken] = useState(false);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = () => {
    setIsGeneratingImage(true);
    // Simulate AI image generation
    setTimeout(() => {
      setImagePreview("/blockchain-bulldog.png");
      setIsGeneratingImage(false);
    }, 1500);
  };

  const handleCreateToken = async () => {
    setIsCreatingToken(true);
    try {
      const { data: result }: { data: CoinResponse } = await api.post("/coin", {
        name: tokenName,
        symbol: tokenSymbol,
        description: tokenDescription,
        iconUrl: imagePreview,
        address: currentAccount?.address || "",
      });
      console.log("result: ", result);
      router.push(`/marketplace/${result.coin.id}`);
    } catch (error) {
      console.error("Error creating token:", error);
      setIsCreatingToken(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0039C6]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with authenticated navbar */}
        <Navbar isAuthenticated={!!currentAccount} />

        <div className="bg-white rounded-3xl p-8 mt-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Launch Your Token
          </h1>

          {/* Launch Method Selection */}
          <div className="flex gap-4 mb-8">
            <button
              className={`flex-1 py-4 rounded-xl border-2 ${
                launchMethod === "auto"
                  ? "border-[#0039C6] bg-[#0039C6] text-white"
                  : "border-gray-200 bg-white"
              }`}
              onClick={() => setLaunchMethod("auto")}
            >
              <div className="flex flex-col items-center gap-2">
                <Sparkles size={24} />
                <h3 className="font-bold">Auto Generated</h3>
                <p className="text-sm text-center px-4">
                  Just provide a description and we'll generate everything for
                  you
                </p>
              </div>
            </button>

            <button
              className={`flex-1 py-4 rounded-xl border-2 ${
                launchMethod === "manual"
                  ? "border-[#0039C6] bg-[#0039C6] text-white"
                  : "border-gray-200 bg-white"
              }`}
              onClick={() => setLaunchMethod("manual")}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload size={24} />
                <h3 className="font-bold">Manual Entry</h3>
                <p className="text-sm text-center px-4">
                  Customize every aspect of your token manually
                </p>
              </div>
            </button>
          </div>

          {/* Auto Generated Form */}
          {launchMethod === "auto" && (
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Describe your token in detail
                </label>
                <textarea
                  id="description"
                  rows={6}
                  className="w-full rounded-xl border-2 border-gray-200 p-4 focus:outline-none focus:ring-2 focus:ring-[#0039C6]"
                  placeholder="Example: A meme token based on a cute frog character that represents financial freedom and prosperity. The community is focused on sustainability and charitable giving."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              <button
                className="w-full bg-[#c0ff00] text-black font-bold py-3 rounded-full border-2 border-black hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!description.trim() || isCreatingToken}
                onClick={handleCreateToken}
              >
                {isCreatingToken
                  ? "Creating Your Token..."
                  : "Generate & Launch Token"}
              </button>
            </div>
          )}

          {/* Manual Entry Form */}
          {launchMethod === "manual" && (
            <div className="space-y-6">
              {/* Token Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Token Image
                </label>
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <Image
                          src={imagePreview || "/placeholder.svg"}
                          width={128}
                          height={128}
                          alt="Token preview"
                        />
                      ) : (
                        <Upload size={24} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-lg inline-block"
                      >
                        Upload Image
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                    <div>
                      <label
                        htmlFor="image-description"
                        className="block text-sm text-gray-500 mb-1"
                      >
                        Or generate with AI
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="image-description"
                          placeholder="Describe the image you want"
                          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        />
                        <button
                          className="bg-[#0039C6] text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1"
                          onClick={handleGenerateImage}
                          disabled={isGeneratingImage}
                        >
                          {isGeneratingImage ? "Generating..." : "Generate"}
                          <Sparkles size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Token Name */}
              <div>
                <label
                  htmlFor="token-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Token Name
                </label>
                <input
                  type="text"
                  id="token-name"
                  className="w-full rounded-xl border-2 border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#0039C6]"
                  placeholder="e.g. Pepe Coin"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                />
              </div>

              {/* Token Symbol */}
              <div>
                <label
                  htmlFor="token-symbol"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Token Symbol
                </label>
                <input
                  type="text"
                  id="token-symbol"
                  className="w-full rounded-xl border-2 border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#0039C6]"
                  placeholder="e.g. PEPE (2-6 characters)"
                  value={tokenSymbol}
                  onChange={(e) =>
                    setTokenSymbol(e.target.value.toUpperCase().slice(0, 6))
                  }
                />
              </div>

              {/* Token Description */}
              <div>
                <label
                  htmlFor="token-description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Token Description
                </label>
                <textarea
                  id="token-description"
                  rows={4}
                  className="w-full rounded-xl border-2 border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#0039C6]"
                  placeholder="Describe your token, its purpose, and community"
                  value={tokenDescription}
                  onChange={(e) => setTokenDescription(e.target.value)}
                ></textarea>
              </div>

              <button
                className="w-full bg-[#c0ff00] text-black font-bold py-3 rounded-full border-2 border-black hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  !tokenName ||
                  !tokenSymbol ||
                  !tokenDescription ||
                  !imagePreview ||
                  isCreatingToken
                }
                onClick={handleCreateToken}
              >
                {isCreatingToken ? "Creating Your Token..." : "Create Token"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
