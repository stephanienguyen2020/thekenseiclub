"use client";
import {useState, type ChangeEvent} from "react";
import Image from "next/image";
import {Upload, Sparkles} from "lucide-react";
import Navbar from "@/components/navbar";
import axios, {AxiosResponse} from "axios";
import api from "@/lib/api";
import {CoinResponse} from "@/app/launch/types";
import {useRouter} from "next/navigation";
import {useCurrentAccount} from "@mysten/dapp-kit";
import InputMethodSelector, {
  LaunchMethod,
} from "./components/input-method-selector";
import AIInputForm from "./components/ai-input-form";
import ManualInputForm from "./components/manual-input-form";

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
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

  const handleCreateToken = async () => {
    setIsCreatingToken(true);
    const result: AxiosResponse<CoinResponse> = await api.post("/coin", {
      name: tokenName,
      symbol: tokenSymbol,
      description: tokenDescription,
      iconUrl: uploadedImageUrl,
      address: currentAccount?.address || "",
    });
    console.log("result: ", result);
    window.location.href = `/marketplace/${result?.data.coin.id}`;
  };
  const handleCreateTokenAuto = async (description: string) => {
    setIsCreatingToken(true);
    try {
      // Here you would typically call an AI service to generate token details
      // For now, we'll create a simple token based on the description
      const {data: result}: { data: CoinResponse } = await api.post("/coin", {
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
      const {data: result}: { data: CoinResponse } = await api.post("/coin", {
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
        <Navbar isAuthenticated={!!currentAccount}/>

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
