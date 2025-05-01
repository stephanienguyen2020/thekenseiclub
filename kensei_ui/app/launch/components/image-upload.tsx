"use client";

import { useState, useRef } from "react";
import { X, ImageIcon, Upload } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  previewUrl: string | null;
  onClear: () => void;
  className?: string;
}

export default function ImageUpload({
  onImageSelect,
  previewUrl,
  onClear,
  className,
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

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("w-full", className)}>
      {previewUrl ? (
        <div className="relative w-full aspect-square rounded-xl border-2 border-gray-300 overflow-hidden transition-all duration-200 ease-in-out">
          <Image src={previewUrl} alt="Preview" fill className="object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200">
            <button
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity duration-200"
              onClick={onClear}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "w-full aspect-square rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center relative cursor-pointer",
            isDragging
              ? "border-[#0039C6] bg-[#0039C6]/5"
              : "border-gray-300 hover:border-[#0039C6] hover:bg-[#0039C6]/5"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#0039C6]/5 via-[#c0ff00]/5 to-[#0039C6]/5 rounded-xl opacity-50" />
          <div className="relative space-y-2 text-center p-4">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#0039C6]/10">
              <Upload className="h-5 w-5 text-[#0039C6]" />
            </div>
            <p className="text-sm text-gray-500">
              Drop image here or click to upload
            </p>
          </div>
        </div>
      )}
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
