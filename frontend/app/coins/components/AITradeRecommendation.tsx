"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AITradeRecommendationProps {
  symbol: string;
  recommendation: "BUY" | "SELL" | "HOLD";
  analysis: string;
  entry: number;
  target: number;
  stopLoss: number;
  onApply: () => void;
}

const AITradeRecommendation = ({
  symbol,
  recommendation = "BUY",
  analysis = "Based on current market analysis, a buying opportunity is present with a favorable risk-reward ratio.",
  entry = 0.00123,
  target = 0.00129,
  stopLoss = 0.0012,
  onApply = () => {},
}: AITradeRecommendationProps) => {
  return (
    <div className="bg-black/20 p-3 rounded-lg border border-gray-400/30">
      <div className="flex justify-between items-center mb-2">
        <div className="text-gray-300">AI Trade Recommendation</div>
        <div
          className={
            recommendation === "BUY"
              ? "text-green-400 font-medium"
              : recommendation === "SELL"
              ? "text-red-500 font-medium"
              : "text-yellow-500 font-medium"
          }
        >
          {recommendation}
        </div>
      </div>
      <p className="text-gray-300 text-sm mb-2">{analysis}</p>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="bg-black/40 p-2 rounded border border-gray-400/30">
          <div className="text-gray-400">Entry</div>
          <div className="text-gray-200">${entry.toFixed(6)}</div>
        </div>
        <div className="bg-black/40 p-2 rounded border border-gray-400/30">
          <div className="text-gray-400">Target</div>
          <div className="text-green-400">${target.toFixed(6)}</div>
        </div>
        <div className="bg-black/40 p-2 rounded border border-gray-400/30">
          <div className="text-gray-400">Stop Loss</div>
          <div className="text-red-500">${stopLoss.toFixed(6)}</div>
        </div>
      </div>
      <Button
        className="w-full mt-3 bg-green-600 hover:bg-green-700"
        onClick={onApply}
      >
        Apply Recommendation <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default AITradeRecommendation;
