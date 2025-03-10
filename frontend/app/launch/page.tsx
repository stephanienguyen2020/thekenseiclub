"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "../components/app-layout";
import { InputMethodSelector, type InputMethod } from "./input-method-selector";
import { AIInputForm } from "./ai-input-form";
import { RegenerationControls } from "./regeneration-controls";
import { TokenFormSection } from "./token-form";
import { useTokenStore, type Token } from "../store/tokenStore";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createToken } from "@/services/memecoin-launchpad";
import { generateTokenConcept } from "@/app/lib/nebula";
import { useTestTokenService } from "@/services/TestTokenService";

interface TokenDetails {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
}

interface LaunchConfig {
  initialSupply: string;
  maxSupply: string;
  launchCost: string;
  liquidityPercentage: string;
  lockupPeriod: string;
}

export default function LaunchPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [aiImageUrl, setAiImageUrl] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [launchConfig, setLaunchConfig] = useState<LaunchConfig>({
    initialSupply: "200000",
    maxSupply: "1000000",
    launchCost: "0.1",
    liquidityPercentage: "60",
    lockupPeriod: "180",
  });
  const [inputMethod, setInputMethod] = useState<InputMethod>("manual");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingDetails, setIsRegeneratingDetails] = useState(false);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [generatedDetails, setGeneratedDetails] = useState<TokenDetails | null>(
    null
  );
  const addToken = useTokenStore((state) => state.addToken);
  const testTokenService = useTestTokenService();

  const handleImageSelect = (file: File) => {
    setError("");
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAiImageUrl("");
  };

  const clearImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setAiImageUrl("");
    setError("");
  };

  const generateImageWithPromptInput = async (inputPrompt: string) => {
    if (!inputPrompt.trim()) return;
    console.log("generating image", inputPrompt);
    try {
      setError("");
      setLoadingAI(true);

      const url = "https://api.nebulablock.com/api/v1/images/generation";

      const response = await fetch(url, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_NEBULA_API_KEY}`,
        },

        body: JSON.stringify({
          model_name: "black-forest-labs/FLUX.1-schnell",
          prompt: inputPrompt,
          num_steps: 4,
          guidance_scale: 3.5,
          seed: -1,
          width: 1024,
          height: 1024,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate image");

      const { data } = await response.json();
      console.log("data", data);
      const imageBase64 = data.image_file;

      // Convert base64 to binary
      const byteCharacters = atob(imageBase64);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      // Create a Blob from the binary data
      const blob = new Blob([byteArray], { type: "image/png" });

      // Create File object from blob
      const file = new File([blob], "ai-generated.png", { type: "image/png" });

      // console.log("file", file);

      // setAiImageUrl(data.url);
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } catch (error) {
      console.error("Error generating image:", error);
      setError(
        "Failed to generate image. Please try again or upload an image manually."
      );
    } finally {
      setLoadingAI(false);
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) return;
    console.log("generating image");
    try {
      setError("");
      setLoadingAI(true);

      const url = "https://api.nebulablock.com/api/v1/images/generation";

      const response = await fetch(url, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_NEBULA_API_KEY}`,
        },

        body: JSON.stringify({
          model_name: "black-forest-labs/FLUX.1-schnell",
          prompt: prompt,
          num_steps: 4,
          guidance_scale: 3.5,
          seed: -1,
          width: 1024,
          height: 1024,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate image");

      const { data } = await response.json();
      console.log("data", data);
      const imageBase64 = data.image_file;

      // Convert base64 to binary
      const byteCharacters = atob(imageBase64);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      // Create a Blob from the binary data
      const blob = new Blob([byteArray], { type: "image/png" });

      // Create File object from blob
      const file = new File([blob], "ai-generated.png", { type: "image/png" });

      // console.log("file", file);

      // setAiImageUrl(data.url);
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } catch (error) {
      console.error("Error generating image:", error);
      setError(
        "Failed to generate image. Please try again or upload an image manually."
      );
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = async (data: Record<string, string>) => {
    console.log("Submitting data:", data);
    console.log("Image file:", imageFile);
    try {
      if (!imageFile) {
        setError("Please upload an image or generate one using AI");
        return;
      }

      // If we have generated details, use those instead of form data
      const tokenName = generatedDetails?.name || data?.name;
      const tokenSymbol = generatedDetails?.symbol || data?.symbol;
      const tokenDescription =
        generatedDetails?.description || data?.description;

      if (!tokenName || !tokenSymbol) {
        setError("Name and symbol are required");
        return;
      }

      setIsLoading(true);

      const metaData = {
        name: tokenName.trim(),
        ticker: tokenSymbol.trim(),
        description: tokenDescription || "",
      };

      // Use testCreateToken instead of createToken
      const result = await testTokenService.testCreateToken(
        metaData,
        imageFile
      );

      if (!result.success) {
        setError("Failed to create token");
        return false;
      }

      // Create a new token object
      const newToken: Token = {
        id: result.imageURL?.split("ipfs/")[1] || Date.now().toString(),
        name: tokenName,
        symbol: tokenSymbol,
        imageUrl: result.imageURL || "",
        description: tokenDescription || "",
        price: "$0.00",
        priceChange: 0,
        marketCap: "0",
        holders: "0",
        volume24h: "$0",
        launchDate: new Date().toISOString().split("T")[0],
        chain: data.chain || "NEAR",
        status: "active",
        fundingRaised: "0",
      };

      // Add token to store
      addToken(newToken);
      router.push("/dashboard/my-tokens");
      return true;
    } catch (error) {
      console.error("Error creating token:", error);
      setError("Failed to create token. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (input: string) => {
    try {
      setAiInput(input);
      setIsGenerating(true);
      const response = await generateTokenConcept(input);
      response.imageUrl = "";
      setPrompt(response.image_description);
      console.log("response", response);
      setGeneratedDetails(response);
      await generateImageWithPromptInput(response.image_description);
      // After successful generation, switch to manual mode
      setInputMethod("manual");
    } catch (error) {
      console.error("Error generating token:", error);
      setError("Failed to generate token details");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateDetails = async () => {
    if (!aiInput) return;
    setIsRegeneratingDetails(true);
    await handleGenerate(aiInput);
    setIsRegeneratingDetails(false);
  };

  const handleRegenerateImage = async () => {
    // Similar to handleRegenerateDetails but only for the image
    // You'll need to create a new API endpoint for this
  };

  const handleConfigChange = (key: keyof LaunchConfig, value: string) => {
    setLaunchConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <AppLayout showFooter={false}>
      <div className="py-8">
        <div className="container max-w-7xl">
          <div className="flex flex-col items-center mb-12 space-y-4 text-center">
            <div className="space-y-4">
              <Badge variant="secondary" className="mb-4">
                Token Launch Platform
              </Badge>
              <h1 className="text-4xl font-bold text-transparent md:text-5xl bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text">
                Launch Your Own Token
              </h1>
              <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
                Create, deploy, and manage your meme token with our secure and
                automated platform. No coding required.
              </p>
            </div>
          </div>

          <div>
            <Card className="border-primary/20 bg-background/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Create Your Token</CardTitle>
                <CardDescription>
                  Choose how you want to create your token
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <InputMethodSelector
                    selected={inputMethod}
                    onSelect={setInputMethod}
                  />

                  {(inputMethod === "ai-joke" ||
                    inputMethod === "ai-tweet") && (
                    <div className="space-y-6">
                      <AIInputForm
                        inputMethod={inputMethod}
                        onGenerate={handleGenerate}
                        isGenerating={isGenerating}
                      />

                      {generatedDetails && (
                        <RegenerationControls
                          onRegenerateDetails={handleRegenerateDetails}
                          onRegenerateImage={handleRegenerateImage}
                          isRegeneratingDetails={isRegeneratingDetails}
                          isRegeneratingImage={isRegeneratingImage}
                        />
                      )}
                    </div>
                  )}

                  {(inputMethod === "manual" || generatedDetails) && (
                    <TokenFormSection
                      inputMethod={inputMethod}
                      generatedDetails={generatedDetails}
                      error={error}
                      imageFile={imageFile}
                      previewUrl={previewUrl}
                      aiImageUrl={aiImageUrl}
                      prompt={prompt}
                      loadingAI={loadingAI}
                      isLoading={isLoading}
                      launchConfig={launchConfig}
                      onImageSelect={handleImageSelect}
                      onClearImage={clearImage}
                      onPromptChange={setPrompt}
                      onGenerateImage={generateImage}
                      onSubmit={handleSubmit}
                      onConfigChange={handleConfigChange}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
