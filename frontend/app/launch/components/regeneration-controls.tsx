"use client";

import { RefreshCcw } from "lucide-react";

interface RegenerationControlsProps {
  onRegenerateDetails: () => Promise<void>;
  onRegenerateImage: () => Promise<void>;
  isRegeneratingDetails: boolean;
  isRegeneratingImage: boolean;
}

export default function RegenerationControls({
  onRegenerateDetails,
  onRegenerateImage,
  isRegeneratingDetails,
  isRegeneratingImage,
}: RegenerationControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <button
        className="flex-1 bg-white border-2 border-gray-200 hover:border-[#0039C6] text-gray-700 hover:text-[#0039C6] px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onRegenerateDetails}
        disabled={isRegeneratingDetails}
      >
        {isRegeneratingDetails ? (
          <div className="flex items-center justify-center gap-2">
            <RefreshCcw className="h-4 w-4 animate-spin" />
            Regenerating Details...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Regenerate Token Details
          </div>
        )}
      </button>
      <button
        className="flex-1 bg-white border-2 border-gray-200 hover:border-[#0039C6] text-gray-700 hover:text-[#0039C6] px-4 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onRegenerateImage}
        disabled={isRegeneratingImage}
      >
        {isRegeneratingImage ? (
          <div className="flex items-center justify-center gap-2">
            <RefreshCcw className="h-4 w-4 animate-spin" />
            Regenerating Image...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Regenerate Token Image
          </div>
        )}
      </button>
    </div>
  );
}
