"use client";

interface MarketSentimentProps {
  symbol: string;
  sentimentPercentage?: number;
}

const MarketSentiment = ({
  symbol,
  sentimentPercentage = 65,
}: MarketSentimentProps) => {
  return (
    <div className="bg-black/20 p-3 rounded-lg border border-gray-400/30">
      <div className="text-gray-300 mb-2">Market Sentiment</div>
      <div className="flex items-center">
        <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
          <div
            className="bg-green-400 h-full"
            style={{ width: `${sentimentPercentage}%` }}
          ></div>
        </div>
        <div className="ml-2 text-green-400 font-medium">
          {sentimentPercentage}%
        </div>
      </div>
      <div className="flex justify-between text-xs mt-1">
        <div className="text-red-500">Bearish</div>
        <div className="text-green-400">Bullish</div>
      </div>
    </div>
  );
};

export default MarketSentiment;
