"use client";

import type React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

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
}

interface AutoShillModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  modalType?: "success" | "error";
  errorMessage?: string;
}

export function AutoShillModal({
  isOpen,
  onClose,
  asset,
  modalType = "success",
  errorMessage = "Failed to auto-shill. Please try again.",
}: AutoShillModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(modalType === "success"); // Start with success view for success type
  const [platform, setPlatform] = useState("twitter");
  const [frequency, setFrequency] = useState("daily");

  // Reset states when modal is closed or modalType changes
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
      setShowSuccess(modalType === "success"); // Reset based on modalType
    } else {
      setShowSuccess(modalType === "success");
    }
  }, [isOpen, modalType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Show success dialog after 5 seconds
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
    }, 5000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-4 border-black rounded-3xl p-6 max-w-md">
        {!showSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-black">
                Auto Shill {asset.symbol}
              </DialogTitle>
              <DialogDescription className="text-gray-600 font-medium">
                Configure auto-shill settings for {asset.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="font-bold text-black">Platform</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="border-2 border-black rounded-xl">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black rounded-xl">
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="discord">Discord</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-black">
                  Custom Message (optional)
                </Label>
                <Textarea
                  placeholder="Enter your custom shill message..."
                  className="border-2 border-black rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-black">
                  Custom Hashtags (optional)
                </Label>
                <Input
                  placeholder="Enter hashtags (comma separated)"
                  className="border-2 border-black rounded-xl"
                />
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
                      Setting up...
                    </div>
                  ) : (
                    "Start Auto Shill"
                  )}
                </button>
              </div>
            </form>
          </>
        ) : modalType === "success" ? (
          // Success View
          <>
            <VisuallyHidden>
              <DialogTitle>Auto Shill Success</DialogTitle>
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
                  Auto Shill Activated!
                </h2>
                <p className="text-gray-600 font-medium">
                  Your {asset.symbol} has successfully been shilled on{" "}
                  {platform}!
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
        ) : (
          // Error View
          <>
            <VisuallyHidden>
              <DialogTitle>Auto Shill Error</DialogTitle>
            </VisuallyHidden>
            <div className="flex flex-col items-center text-center space-y-6 py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center border-4 border-black"
              >
                <svg
                  className="h-10 w-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-black">
                  Auto Shill Failed!
                </h2>
                <p className="text-gray-600 font-medium">{errorMessage}</p>
              </div>
              <button
                className="bg-[#0046F4] text-white px-6 py-3 rounded-xl font-bold border-4 border-black hover:bg-[#0039C6] transition-colors"
                onClick={onClose}
              >
                Try Again
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
