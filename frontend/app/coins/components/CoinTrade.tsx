import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import AITradeRecommendation from "./AITradeRecommendation";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpDown, Settings2, Share2, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CoinTradeProps {
  symbol: string;
  isAuthenticated: boolean;
  handleTradeAction: () => void;
}

const CoinTrade = ({
  symbol,
  isAuthenticated,
  handleTradeAction,
}: CoinTradeProps) => {
  const [amount, setAmount] = useState("");
  const [total, setTotal] = useState("");
  const balance = 500;

  const handlePercentageClick = (percentage: number) => {
    const newAmount = ((balance * percentage) / 100).toFixed(2);
    setAmount(newAmount);
    setTotal(newAmount);
  };

  const handleApplyRecommendation = () => {
    if (!isAuthenticated) {
      handleTradeAction();
      return;
    }
    // Apply the recommendation values
    setAmount("100");
    setTotal("100");
  };

  return (
    <Card className="bg-[#1A1B1E] border-none w-full overflow-visible shadow-xl">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-[#2A2B2E] text-gray-400 hover:text-green-400"
          >
            <Settings2 className="h-5 w-5" />
          </Button>

          <h2 className="text-xl font-bold text-white">Trade {symbol}</h2>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-[#2A2B2E] text-gray-400 hover:text-green-400"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* AI Trade Recommendation */}
        <div className="mb-6">
          <AITradeRecommendation
            symbol={symbol}
            recommendation="BUY"
            analysis="Based on current market analysis, a buying opportunity is present with a favorable risk-reward ratio."
            entry={0.00123}
            target={0.00129}
            stopLoss={0.0012}
            onApply={handleApplyRecommendation}
          />
        </div>

        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 bg-[#2A2B2E] p-1">
            <TabsTrigger
              value="buy"
              className="data-[state=active]:bg-[#353538] data-[state=active]:text-white"
            >
              Buy
            </TabsTrigger>
            <TabsTrigger
              value="sell"
              className="data-[state=active]:bg-[#353538] data-[state=active]:text-white"
            >
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy">
            <div className="space-y-4">
              {/* Available Balance */}
              <div className="flex justify-between items-center text-sm">
                <div className="text-gray-400">Available Balance</div>
                <div className="text-gray-300">{balance.toFixed(2)} USDT</div>
              </div>

              {/* Percentage Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map((percent) => (
                  <Button
                    key={percent}
                    variant="outline"
                    className="bg-[#2A2B2E] border-[#353538] text-gray-300 hover:bg-[#353538] hover:text-white"
                    onClick={() => handlePercentageClick(percent)}
                  >
                    {percent}%
                  </Button>
                ))}
              </div>

              {/* Amount Input */}
              <div className="bg-[#2A2B2E] rounded-xl p-3">
                <div className="text-sm text-gray-400 mb-2">Amount</div>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent border-none text-right text-xl text-white focus-visible:ring-0"
                />
                <div className="text-right text-sm text-gray-400 mt-1">
                  ≈ ${parseFloat(amount || "0") * 0.00123}
                </div>
              </div>

              {/* Total Input */}
              <div className="bg-[#2A2B2E] rounded-xl p-3">
                <div className="text-sm text-gray-400 mb-2">Total USDT</div>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  className="bg-transparent border-none text-right text-xl text-white focus-visible:ring-0"
                />
              </div>

              {/* Transaction Details */}
              <div className="bg-[#2A2B2E] rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-gray-400 flex items-center gap-1 cursor-help">
                          Fee <Info className="h-4 w-4" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1A1B1E] border-[#353538]">
                        <p>Trading fee for this transaction</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="text-gray-300">0.1%</div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-400">You will receive</div>
                  <div className="text-gray-300">
                    {parseFloat(amount || "0") / 0.00123} {symbol}
                  </div>
                </div>
              </div>

              <Button
                className="w-full h-14 text-lg font-medium mt-4 bg-green-500 hover:bg-green-600 text-white rounded-xl"
                onClick={handleTradeAction}
              >
                {isAuthenticated ? `Buy ${symbol}` : "Connect Wallet"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="sell">
            <div className="space-y-4">
              {/* Available Balance */}
              <div className="flex justify-between items-center text-sm">
                <div className="text-gray-400">Available Balance</div>
                <div className="text-gray-300">1000 {symbol}</div>
              </div>

              {/* Percentage Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 75, 100].map((percent) => (
                  <Button
                    key={percent}
                    variant="outline"
                    className="bg-[#2A2B2E] border-[#353538] text-gray-300 hover:bg-[#353538] hover:text-white"
                    onClick={() => handlePercentageClick(percent)}
                  >
                    {percent}%
                  </Button>
                ))}
              </div>

              {/* Amount Input */}
              <div className="bg-[#2A2B2E] rounded-xl p-3">
                <div className="text-sm text-gray-400 mb-2">Amount</div>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent border-none text-right text-xl text-white focus-visible:ring-0"
                />
                <div className="text-right text-sm text-gray-400 mt-1">
                  ≈ ${parseFloat(amount || "0") * 0.00123}
                </div>
              </div>

              {/* Total Input */}
              <div className="bg-[#2A2B2E] rounded-xl p-3">
                <div className="text-sm text-gray-400 mb-2">Total USDT</div>
                <Input
                  type="number"
                  placeholder="0.0"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  className="bg-transparent border-none text-right text-xl text-white focus-visible:ring-0"
                />
              </div>

              {/* Transaction Details */}
              <div className="bg-[#2A2B2E] rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-gray-400 flex items-center gap-1 cursor-help">
                          Fee <Info className="h-4 w-4" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1A1B1E] border-[#353538]">
                        <p>Trading fee for this transaction</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="text-gray-300">0.1%</div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-400">You will receive</div>
                  <div className="text-gray-300">
                    {parseFloat(total || "0")} USDT
                  </div>
                </div>
              </div>

              <Button
                className="w-full h-14 text-lg font-medium mt-4 bg-red-500 hover:bg-red-600 text-white rounded-xl"
                onClick={handleTradeAction}
              >
                {isAuthenticated ? `Sell ${symbol}` : "Connect Wallet"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CoinTrade;
