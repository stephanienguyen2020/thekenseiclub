"use client";
import { CoinResponse } from "@/app/launch/types";
import Navbar from "@/components/navbar";
import { VoteNotification } from "@/components/ui/vote-notification";
import api from "@/lib/api";
import { useTokenGeneratingService } from "@/services/TokenGeneratingService";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AIInputForm from "./components/ai-input-form";
import InputMethodSelector, {
  LaunchMethod,
} from "./components/input-method-selector";
import ManualInputForm from "./components/manual-input-form";

interface ImageUploadResponse {
  image: {
    gatewayUrl: string;
  };
}

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
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const tokenGeneratingService = useTokenGeneratingService();

  // Add event listener for the custom event from manual form
  useEffect(() => {
    const handleSetImagePreview = (event: any) => {
      const { previewUrl, gatewayUrl } = event.detail;
      // Update the image preview without triggering another upload
      setImagePreview(previewUrl);
      // Set the uploaded URL directly if available
      if (gatewayUrl) {
        setUploadedImageUrl(gatewayUrl);
      }
    };

    window.addEventListener("setImagePreview", handleSetImagePreview);

    return () => {
      window.removeEventListener("setImagePreview", handleSetImagePreview);
    };
  }, []);

  const handleImageUpload = async (file: File) => {
    if (file.size === 0) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "post");
      formData.append("userId", currentAccount?.address || "");

      const response = await api.post<ImageUploadResponse>(
        "/images",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.image?.gatewayUrl) {
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
    try {
      const result = await api.post<CoinResponse>("/coin", {
        name: tokenName,
        symbol: tokenSymbol,
        description: tokenDescription,
        iconUrl: uploadedImageUrl,
        // address: currentAccount?.address || "",
      });
      setNotificationMessage("Token created successfully!");
      setShowNotification(true);
      setTimeout(() => {
        window.location.href = `/marketplace/${result.data.coin.id}`;
      }, 2000);
    } catch (error) {
      setNotificationMessage("Failed to create token. Please try again.");
      setShowNotification(true);
      setIsCreatingToken(false);
    }
  };

  const handleCreateTokenAuto = async (description: string) => {
    setIsCreatingToken(true);
    try {
      const tokenDetails = await tokenGeneratingService.generateTokenWithAI(
        description,
        currentAccount?.address
      );

      const imageUrl = tokenDetails.gatewayUrl || tokenDetails.imageUrl;

      const result = await api.post<CoinResponse>("/coin", {
        name: tokenDetails.name,
        symbol: tokenDetails.symbol,
        description: tokenDetails.description,
        iconUrl: imageUrl,
        // address: currentAccount?.address || "",
      });

      setNotificationMessage("Token created successfully!");
      setShowNotification(true);
      setTimeout(() => {
        router.push(`/marketplace/${result.data.coin.id}`);
      }, 5000);
    } catch (error) {
      console.error("Error creating token:", error);
      setNotificationMessage("Failed to create token. Please try again.");
      setShowNotification(true);
      setIsCreatingToken(false);
      throw error;
    }
  };

  const handleCreateTokenManual = async () => {
    setIsCreatingToken(true);
    try {
      const iconUrl = uploadedImageUrl || imagePreview;

      const result = await api.post<CoinResponse>("/coin", {
        name: tokenName,
        symbol: tokenSymbol,
        description: tokenDescription,
        iconUrl: iconUrl,
        address: currentAccount?.address || "",
      });

      setNotificationMessage("Token created successfully!");
      setShowNotification(true);
      setTimeout(() => {
        router.push(`/marketplace/${result.data.coin.id}`);
      }, 5000);
    } catch (error) {
      console.error("Error creating token:", error);
      setNotificationMessage("Failed to create token. Please try again.");
      setShowNotification(true);
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

      {/* Success Notification */}
      <VoteNotification
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        message={notificationMessage}
      />
    </div>
  );
}
