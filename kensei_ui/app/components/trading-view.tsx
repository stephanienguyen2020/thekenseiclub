"use client";

import {useState, useEffect, useRef} from "react";
import Image from "next/image";
import {ArrowUp, ArrowDown, RefreshCw, ChevronDown, Send} from "lucide-react";
import CryptoChart, {CandleData} from "./CryptoChart";
import api from "@/lib/api";

interface TradingViewProps {
  tokenSymbol: string;
  tokenName: string;
  tokenLogo: string;
  currentPrice: number;
  change24h: number;
  bondingCurveId: string;
}

export default function TradingView({
                                      tokenSymbol,
                                      tokenName,
                                      tokenLogo,
                                      currentPrice,
                                      change24h,
                                      bondingCurveId,
                                    }: TradingViewProps) {
  const [amount, setAmount] = useState("");
  const [activeTradeTab, setActiveTradeTab] = useState<
    "buy" | "sell" | "swap" | "assistant"
  >("buy");
  const [timeframe, setTimeframe] = useState("1D");
  const [isLoading, setIsLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "bot"; message: string }[]
  >([
    {
      role: "bot",
      message: `Welcome to ${tokenSymbol} trading! How can I help you today?`,
    },
  ]);
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Simulate chart loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Fetch chart data with error handling
    const fetchChartData = async () => {
      try {
        console.log(`Fetching chart data for timeframe: ${timeframe}`);
        const response = await api.get(`/ohlcv`, {
          params: {
            bonding_curve_id: bondingCurveId,
            from: "2025-04-10 15:08:00.000000",
            to: "2025-05-19 16:08:00.000000",
            resolution: timeframe,
          },
        });
        const data: CandleData[] = response.data.rows;
        setChartData(data);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        // Continue with periodic fetching despite errors
      }
    };

    // Initial fetch
    fetchChartData();

    // Set up interval for periodic fetching based on timeframe
    let intervalId: NodeJS.Timeout | null = null;

    // Parse timeframe to determine interval duration
    let intervalMs = 0;

    if (timeframe.includes('seconds')) {
      // Seconds (e.g., "5 seconds")
      const seconds = parseInt(timeframe.split(' ')[0]);
      if (!isNaN(seconds)) {
        intervalMs = seconds * 1000;
      }
    } else if (timeframe.includes('minutes')) {
      // Minutes (e.g., "15 minutes")
      const minutes = parseInt(timeframe.split(' ')[0]);
      if (!isNaN(minutes)) {
        intervalMs = minutes * 60 * 1000;
      }
    } else if (timeframe.includes('hour')) {
      // Hours (e.g., "1 hour" or "4 hours")
      const hours = parseInt(timeframe.split(' ')[0]);
      if (!isNaN(hours)) {
        intervalMs = hours * 60 * 60 * 1000;
      }
    } else if (timeframe.includes('day')) {
      // Days (e.g., "1 day")
      const days = parseInt(timeframe.split(' ')[0]);
      if (!isNaN(days)) {
        intervalMs = days * 24 * 60 * 60 * 1000;
      }
    } else if (timeframe.includes('week')) {
      // Weeks (e.g., "1 week")
      const weeks = parseInt(timeframe.split(' ')[0]);
      if (!isNaN(weeks)) {
        intervalMs = weeks * 7 * 24 * 60 * 60 * 1000;
      }
    } else if (timeframe.includes('month')) {
      // Months (e.g., "1 month")
      const months = parseInt(timeframe.split(' ')[0]);
      if (!isNaN(months)) {
        // Approximate a month as 30 days
        intervalMs = months * 30 * 24 * 60 * 60 * 1000;
      }
    }

    // Set up interval if a valid interval was determined
    if (intervalMs > 0) {
      console.log(`Setting up interval for ${timeframe}: ${intervalMs}ms`);
      intervalId = setInterval(fetchChartData, intervalMs);
    }

    // Clean up interval on unmount or when timeframe changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [timeframe]);

  // Scroll chat to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Mock function to handle trade
  const handleTrade = () => {
    if (!amount) return;

    alert(
      `${
        activeTradeTab === "buy" ? "Bought" : "Sold"
      } ${amount} ${tokenSymbol} at $${currentPrice.toFixed(8)}`
    );
    setAmount("");
  };

  // Handle chat message submission
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    // Add user message to chat
    setChatHistory([...chatHistory, {role: "user", message: chatMessage}]);

    // Clear input
    setChatMessage("");

    // Simulate bot response after a short delay
    setTimeout(() => {
      let botResponse = "";

      if (chatMessage.toLowerCase().includes("price")) {
        botResponse = `The current price of ${tokenSymbol} is $${currentPrice.toFixed(
          8
        )}.`;
      } else if (
        chatMessage.toLowerCase().includes("buy") ||
        chatMessage.toLowerCase().includes("purchase")
      ) {
        botResponse = `To buy ${tokenSymbol}, simply enter the amount you want in the trade panel and click the BUY button.`;
      } else if (chatMessage.toLowerCase().includes("sell")) {
        botResponse = `To sell ${tokenSymbol}, switch to the SELL tab in the trade panel, enter your amount, and confirm the transaction.`;
      } else if (
        chatMessage.toLowerCase().includes("chart") ||
        chatMessage.toLowerCase().includes("graph")
      ) {
        botResponse = `The chart shows the price movement of ${tokenSymbol} over time. You can change the timeframe using the buttons above the chart.`;
      } else {
        botResponse = `Thanks for your message about ${tokenSymbol}! Our trading assistant will help you shortly. In the meantime, check out the latest price action on the chart.`;
      }

      setChatHistory((prev) => [
        ...prev,
        {role: "bot", message: botResponse},
      ]);
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart and Order Panel - 2/3 width on large screens */}
      <div className="lg:col-span-2 space-y-6">
        {/* Price Info */}
        <div className="bg-white rounded-xl border-4 border-black p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-4 border-black">
                <Image
                  src={tokenLogo || "/placeholder.svg"}
                  alt={tokenName}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-black">{tokenSymbol}/USD</h2>
                <p className="text-gray-600">{tokenName}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                ${currentPrice.toFixed(8)}
              </div>
              <div
                className={`flex items-center justify-end ${
                  change24h >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {change24h >= 0 ? (
                  <ArrowUp size={16}/>
                ) : (
                  <ArrowDown size={16}/>
                )}
                <span className="font-bold">
                  {Math.abs(change24h).toFixed(2)}%
                </span>
                <span className="text-gray-500 ml-1">24h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Timeframe Selector */}
        <div className="bg-[#0039C6] rounded-xl border-4 border-black p-4">
          <div className="flex gap-2 overflow-x-auto">
            {[["5s", "5 seconds"], ["15m", "15 minutes"], ["1H", "1 hour"], ["4H", "4 hours"], ["1D", "1 day"], ["1W", "1 week"], ["1M", "1 month"]].map((time) => (
              <button
                key={time[0]}
                className={`px-4 py-2 rounded-xl font-bold border-4 border-black ${
                  timeframe === time[1]
                    ? "bg-[#c0ff00] text-black"
                    : "bg-white text-black"
                }`}
                onClick={() => setTimeframe(time[1])}
              >
                {time[0]}
              </button>
            ))}
            <button
              className="ml-auto px-4 py-2 rounded-xl font-bold border-4 border-black bg-white text-black flex items-center gap-2">
              <RefreshCw size={16}/>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Trading Chart - Standard Style */}
        <div className="bg-white rounded-xl border-4 border-black p-4 h-[400px] relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-12 h-12 border-4 border-t-[#c0ff00] border-r-[#c0ff00] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <p className="ml-3 font-bold">Loading chart...</p>
            </div>
          ) : (
            <div ref={chartRef} className="w-full h-full">
              {/* This would be replaced with an actual trading chart library in a real implementation */}
              <div
                className="w-full h-full flex items-center justify-center bg-[#131722] text-white rounded-lg overflow-hidden">
                <CryptoChart data={chartData}/>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trading Panel and Chat - 1/3 width on large screens */}
      <div className="lg:col-span-1 space-y-6">
        {/* Trading Panel */}
        <div className="bg-white rounded-xl border-4 border-black overflow-hidden">
          {/* Tab Selector */}
          <div className="flex border-b-4 border-black">
            <button
              className={`flex-1 py-3 font-black text-lg ${
                activeTradeTab === "buy"
                  ? "bg-[#c0ff00] text-black"
                  : "bg-white text-gray-500"
              }`}
              onClick={() => setActiveTradeTab("buy")}
            >
              BUY
            </button>
            <button
              className={`flex-1 py-3 font-black text-lg ${
                activeTradeTab === "sell"
                  ? "bg-red-500 text-white"
                  : "bg-white text-gray-500"
              }`}
              onClick={() => setActiveTradeTab("sell")}
            >
              SELL
            </button>
            <button
              className={`flex-1 py-3 font-black text-lg ${
                activeTradeTab === "swap"
                  ? "bg-[#0039C6] text-white"
                  : "bg-white text-gray-500"
              }`}
              onClick={() => setActiveTradeTab("swap")}
            >
              SWAP
            </button>
            <button
              className={`flex-1 py-3 font-black text-lg ${
                activeTradeTab === "assistant"
                  ? "bg-purple-500 text-white"
                  : "bg-white text-gray-500"
              }`}
              onClick={() => setActiveTradeTab("assistant")}
            >
              ASSIST
            </button>
          </div>

          {/* Trading Form Content */}
          <div className="p-4 space-y-4">
            {activeTradeTab === "buy" && (
              <>
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase">
                    Amount
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      className="flex-1 rounded-l-xl border-4 border-r-0 border-black p-3 focus:outline-none focus:ring-4 focus:ring-[#c0ff00] text-lg font-bold"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="bg-gray-100 px-4 py-3 rounded-r-xl border-4 border-l-0 border-black font-bold">
                      {tokenSymbol}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 uppercase">
                    Total (USD)
                  </label>
                  <div className="bg-gray-100 p-3 rounded-xl border-4 border-black font-bold">
                    $
                    {amount
                      ? (Number.parseFloat(amount) * currentPrice).toFixed(2)
                      : "0.00"}
                  </div>
                </div>

                <button
                  className="w-full py-4 rounded-xl font-black text-xl border-4 border-black bg-[#c0ff00] text-black hover:bg-yellow-300 transition-colors hover:translate-y-[-5px]"
                  onClick={handleTrade}
                  disabled={!amount}
                >
                  BUY {tokenSymbol}
                </button>

                <div className="bg-yellow-100 p-3 rounded-xl border-2 border-black">
                  <p className="text-sm font-bold">
                    Trading {tokenSymbol} involves risk. Make sure you
                    understand the risks before trading.
                  </p>
                </div>
              </>
            )}

            {activeTradeTab === "sell" && (
              <>
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase">
                    Amount
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      className="flex-1 rounded-l-xl border-4 border-r-0 border-black p-3 focus:outline-none focus:ring-4 focus:ring-red-300 text-lg font-bold"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="bg-gray-100 px-4 py-3 rounded-r-xl border-4 border-l-0 border-black font-bold">
                      {tokenSymbol}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 uppercase">
                    Total (USD)
                  </label>
                  <div className="bg-gray-100 p-3 rounded-xl border-4 border-black font-bold">
                    $
                    {amount
                      ? (Number.parseFloat(amount) * currentPrice).toFixed(2)
                      : "0.00"}
                  </div>
                </div>

                <button
                  className="w-full py-4 rounded-xl font-black text-xl border-4 border-black bg-red-500 text-white hover:bg-red-600 transition-colors hover:translate-y-[-5px]"
                  onClick={handleTrade}
                  disabled={!amount}
                >
                  SELL {tokenSymbol}
                </button>

                <div className="bg-yellow-100 p-3 rounded-xl border-2 border-black">
                  <p className="text-sm font-bold">
                    Trading {tokenSymbol} involves risk. Make sure you
                    understand the risks before trading.
                  </p>
                </div>
              </>
            )}

            {activeTradeTab === "swap" && (
              <>
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase">
                    From
                  </label>
                  <div className="flex mb-4">
                    <input
                      type="number"
                      className="flex-1 rounded-l-xl border-4 border-r-0 border-black p-3 focus:outline-none focus:ring-4 focus:ring-[#0039C6] text-lg font-bold"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <div
                      className="bg-[#0039C6] px-4 py-3 rounded-r-xl border-4 border-l-0 border-black font-bold text-white flex items-center gap-2">
                      USD
                      <ChevronDown size={16}/>
                    </div>
                  </div>

                  <div className="flex justify-center my-2">
                    <div className="bg-[#0039C6] p-2 rounded-full border-2 border-black">
                      <RefreshCw size={20} className="text-white"/>
                    </div>
                  </div>

                  <label className="block text-sm font-bold mb-2 uppercase">
                    To
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      className="flex-1 rounded-l-xl border-4 border-r-0 border-black p-3 focus:outline-none focus:ring-4 focus:ring-[#0039C6] text-lg font-bold"
                      placeholder="0.00"
                      value={
                        amount
                          ? (Number.parseFloat(amount) / currentPrice).toFixed(
                            8
                          )
                          : ""
                      }
                      readOnly
                    />
                    <div
                      className="bg-[#0039C6] px-4 py-3 rounded-r-xl border-4 border-l-0 border-black font-bold text-white flex items-center gap-2">
                      {tokenSymbol}
                      <ChevronDown size={16}/>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 p-3 rounded-xl border-4 border-black">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rate</span>
                    <span className="font-bold">
                      1 {tokenSymbol} = ${currentPrice.toFixed(8)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-gray-600">Fee</span>
                    <span className="font-bold">0.5%</span>
                  </div>
                </div>

                <button
                  className="w-full py-4 rounded-xl font-black text-xl border-4 border-black bg-[#0039C6] text-white hover:bg-blue-700 transition-colors hover:translate-y-[-5px]"
                  onClick={handleTrade}
                  disabled={!amount}
                >
                  SWAP TO {tokenSymbol}
                </button>

                <div className="bg-yellow-100 p-3 rounded-xl border-2 border-black">
                  <p className="text-sm font-bold">
                    Swapping tokens involves risk. Make sure you understand the
                    risks before proceeding.
                  </p>
                </div>
              </>
            )}

            {activeTradeTab === "assistant" && (
              <div className="h-[400px] flex flex-col">
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto space-y-3 mb-4"
                >
                  {chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-xl border-2 border-black max-w-[80%] ${
                        msg.role === "user"
                          ? "bg-[#c0ff00] ml-auto"
                          : "bg-gray-100"
                      }`}
                    >
                      <p className="text-sm font-medium">{msg.message}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-black pt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 rounded-xl border-4 border-black p-3 focus:outline-none focus:ring-4 focus:ring-purple-300"
                      placeholder={`Ask about ${tokenSymbol} trading...`}
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                    />
                    <button
                      className="bg-purple-500 p-3 rounded-xl border-4 border-black"
                      onClick={handleSendMessage}
                    >
                      <Send size={20} className="text-white"/>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
