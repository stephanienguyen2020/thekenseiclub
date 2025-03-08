"use client";

import { useState, useEffect } from "react";
import { SentimentAnalysisCard } from "./SentimentAnalysis";

const mockResponse = {
  content: `<think>
Analyzing the recent performance and market indicators for this token:
- Strong social media engagement with positive sentiment
- Increasing trading volume over the past 24 hours
- Technical indicators showing bullish momentum
- Recent partnerships and development updates
- Growing community support and adoption

The overall sentiment appears positive with some cautionary signals regarding market volatility.
</think>

<START>Moderate Buy</END>

Based on comprehensive analysis of market data, social sentiment, and technical indicators, a price target of $422.80 is projected. This forecast considers recent volume trends, market momentum, and growing institutional interest. Key factors include strong community growth (+15% MoM), increasing liquidity depth, and positive developer activity. However, investors should note market volatility and maintain appropriate risk management.`,
};

export function MockSentimentAnalysisCard({ coinId }: { coinId: string }) {
  const [showMockData, setShowMockData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentData, setCurrentData] = useState<typeof mockResponse | null>(
    null
  );

  const mockAnalyzeSentiment = () => {
    console.log("Starting mock analysis"); // Debug log
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      console.log("Setting mock data"); // Debug log
      setCurrentData(mockResponse);
      setShowMockData(true);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <SentimentAnalysisCard
      coinId={coinId}
      onAnalyze={!showMockData ? mockAnalyzeSentiment : undefined}
      isLoading={isLoading}
      initialData={currentData || undefined}
    />
  );
}
