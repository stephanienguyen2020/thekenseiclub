"use client";

import type React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Check, Upload } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

// Simple visually hidden component for accessibility
const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
  <span className="sr-only">{children}</span>
);

interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  dailyPL: number;
  avgCost: number;
  pl: number;
  plPercent: number;
  value: number;
  holdings: number;
  address?: string;
  logo?: string;
}

interface AutoShillModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  modalType?: "success" | "error";
  errorMessage?: string;
  generatedTweet?: string;
  onPostToTwitter?: (editedTweet: string, videoFile?: File | null) => Promise<void>;
}

export function AutoShillModal({
  isOpen,
  onClose,
  asset,
  modalType = "success",
  errorMessage = "Failed to auto-shill. Please try again.",
  generatedTweet = "",
  onPostToTwitter,
}: AutoShillModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editedTweet, setEditedTweet] = useState(generatedTweet);
  const [isDragging, setIsDragging] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset states when modal is closed or tweet changes
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
      setShowSuccess(false);
      setEditedTweet(generatedTweet);
      setIsGeneratingVideo(false);
      setIsDragging(false);
      setError(null);
      setVideoUrl("");
      setVideoBlob(null);
      if (videoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoUrl);
      }
    } else {
      setShowSuccess(false);
      setEditedTweet(generatedTweet);
    }
  }, [isOpen, generatedTweet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (onPostToTwitter) {
        // Convert blob to File for upload if we have a video
        let videoFile: File | null = null;
        if (videoBlob) {
          videoFile = new File([videoBlob], 'generated-video.mp4', { type: 'video/mp4' });
        }
        await onPostToTwitter(editedTweet, videoFile);
        setShowSuccess(true);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError(error instanceof Error ? error.message : "Failed to post tweet");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    setIsGeneratingVideo(true);
    setError(null);
    
    try {
      const response = await fetch('/api/veo/token-shill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: editedTweet }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate video');
      }

      // Store both the blob and create a URL for preview
      const blob = await response.blob();
      const videoUrl = URL.createObjectURL(blob);
      setVideoBlob(blob);
      setVideoUrl(videoUrl);
    } catch (error) {
      console.error("Error generating video:", error);
      setError(error instanceof Error ? error.message : "Failed to generate video");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    try {
      setError(null);
      
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        throw new Error("Video file is too large. Maximum size is 100MB.");
      }

      // Validate file type
      if (!file.type.startsWith("video/")) {
        throw new Error("Please upload a valid video file.");
      }

      // Store both the file as blob and create URL for preview
      const blob = new Blob([file], { type: file.type });
      const videoUrl = URL.createObjectURL(blob);
      setVideoBlob(blob);
      setVideoUrl(videoUrl);
    } catch (error) {
      console.error("Error uploading video:", error);
      setError(error instanceof Error ? error.message : "Failed to upload video");
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        await handleVideoUpload(file);
      }
    },
    []
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await handleVideoUpload(file);
      }
    },
    []
  );

  // Clean up video URL when modal is closed
  useEffect(() => {
    if (!isOpen && videoUrl && videoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(videoUrl);
    }
  }, [isOpen, videoUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-4 border-black rounded-3xl p-6 max-w-md">
        {!showSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-black">
                Review Tweet
              </DialogTitle>
              <DialogDescription className="text-gray-600 font-medium">
                Review and edit your tweet before posting
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-black">
                  <Image
                    src={asset.logo || "/placeholder.svg"}
                    alt={`${asset.name} logo`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{asset.name}</h3>
                  <p className="text-gray-500">{asset.symbol}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-black">Your Tweet</Label>
                <Textarea
                  value={editedTweet}
                  onChange={(e) => setEditedTweet(e.target.value)}
                  className="border-2 border-black rounded-xl min-h-[150px]"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-black">Video</Label>
                  <div className="flex gap-2">
                    <label
                      className="bg-[#0046F4] text-white px-3 py-1 rounded-xl text-sm font-bold border-2 border-black hover:bg-[#0039C6] cursor-pointer flex items-center gap-1"
                    >
                      <Upload size={14} />
                      Upload Video
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateVideo}
                      disabled={isGeneratingVideo}
                      className="bg-[#0046F4] text-white px-3 py-1 rounded-xl text-sm font-bold border-2 border-black hover:bg-[#0039C6] disabled:opacity-50"
                    >
                      {isGeneratingVideo ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                          Generating...
                        </div>
                      ) : (
                        "Generate Video"
                      )}
                    </button>
                  </div>
                </div>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-black rounded-xl p-4 transition-colors ${
                    isDragging
                      ? "border-[#0046F4] bg-blue-50"
                      : videoUrl
                      ? "bg-gray-50"
                      : "bg-gray-50"
                  }`}
                >
                  {videoUrl ? (
                    <video
                      src={videoUrl}
                      controls
                      className="w-full rounded-lg"
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <p>Drag and drop a video here</p>
                    </div>
                  )}
                </div>
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="bg-white text-black px-4 py-2 rounded-xl font-bold border-2 border-black hover:bg-gray-100"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#c0ff00] text-black px-4 py-2 rounded-xl font-bold border-2 border-black hover:bg-[#a8e600] disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
                      Posting...
                    </div>
                  ) : (
                    "Post to Twitter"
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <VisuallyHidden>
              <DialogTitle>Tweet Posted</DialogTitle>
            </VisuallyHidden>
            <div className="flex flex-col items-center text-center space-y-6 py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 rounded-full bg-[#c0ff00] flex items-center justify-center border-4 border-black"
              >
                <Check className="h-10 w-10 text-black" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-black">
                  Tweet Posted!
                </h2>
                <p className="text-gray-600 font-medium">
                  Your tweet has been successfully posted to Twitter!
                </p>
              </div>
              <button
                className="bg-[#0046F4] text-white px-6 py-3 rounded-xl font-bold border-4 border-black hover:bg-[#0039C6] transition-colors"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
