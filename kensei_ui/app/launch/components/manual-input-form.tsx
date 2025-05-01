"use client";

import { ChangeEvent } from "react";
import { Sparkles } from "lucide-react";
import ImageUpload from "./image-upload";

interface ManualInputFormProps {
  tokenName: string;
  tokenSymbol: string;
  tokenDescription: string;
  imagePreview: string | null;
  isGeneratingImage: boolean;
  isCreatingToken: boolean;
  onTokenNameChange: (value: string) => void;
  onTokenSymbolChange: (value: string) => void;
  onTokenDescriptionChange: (value: string) => void;
  onImageUpload: (file: File) => void;
  onImageClear: () => void;
  onGenerateImage: () => void;
  onSubmit: () => void;
}

export default function ManualInputForm({
  tokenName,
  tokenSymbol,
  tokenDescription,
  imagePreview,
  isGeneratingImage,
  isCreatingToken,
  onTokenNameChange,
  onTokenSymbolChange,
  onTokenDescriptionChange,
  onImageUpload,
  onImageClear,
  onGenerateImage,
  onSubmit,
}: ManualInputFormProps) {
  return (
    <div className="space-y-6">
      {/* Token Image and Details */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Token Image
        </label>
        <div className="grid grid-cols-2 gap-6">
          <ImageUpload
            previewUrl={imagePreview}
            onImageSelect={onImageUpload}
            onClear={onImageClear}
          />
          <div className="space-y-4">
            {/* AI Generation */}
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Or generate with AI</p>
              <div className="flex flex-col gap-2">
                <textarea
                  placeholder="Describe the image you want"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm min-h-[170px] resize-none"
                />
                <button
                  className="bg-[#0039C6] text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-1 w-full"
                  onClick={onGenerateImage}
                  disabled={isGeneratingImage}
                >
                  {isGeneratingImage ? "Generating..." : "Generate"}
                  <Sparkles size={16} />
                </button>
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
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="e.g. Pepe Coin"
                value={tokenName}
                onChange={(e) => onTokenNameChange(e.target.value)}
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
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="e.g. PEPE (2-6 characters)"
                value={tokenSymbol}
                onChange={(e) =>
                  onTokenSymbolChange(e.target.value.toUpperCase().slice(0, 6))
                }
              />
            </div>
          </div>
        </div>
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
          onChange={(e) => onTokenDescriptionChange(e.target.value)}
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
        onClick={onSubmit}
      >
        {isCreatingToken ? "Creating Your Token..." : "Create Token"}
      </button>
    </div>
  );
}
