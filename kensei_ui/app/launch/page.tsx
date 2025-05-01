"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import api from "@/lib/api";
import { CoinResponse } from "@/app/launch/types";
import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import InputMethodSelector, {
  LaunchMethod,
} from "./components/input-method-selector";
import AIInputForm from "./components/ai-input-form";
import ManualInputForm from "./components/manual-input-form";

export default function LaunchTokenPage() {
  const router = useRouter();
  const currentAccount = useCurrentAccount();
  const [launchMethod, setLaunchMethod] = useState<LaunchMethod>("auto");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isCreatingToken, setIsCreatingToken] = useState(false);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageClear = () => {
    setImagePreview(null);
  };

  const handleGenerateImage = () => {
    setIsGeneratingImage(true);
    // Simulate AI image generation
    setTimeout(() => {
      setImagePreview("/blockchain-bulldog.png");
      setIsGeneratingImage(false);
    }, 1500);
  };

  const handleCreateTokenAuto = async (description: string) => {
    setIsCreatingToken(true);
    try {
      // Here you would typically call an AI service to generate token details
      // For now, we'll create a simple token based on the description
      const { data: result }: { data: CoinResponse } = await api.post("/coin", {
        name: "AI Generated Token",
        symbol: "AGT",
        description: description,
        iconUrl: "/blockchain-bulldog.png", // Default image for AI-generated tokens
        address: currentAccount?.address || "",
      });
      console.log("result: ", result);
      router.push(`/marketplace/${result.coin.id}`);
    } catch (error) {
      console.error("Error creating token:", error);
      setIsCreatingToken(false);
      throw error; // Re-throw to let the form handle the error
    }
  };

  const handleCreateTokenManual = async () => {
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
          <InputMethodSelector
            selectedMethod={launchMethod}
            onMethodChange={setLaunchMethod}
          />

          {/* Auto Generated Form */}
          {launchMethod === "auto" && (
            <AIInputForm
              onSubmit={handleCreateTokenAuto}
              isCreatingToken={isCreatingToken}
            />
          )}

          {/* Manual Entry Form */}
          {launchMethod === "manual" && (
            <ManualInputForm
              tokenName={tokenName}
              tokenSymbol={tokenSymbol}
              tokenDescription={tokenDescription}
              imagePreview={imagePreview}
              isGeneratingImage={isGeneratingImage}
              isCreatingToken={isCreatingToken}
              onTokenNameChange={setTokenName}
              onTokenSymbolChange={setTokenSymbol}
              onTokenDescriptionChange={setTokenDescription}
              onImageUpload={handleImageUpload}
              onImageClear={handleImageClear}
              onGenerateImage={handleGenerateImage}
              onSubmit={handleCreateTokenManual}
            />
          )}
        </div>
      </div>
    </div>
  );
}
