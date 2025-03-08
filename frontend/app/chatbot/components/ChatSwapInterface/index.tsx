"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, ChevronDown, X, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChatSwapInterfaceProps {
  defaultFromToken?: string;
  defaultToToken?: string;
  onSwapComplete: (
    fromAmount: string,
    fromToken: string,
    toAmount: string,
    toToken: string
  ) => void;
}

// Define token data with more details (simplified version)
const tokens = [
  {
    symbol: "DOGE",
    name: "Dogecoin",
    balance: 861.87,
    icon: "🐶",
    price: 0.18659,
  },
  {
    symbol: "USDT",
    name: "Tether",
    balance: 500.0,
    icon: "💵",
    price: 1.0,
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    balance: 0.05,
    icon: "₿",
    price: 61250,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    balance: 1.2,
    icon: "Ξ",
    price: 4125,
  },
];

export function ChatSwapInterface({
  defaultFromToken,
  defaultToToken,
  onSwapComplete,
}: ChatSwapInterfaceProps) {
  const [fromToken, setFromToken] = useState(
    tokens.find((t) => t.symbol === defaultFromToken) || tokens[0]
  );
  const [toToken, setToToken] = useState(
    tokens.find((t) => t.symbol === defaultToToken) || tokens[1]
  );
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [fromSearchQuery, setFromSearchQuery] = useState("");
  const [toSearchQuery, setToSearchQuery] = useState("");
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);

  // Mock exchange rates (in a real app, these would come from an API)
  const getExchangeRate = (from: string, to: string) => {
    const rates: Record<string, Record<string, number>> = {
      DOGE: { USDT: 0.18659, BTC: 0.00000304, ETH: 0.00004521 },
      USDT: { DOGE: 5.36, BTC: 0.000016, ETH: 0.00024 },
      BTC: { DOGE: 328900, USDT: 61250, ETH: 14.8 },
      ETH: { DOGE: 22120, USDT: 4125, BTC: 0.0675 },
    };
    return rates[from]?.[to] || 1;
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      const rate = getExchangeRate(fromToken.symbol, toToken.symbol);
      setToAmount((parseFloat(value) * rate).toFixed(6));
    } else {
      setToAmount("");
    }
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      const rate = getExchangeRate(toToken.symbol, fromToken.symbol);
      setFromAmount((parseFloat(value) * rate).toFixed(6));
    } else {
      setFromAmount("");
    }
  };

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSwap = () => {
    // In a real app, this would call a blockchain transaction
    onSwapComplete(fromAmount, fromToken.symbol, toAmount, toToken.symbol);
  };

  // Filter tokens based on search query
  const filteredFromTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(fromSearchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(fromSearchQuery.toLowerCase())
  );

  const filteredToTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(toSearchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(toSearchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-md bg-[#1A1B1E] rounded-xl overflow-hidden">
      <div className="p-4 space-y-4">
        {/* From Token */}
        <div className="bg-[#2A2B2E] rounded-xl p-3">
          <div className="flex justify-between mb-2">
            <div className="text-sm text-gray-400">You pay</div>
            <div className="text-sm text-gray-400">
              Balance:{" "}
              <span className="text-gray-300">
                {fromToken.balance.toFixed(4)} {fromToken.symbol}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 px-3 bg-[#353538] hover:bg-[#404043] rounded-lg flex items-center gap-2"
                >
                  <span className="text-lg">{fromToken.icon}</span>
                  <span className="text-white font-medium">
                    {fromToken.symbol}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0 bg-[#1A1B1E] border-[#353538]">
                <div className="p-2">
                  <div className="flex items-center border border-[#353538] rounded-md bg-[#2A2B2E]">
                    <Search className="h-4 w-4 ml-2 text-gray-400" />
                    <Input
                      placeholder="Search tokens..."
                      value={fromSearchQuery}
                      onChange={(e) => setFromSearchQuery(e.target.value)}
                      className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto py-1">
                  {filteredFromTokens.map((token) => (
                    <div
                      key={token.symbol}
                      className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#2A2B2E]"
                      onClick={() => {
                        setFromToken(token);
                        setIsFromOpen(false);
                        if (fromAmount) handleFromAmountChange(fromAmount);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{token.icon}</span>
                        <span className="font-medium text-white">
                          {token.symbol}
                        </span>
                      </div>
                      <span className="text-sm text-gray-300">
                        {token.balance.toFixed(4)}
                      </span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Input
              type="text"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              className="bg-transparent border-none text-right text-lg text-white focus-visible:ring-0 p-0 flex-1"
            />
          </div>
          <div className="text-right text-sm text-gray-400 mt-1">
            ≈ ${(parseFloat(fromAmount || "0") * fromToken.price).toFixed(2)}
          </div>
        </div>

        {/* Swap Button */}
        <div className="relative flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-2 z-10 rounded-lg bg-[#2A2B2E] border border-[#353538] hover:bg-[#353538]"
            onClick={handleSwapTokens}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className="bg-[#2A2B2E] rounded-xl p-3">
          <div className="flex justify-between mb-2">
            <div className="text-sm text-gray-400">You receive</div>
            <div className="text-sm text-gray-400">
              Balance:{" "}
              <span className="text-gray-300">
                {toToken.balance.toFixed(4)} {toToken.symbol}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Popover open={isToOpen} onOpenChange={setIsToOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 px-3 bg-[#353538] hover:bg-[#404043] rounded-lg flex items-center gap-2"
                >
                  <span className="text-lg">{toToken.icon}</span>
                  <span className="text-white font-medium">
                    {toToken.symbol}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0 bg-[#1A1B1E] border-[#353538]">
                <div className="p-2">
                  <div className="flex items-center border border-[#353538] rounded-md bg-[#2A2B2E]">
                    <Search className="h-4 w-4 ml-2 text-gray-400" />
                    <Input
                      placeholder="Search tokens..."
                      value={toSearchQuery}
                      onChange={(e) => setToSearchQuery(e.target.value)}
                      className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto py-1">
                  {filteredToTokens.map((token) => (
                    <div
                      key={token.symbol}
                      className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#2A2B2E]"
                      onClick={() => {
                        setToToken(token);
                        setIsToOpen(false);
                        if (fromAmount) handleFromAmountChange(fromAmount);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{token.icon}</span>
                        <span className="font-medium text-white">
                          {token.symbol}
                        </span>
                      </div>
                      <span className="text-sm text-gray-300">
                        {token.balance.toFixed(4)}
                      </span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Input
              type="text"
              placeholder="0.0"
              value={toAmount}
              onChange={(e) => handleToAmountChange(e.target.value)}
              className="bg-transparent border-none text-right text-lg text-white focus-visible:ring-0 p-0 flex-1"
            />
          </div>
          <div className="text-right text-sm text-gray-400 mt-1">
            ≈ ${(parseFloat(toAmount || "0") * toToken.price).toFixed(2)}
          </div>
        </div>

        {/* Swap Button */}
        <Button
          className="w-full h-12 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          onClick={handleSwap}
          disabled={!fromAmount || parseFloat(fromAmount) === 0}
        >
          Swap now
        </Button>
      </div>
    </div>
  );
}
