"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThinkingDots } from "@/app/components/ui/thinking-dots";

type SentimentAnalysis = {
  sentiment: string;
  explanation: string;
  chainOfThoughts: string;
};

function extractSentimentAnalysis(text: string): SentimentAnalysis {
  const defaultResult: SentimentAnalysis = {
    sentiment: "Unable to parse sentiment",
    explanation: "No explanation provided",
    chainOfThoughts: "No chain of thoughts provided",
  };

  try {
    const sentimentMatch = text.match(/<START>(.*?)<END>/s);
    const sentiment = sentimentMatch
      ? sentimentMatch[1].trim()
      : defaultResult.sentiment;

    const thoughtsMatch = text.match(/<think>(.*?)<\/think>/s);
    const chainOfThoughts = thoughtsMatch
      ? thoughtsMatch[1].trim()
      : defaultResult.chainOfThoughts;

    let explanation = defaultResult.explanation;
    if (sentimentMatch) {
      const afterSentiment = text.split("<END>")[1];
      if (afterSentiment) {
        explanation = afterSentiment.replace(/<\/?think>/g, "").trim();
      }
    }

    return { sentiment, explanation, chainOfThoughts };
  } catch (error) {
    console.error("Error parsing sentiment analysis:", error);
    return defaultResult;
  }
}

interface SentimentAnalysisProps {
  coinId: string;
  initialData?: { content: string };
  onAnalyze?: () => void;
  isLoading?: boolean;
}

export function SentimentAnalysisCard({
  coinId,
  initialData,
  onAnalyze,
  isLoading: externalLoading,
}: SentimentAnalysisProps) {
  const [sentimentAnalysis, setSentimentAnalysis] =
    useState<SentimentAnalysis | null>(() => {
      if (initialData) {
        console.log("Initializing with data:", initialData);
        return extractSentimentAnalysis(initialData.content);
      }
      return null;
    });
  const [internalLoading, setInternalLoading] = useState(false);

  // Use external loading state if provided, otherwise use internal
  const isLoadingSentiment = externalLoading ?? internalLoading;

  useEffect(() => {
    // Update sentiment analysis when initialData changes
    if (initialData) {
      console.log("Updating with new data:", initialData);
      setSentimentAnalysis(extractSentimentAnalysis(initialData.content));
    }
  }, [initialData]);

  const analyzeSentiment = async () => {
    if (onAnalyze) {
      onAnalyze();
      return;
    }

    setInternalLoading(true);
    try {
      const response = await fetch("/api/analyze-sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coinId }),
      });

      const data = await response.json();
      const analysis = extractSentimentAnalysis(data.content);
      setSentimentAnalysis(analysis);
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg pixelated-border p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="font-pixel text-lg ml-2">Sentiment Analysis</h3>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-6 w-6 text-gray-400"
          >
            <span className="sr-only">Info</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </Button>
        </div>
        {!sentimentAnalysis && !isLoadingSentiment && (
          <Button
            onClick={analyzeSentiment}
            className="bg-green-600 hover:bg-green-700 text-white text-xl font-bold font-clean"
          >
            Analyze
          </Button>
        )}
      </div>

      {isLoadingSentiment && (
        <div className="flex items-center justify-center p-4">
          <ThinkingDots />
        </div>
      )}

      {sentimentAnalysis && (
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="text-xl font-clean font-bold text-gray-200 mb-2 ml-2">
              Consensus
            </div>
            <div className="text-2xl font-pixel text-green-400 ml-2">
              {sentimentAnalysis.sentiment}
            </div>
          </div>
          <div>
            <div className="text-xl font-clean font-bold text-gray-200 mb-2">
              Price Target
            </div>
            <div className="text-2xl font-pixel text-green-400">
              {sentimentAnalysis.explanation.match(/\$[\d.]+/)?.[0] || "N/A"}
            </div>
          </div>
          <div className="col-span-2">
            <div className="bg-gray-700/30 p-4 rounded-lg">
              <p className="font-clean text-base text-gray-200 whitespace-pre-wrap">
                {sentimentAnalysis.chainOfThoughts}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
