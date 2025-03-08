"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Wallet, LineChart, ArrowDownUp } from "lucide-react";
import CoinChat from "./CoinChat";
import CoinTrade from "./CoinTrade";
import MyInvestment from "./MyInvestment";
import CoinSwap from "./CoinSwap";

interface CoinsRightBarProps {
  symbol: string;
  isAuthenticated: boolean;
  handleTradeAction: () => void;
}

export default function CoinsRightBar({
  symbol,
  isAuthenticated,
  handleTradeAction,
}: CoinsRightBarProps) {
  const [activeTab, setActiveTab] = useState("chat");
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    // Set initial height
    setWindowHeight(window.innerHeight);

    // Update height on window resize
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Clean up event listener
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      className="fixed right-0 w-full lg:w-[calc(30%-2rem)] lg:max-w-[500px] bottom-0 lg:bottom-auto lg:right-4 z-10"
      style={{
        height: `calc(${windowHeight}px - 96px)`,
        display: windowHeight < 500 && !isAuthenticated ? "none" : "block",
      }}
    >
      <div className="space-y-6 h-full overflow-auto">
        <Card className="h-full flex flex-col shadow-lg bg-black/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                <Button
                  variant={activeTab === "chat" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("chat")}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </Button>
                <Button
                  variant={activeTab === "trade" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("trade")}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Trade
                </Button>
                <Button
                  variant={activeTab === "swap" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("swap")}
                >
                  <ArrowDownUp className="w-4 h-4 mr-2" />
                  Swap
                </Button>
                <Button
                  variant={activeTab === "investment" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("investment")}
                >
                  <LineChart className="w-4 h-4 mr-2" />
                  Investment
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {activeTab === "chat" && <CoinChat symbol={symbol} />}
            {activeTab === "trade" && (
              <CoinTrade
                symbol={symbol}
                isAuthenticated={isAuthenticated}
                handleTradeAction={handleTradeAction}
              />
            )}
            {activeTab === "swap" && (
              <CoinSwap
                symbol={symbol}
                isAuthenticated={isAuthenticated}
                handleTradeAction={handleTradeAction}
              />
            )}
            {activeTab === "investment" && <MyInvestment symbol={symbol} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
