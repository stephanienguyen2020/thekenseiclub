"use client";

import type React from "react";
import { useState, useRef } from "react";
import { X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  previewUrl: string | null;
  onClear: () => void;
}

export function ImageUpload({
  onImageSelect,
  previewUrl,
  onClear,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      onImageSelect(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {previewUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative aspect-square w-full overflow-hidden rounded-xl border border-primary/20 bg-background/60 backdrop-blur-xl"
          >
            <Image
              src={previewUrl || "/placeholder.svg"}
              alt="Preview"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity hover:opacity-100">
              <div className="absolute bottom-4 right-4">
                <Button variant="destructive" size="icon" onClick={onClear}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "relative flex aspect-square w-full flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-primary/20 hover:border-primary/50 hover:bg-primary/5"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-green-500/5 to-purple-500/5 rounded-xl" />
            <div className="relative space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Drop your image here or click to upload
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 5MB
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
