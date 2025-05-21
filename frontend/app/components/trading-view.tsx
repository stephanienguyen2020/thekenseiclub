"use client";

import { tradeAgent } from "@/app/lib/tradingBot";
import api from "@/lib/api";
import {
  fromBlockchainAmount,
  safeDivide,
  safeMultiply,
  toBlockchainAmount,
} from "@/lib/priceUtils";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import BigNumber from "bignumber.js";
import BondingCurveSDK from "coin-sdk/dist/src/bonding_curve";
import { buildSwapTransaction, getRoutes } from "coin-sdk/dist/src/flowx";
import { getClient, Network } from "coin-sdk/dist/src/utils/sui-utils";
import { ArrowDown, ArrowUp, ChevronDown, RefreshCw, Send } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import CryptoChart, { CandleData } from "./CryptoChart";
import { TransactionSuccess } from "./ui/transaction-success";

interface TradingViewProps {
  tokenSymbol: string;
  tokenName: string;
  tokenLogo: string;
  currentPrice: number;
  change24h: number;
  bondingCurveId: string;
  tokenId: string;
  suiPrice: number;
}

export default function TradingView({
  tokenSymbol,
  tokenName,
  tokenLogo,
  currentPrice,
  change24h,
  bondingCurveId,
  tokenId,
  suiPrice,
}: TradingViewProps) {
  const [amount, setAmount] = useState("");
  const [suiAmount, setSuiAmount] = useState("");
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
  const currentAccount = useCurrentAccount();
  const chartRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const client = useSuiClient();

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          // Raw effects are required so the effects can be reported back to the wallet
          showRawEffects: true,
          // Select additional data to return
          showObjectChanges: true,
        },
      }),
  });

  const [transactionHash, setTransactionHash] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAction, setLastAction] = useState<"buy" | "sell" | "swap" | null>(
    null
  );

  const [selectedCurrency, setSelectedCurrency] = useState("SUI");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Add state for search input
  const [currencySearch, setCurrencySearch] = useState("");

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
            to: new Date().toISOString(),
            resolution: timeframe,
          },
        });
        const data: CandleData[] = response.data || [];
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

    if (timeframe.includes("seconds")) {
      // Seconds (e.g., "5 seconds")
      const seconds = parseInt(timeframe.split(" ")[0]);
      if (!isNaN(seconds)) {
        intervalMs = seconds * 1000;
      }
    } else if (timeframe.includes("minutes")) {
      // Minutes (e.g., "15 minutes")
      const minutes = parseInt(timeframe.split(" ")[0]);
      if (!isNaN(minutes)) {
        intervalMs = minutes * 60 * 1000;
      }
    } else if (timeframe.includes("hour")) {
      // Hours (e.g., "1 hour" or "4 hours")
      const hours = parseInt(timeframe.split(" ")[0]);
      if (!isNaN(hours)) {
        intervalMs = hours * 60 * 60 * 1000;
      }
    } else {
      // Default to 1 hour if no valid timeframe is provided
      intervalMs = 60 * 60 * 1000;
    }

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
  }, [timeframe, bondingCurveId]);

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

    setLastAction("swap");
    setTransactionHash("0x" + Math.random().toString(16).slice(2));
    setShowSuccess(true);
    setAmount("");
  };

  async function retrieveBondingCurveData(client: SuiClient) {
    const coinMetadata = await client.getObject({
      id: tokenId,
      options: {
        showType: true,
        showContent: true,
      },
    });
    const coinMetadataType = coinMetadata.data?.type || "";
    const match = coinMetadataType.match(/CoinMetadata<(.+)>/);
    const coinType = match ? match[1] : "";
    const packageId =
      process.env.NEXT_PUBLIC_PACKAGE_ID ||
      "0x8193d051bd13fb4336ad595bbb78dac06fa64ff1c3c3c184483ced397c9d2116";
    const bondingCurveSdk = new BondingCurveSDK(
      bondingCurveId,
      client,
      packageId
    );
    return { coinType, packageId, bondingCurveSdk };
  }

  console.log("selectedCurrency", selectedCurrency);

  const handleSwap = async (buyAmount = amount, coinName?: string) => {
    const network = (process.env.NEXT_PUBLIC_NETWORK || "devnet") as Network;
    if (selectedCurrency === "SOL") {
      const swapTx = await buildSwapTransaction(
        "0xbc03aaab4c11eb84df8bf39fdc714fa5d5b65b16eb7d155e22c74a68c8d4e17f::coin::COIN",
        "0x2::sui::SUI",
        toBlockchainAmount(buyAmount, new BigNumber(10).pow(8)).toString(),
        currentAccount?.address || "",
        network
      );
      return swapTx;
    }
  };

  const handleBuySui = async (
    buyAmount = amount,
    coinName?: string,
    tx?: any
  ) => {
    const network = (process.env.NEXT_PUBLIC_NETWORK || "devnet") as Network;

    const client = getClient(network);
    const { coinType, packageId, bondingCurveSdk } =
      await retrieveBondingCurveData(client);

    console.log(
      "Buy operation - Amount:",
      buyAmount,
      "SUI, Token:",
      coinName || "default"
    );
    const parsedAmount = parseFloat(buyAmount) * 1000000000;
    const bondingTx = bondingCurveSdk.buildBuyTransaction({
      amount: BigInt(parsedAmount),
      minTokenRequired: BigInt(0),
      type: coinType,
      address: currentAccount?.address || "",
      transaction: tx,
    });

    // Execute the bonding curve transaction with explicit gas budget
    signAndExecuteTransaction(
      {
        transaction: bondingTx,
        chain: `sui:${network}`,
        options: {
          showEffects: true,
          showEvents: true,
          gasBudget: 100000000, // Set a higher gas budget (0.1 SUI)
        },
      },
      {
        onSuccess: (result: any) => {
          api
            .get<{ message: string }>(`/migrate`, {
              params: {
                bondingCurveId,
                packageId,
              },
            })
            .then((result) => {
              if (result.data.message === "Migration successful") {
                console.log("migration status", result.data.message);
                setNotificationMessage("Migration successful");
                setShowNotification(true);
                window.location.href = `/marketplace`;
              }
            });
          console.log("Buy successfully", result);
          setTransactionHash(result.digest);
          setLastAction("buy");
          setShowSuccess(true);
        },
        onError: (error: any) => {
          console.log("Bonding curve transaction error:", error);
          // Add user-friendly error message
          alert(
            "Failed to execute bonding curve transaction. Please try again."
          );
        },
      }
    );
  };

  const handleBuy = async (buyAmount = amount, coinName?: string) => {
    const network = (process.env.NEXT_PUBLIC_NETWORK || "devnet") as Network;
    if (selectedCurrency === "SOL") {
      const routes = await getRoutes(
        "0xbc03aaab4c11eb84df8bf39fdc714fa5d5b65b16eb7d155e22c74a68c8d4e17f::coin::COIN",
        "0x2::sui::SUI",
        toBlockchainAmount(buyAmount, new BigNumber(10).pow(8)).toString(),
        currentAccount?.address || ""
      );
      setSuiAmount(
        fromBlockchainAmount(routes.amountOut.toString()).toString()
      );
      const swapTx = await handleSwap(buyAmount, coinName);
      await handleBuySui(
        fromBlockchainAmount(routes.amountOut.toString()).toString(),
        coinName,
        swapTx
      );
    } else {
      setSuiAmount(buyAmount);
      await handleBuySui(buyAmount, coinName);
    }
  };

  const handleSell = async (sellAmount = amount, coinName?: string) => {
    const network = (process.env.NEXT_PUBLIC_NETWORK || "devnet") as Network;
    const client = getClient(network);
    const { coinType, packageId, bondingCurveSdk } =
      await retrieveBondingCurveData(client);
    console.log("sellAmount", sellAmount);
    console.log("coinType", coinType);
    const parsedAmount = BigInt(sellAmount) * BigInt(1000000000);
    const tx = await bondingCurveSdk.buildSellTransaction({
      amount: parsedAmount,
      minSuiRequired: BigInt(0),
      type: coinType,
      address: currentAccount?.address || "",
      network: (process.env.NEXT_PUBLIC_NETWORK || "devnet") as Network,
    });

    try {
      signAndExecuteTransaction(
        {
          transaction: tx,
          chain: `sui:${network}`,
        },
        {
          onSuccess: (result: any) => {
            console.log("success", result);
            setTransactionHash(result.digest);
            setLastAction("sell");
            setShowSuccess(true);
          },
          onError: (error: any) => {
            console.log("error", error);
          },
        }
      );
    } catch (e) {
      console.log("error", e);
    }
  };

  // Handle chat message submission
  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    // Add user message to chat
    setChatHistory([...chatHistory, { role: "user", message: chatMessage }]);

    // Clear input
    setChatMessage("");
    const result = await tradeAgent(chatMessage);
    if (result.action === "BUY") {
      setAmount(result.amount); // Update state for UI consistency
      handleBuy(result.amount, result.coinName); // Pass amount and coinName directly to avoid async state issues
    } else if (result.action === "SELL") {
      setAmount(result.amount); // Update state for UI consistency
      handleSell(result.amount, result.coinName); // Pass amount and coinName directly to avoid async state issues
    } else {
      setAmount("");
    }
  };

  // The backend/event price is an integer scaled by 1e9 (fixed-point math). Divide by 1e9 for display.
  const displayPrice = currentPrice / 1e9;

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
                ${currentPrice.toFixed(9)}
              </div>
              <div
                className={`flex items-center justify-end ${
                  change24h >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {change24h >= 0 ? (
                  <ArrowUp size={16} />
                ) : (
                  <ArrowDown size={16} />
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
            {[
              ["5s", "5 seconds"],
              ["15m", "15 minutes"],
              ["1H", "1 hour"],
              ["4H", "4 hours"],
              ["1D", "1 day"],
              ["1W", "1 week"],
              ["1M", "1 month"],
            ].map((time) => (
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
            <button className="ml-auto px-4 py-2 rounded-xl font-bold border-4 border-black bg-white text-black flex items-center gap-2">
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Trading Chart - Standard Style */}
        <div className="bg-white rounded-xl border-4 border-black p-4 h-[400px] relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-t-[#c0ff00] border-r-[#c0ff00] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <p className="ml-3 font-bold">Loading chart...</p>
            </div>
          ) : (
            <div ref={chartRef} className="w-full h-full">
              {/* This would be replaced with an actual trading chart library in a real implementation */}
              <div className="w-full h-full flex items-center justify-center bg-[#131722] text-white rounded-lg overflow-hidden">
                <CryptoChart data={chartData} />
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
                  <div className="flex border-4 border-black rounded-xl">
                    <input
                      type="number"
                      className="flex-1 p-3 text-lg font-bold rounded-l-xl focus:outline-none focus:ring-4 focus:ring-[#c0ff00] placeholder:text-gray-400 border-none"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="relative">
                      <button
                        className="bg-gray-100 px-4 py-3 font-bold flex items-center gap-1 border-l-4 border-black h-full rounded-r-xl"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        type="button"
                      >
                        {selectedCurrency} <ChevronDown size={16} />
                      </button>
                      {dropdownOpen && (
                        <div className="absolute right-0 mt-1 w-40 rounded-xl shadow-lg z-10 bg-white border-2 border-black">
                          <div className="p-2">
                            <input
                              type="text"
                              placeholder="Search..."
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#c0ff00] text-sm mb-2"
                              value={currencySearch}
                              onChange={(e) =>
                                setCurrencySearch(e.target.value)
                              }
                            />
                            {["SUI", "SOL"]
                              .filter((c) =>
                                c
                                  .toLowerCase()
                                  .includes(currencySearch.toLowerCase())
                              )
                              .map((c) => (
                                <button
                                  key={c}
                                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 font-bold text-base"
                                  onClick={() => {
                                    setSelectedCurrency(c);
                                    setDropdownOpen(false);
                                    setCurrencySearch("");
                                  }}
                                >
                                  {c}
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 uppercase">
                    Total {tokenSymbol}
                  </label>
                  <div className="bg-gray-100 p-3 rounded-xl border-4 border-black font-bold">
                    {suiAmount
                      ? safeDivide(suiAmount, suiPrice).toFixed(9)
                      : "0.00"}
                  </div>
                </div>

                <button
                  className="w-full py-4 rounded-xl font-black text-xl border-4 border-black bg-[#c0ff00] text-black hover:bg-yellow-300 transition-colors hover:translate-y-[-5px]"
                  onClick={() => handleBuy()}
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
                    Total (SUI)
                  </label>
                  <div className="bg-gray-100 p-3 rounded-xl border-4 border-black font-bold">
                    {amount
                      ? safeMultiply(amount, suiPrice).toFixed(9)
                      : "0.00"}
                  </div>
                </div>

                <button
                  className="w-full py-4 rounded-xl font-black text-xl border-4 border-black bg-red-500 text-white hover:bg-red-600 transition-colors hover:translate-y-[-5px]"
                  onClick={() => handleSell()}
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
                    <div className="bg-[#0039C6] px-4 py-3 rounded-r-xl border-4 border-l-0 border-black font-bold text-white flex items-center gap-2">
                      USD
                      <ChevronDown size={16} />
                    </div>
                  </div>

                  <div className="flex justify-center my-2">
                    <div className="bg-[#0039C6] p-2 rounded-full border-2 border-black">
                      <RefreshCw size={20} className="text-white" />
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
                          ? safeDivide(amount, currentPrice).toFixed(8)
                          : ""
                      }
                      readOnly
                    />
                    <div className="bg-[#0039C6] px-4 py-3 rounded-r-xl border-4 border-l-0 border-black font-bold text-white flex items-center gap-2">
                      {tokenSymbol}
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 p-3 rounded-xl border-4 border-black">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rate</span>
                    <span className="font-bold">
                      1 {tokenSymbol} = ${displayPrice.toFixed(9)}
                      {/* This is the canonical marginal price from the contract event, scaled to 9 decimals */}
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
                      <Send size={20} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSuccess && (
        <TransactionSuccess
          open={showSuccess}
          onOpenChange={setShowSuccess}
          tokenSymbol={tokenSymbol}
          amount={amount}
          transactionHash={transactionHash}
          onNewTransaction={() => {
            setAmount("");
            setActiveTradeTab(lastAction || "buy");
          }}
          recipient={currentAccount?.address || ""}
        />
      )}
    </div>
  );
}
