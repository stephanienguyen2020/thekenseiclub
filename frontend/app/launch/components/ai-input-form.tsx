"use client";

import { useState } from "react";
import { Bot, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIInputFormProps {
  onSubmit: (description: string) => Promise<void>;
  isCreatingToken: boolean;
}

export default function AIInputForm({
  onSubmit,
  isCreatingToken,
}: AIInputFormProps) {
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!description.trim()) {
      setError("Please describe your token");
      return;
    }

    try {
      await onSubmit(description);
    } catch (err) {
      setError("Failed to create token. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Bot className="w-5 h-5 text-[#0039C6]" />
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Describe your token in detail
          </label>
        </div>
        <textarea
          id="description"
          rows={6}
          className="w-full rounded-xl border-2 border-gray-200 p-4 focus:outline-none focus:ring-2 focus:ring-[#0039C6]"
          placeholder="Example: A meme token based on a cute frog character that represents financial freedom and prosperity. The community is focused on sustainability and charitable giving."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <button
        type="submit"
        className="w-full bg-[#c0ff00] text-black font-bold py-3 rounded-full border-2 border-black hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!description.trim() || isCreatingToken}
      >
        {isCreatingToken ? (
          <div className="flex items-center justify-center gap-2">
            <RefreshCcw className="w-4 h-4 animate-spin" />
            Creating Your Token...
          </div>
        ) : (
          "Generate & Launch Token"
        )}
      </button>
    </form>
  );
}
