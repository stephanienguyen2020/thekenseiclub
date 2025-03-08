"use client";

interface KeyIndicatorsProps {
  symbol: string;
}

const KeyIndicators = ({ symbol }: KeyIndicatorsProps) => {
  // Mock data for key indicators
  const indicators = {
    rsi: 58.3,
    macd: "Bullish",
    ma: "Golden Cross",
    volume: "+12% (24h)",
  };

  return (
    <div className="bg-black/20 p-3 rounded-lg border border-gray-400/30">
      <div className="text-gray-300 mb-2">Key Indicators</div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="text-gray-400">RSI (14)</div>
          <div className="text-gray-200">{indicators.rsi}</div>
        </div>
        <div className="flex justify-between">
          <div className="text-gray-400">MACD</div>
          <div className="text-green-400">{indicators.macd}</div>
        </div>
        <div className="flex justify-between">
          <div className="text-gray-400">MA (50/200)</div>
          <div className="text-green-400">{indicators.ma}</div>
        </div>
        <div className="flex justify-between">
          <div className="text-gray-400">Volume</div>
          <div className="text-green-400">{indicators.volume}</div>
        </div>
      </div>
    </div>
  );
};

export default KeyIndicators;
