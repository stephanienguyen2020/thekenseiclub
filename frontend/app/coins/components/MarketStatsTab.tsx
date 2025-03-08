import { type Coin } from "@/app/data/mockCoins";
import { useState } from "react";
import MarketSentiment from "./MarketSentiment";
import KeyIndicators from "./KeyIndicators";

type TimeRange = "5M" | "1H" | "4H" | "24H";

type VolumeData = {
  timeRange: TimeRange;
  buyVolume: number;
  sellVolume: number;
  netChange: number;
};

function formatMarketCap(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }
}


const MarketStatsTab = ({
  coinData,
  volumeData,
}: {
  coinData: Coin;
  volumeData: VolumeData[];
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("24H");

  // Find the selected time range data
  const selectedData =
    volumeData.find((data) => data.timeRange === selectedTimeRange) ||
    volumeData[3];

  return (
    <div className="space-y-6">
      {/* Market Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg bg-black/20 border-gray-400/30">
          <div className="text-sm text-muted-foreground">Market Cap</div>
          <div className="text-xl font-bold">{formatMarketCap(coinData.marketCap)}</div>
        </div>
        <div className="p-4 border rounded-lg bg-black/20 border-gray-400/30">
          <div className="text-sm text-muted-foreground">Liquidity</div>
          <div className="text-xl font-bold">{formatMarketCap(coinData.liquidity)}</div>
        </div>
        <div className="p-4 border rounded-lg bg-black/20 border-gray-400/30">
          <div className="text-sm text-muted-foreground"># of Holders</div>
          <div className="text-xl font-bold">32K</div>
        </div>
        <div className="p-4 border rounded-lg bg-black/20 border-gray-400/30">
          <div className="text-sm text-muted-foreground"># of Markets</div>
          <div className="text-xl font-bold">43</div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Column 1: Market Sentiment and Key Indicators */}
        <div className="space-y-4">
          <MarketSentiment symbol={coinData.symbol} sentimentPercentage={65} />
          <KeyIndicators symbol={coinData.symbol} />
        </div>

        {/* Column 2: Time Range Stats */}
        <div className="p-4 border rounded-lg bg-black/30 border-gray-400/30">
          <div className="grid grid-cols-4 gap-4 mb-4">
            {volumeData.map((data) => (
              <button
                key={data.timeRange}
                className={`px-4 py-2 rounded-md border border-gray-400/30 ${
                  selectedTimeRange === data.timeRange
                    ? "bg-gray-700 text-white"
                    : "bg-black/20 text-gray-400 hover:bg-gray-800"
                }`}
                onClick={() => setSelectedTimeRange(data.timeRange)}
              >
                <div className="flex flex-col items-center">
                  <span className="font-medium">{data.timeRange}</span>
                  <span
                    className={`text-sm ${
                      data.netChange >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {data.netChange > 0 ? "+" : ""}
                    {data.netChange}%
                  </span>
                </div>
              </button>
            ))}
          </div>
          {/* Transaction Analysis */}
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-black/20 border-gray-400/30">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="mr-2 text-sm text-muted-foreground">
                    TXNS
                  </span>
                  <span className="text-lg font-bold">16K</span>
                </div>
                <div className="flex gap-20">
                  <div>
                    <span className="text-sm text-green-400">BUYS</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {selectedData.buyVolume}K
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-red-400">SELLS</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {selectedData.sellVolume}K
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-red-400"
                  style={{ width: "100%" }}
                />
              </div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="mr-2 text-sm text-muted-foreground">
                    VOLUME
                  </span>
                  <span className="text-lg font-bold">$3M</span>
                </div>
                <div className="flex gap-20">
                  <div>
                    <span className="text-sm text-green-400">BUY VOL</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ${selectedData.buyVolume}M
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-red-400">SELL VOL</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ${selectedData.sellVolume}M
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-red-400"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketStatsTab;
