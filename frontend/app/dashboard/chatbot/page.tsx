"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import "./markdown-styles.css";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  Download,
  TrendingUp,
  Activity,
  BarChart3,
} from "lucide-react";
import { processUserQuery } from "@/app/lib/agents";
import {
  buildBuyTransaction,
  buildSellTransaction,
} from "@/services/coinService";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import api from "@/lib/api";
import { Network } from "coin-sdk/dist/src/utils/sui-utils";

// Enhanced function to convert Markdown to HTML
const markdownToHtml = (markdown: string) => {
  if (!markdown) return "";

  // Process code blocks first to avoid interference with other formatting
  let html = markdown.replace(
    /```(.*?)\n([\s\S]*?)```/g,
    '<pre class="bg-gray-800 text-gray-100 p-3 rounded-md my-2 overflow-x-auto"><code>$2</code></pre>'
  );

  // Process inline code
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-gray-200 text-gray-800 px-1 rounded">$1</code>'
  );

  // Headers (h1, h2, h3)
  html = html.replace(
    /^# (.*?)$/gm,
    '<h1 class="text-xl font-bold my-3">$1</h1>'
  );
  html = html.replace(
    /^## (.*?)$/gm,
    '<h2 class="text-lg font-bold my-2">$1</h2>'
  );
  html = html.replace(
    /^### (.*?)$/gm,
    '<h3 class="text-md font-bold my-2">$1</h3>'
  );

  // Bold: **text** to <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Italic: *text* to <em>text</em>
  html = html.replace(/\*([^\*]+)\*/g, "<em>$1</em>");

  // Links: [text](url) to <a href="url">text</a>
  html = html.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Horizontal rule: --- to <hr>
  html = html.replace(
    /^\-{3,}$/gm,
    '<hr class="my-4 border-t-2 border-gray-300">'
  );

  // Process lists
  // First, identify list blocks (consecutive lines that are list items)
  const listBlocks: { start: number; end: number; type: "ol" | "ul" }[] = [];
  const lines = html.split("\n");
  let inList = false;
  let listStart = 0;
  let listType: "ol" | "ul" = "ul";

  // Find list blocks
  for (let i = 0; i < lines.length; i++) {
    const isNumberedItem = /^\d+\.\s.+/.test(lines[i]);
    const isBulletItem = /^-\s.+/.test(lines[i]);

    if ((isNumberedItem || isBulletItem) && !inList) {
      // Start of a new list
      inList = true;
      listStart = i;
      listType = isNumberedItem ? "ol" : "ul";
    } else if (!isNumberedItem && !isBulletItem && inList) {
      // End of a list
      inList = false;
      listBlocks.push({ start: listStart, end: i - 1, type: listType });
    }
  }

  // If we're still in a list at the end, close it
  if (inList) {
    listBlocks.push({
      start: listStart,
      end: lines.length - 1,
      type: listType,
    });
  }

  // Process each list block
  for (let i = listBlocks.length - 1; i >= 0; i--) {
    const block = listBlocks[i];
    const listItems = lines.slice(block.start, block.end + 1);

    // Process each list item
    const processedItems = listItems.map((item) => {
      if (block.type === "ol") {
        // For ordered lists, preserve the original number
        const match = item.match(/^(\d+)\.\s(.+)/);
        if (match) {
          return `<li value="${match[1]}">${match[2]}</li>`;
        }
      } else {
        // For bullet lists
        const match = item.match(/^-\s(.+)/);
        if (match) {
          return `<li>${match[1]}</li>`;
        }
      }
      return item; // If not matched, return unchanged
    });

    // Replace the list items with the wrapped list
    const listTag = block.type === "ol" ? "ol" : "ul";
    const listClass = block.type === "ol" ? "list-decimal" : "list-disc";
    const wrappedList = `<${listTag} class="${listClass} ml-5 my-2">${processedItems.join(
      ""
    )}</${listTag}>`;

    // Replace the original lines with the wrapped list
    lines.splice(block.start, block.end - block.start + 1, wrappedList);
  }

  // Join the lines back together
  html = lines.join("\n");

  // Convert line breaks to <br> (do this last to avoid interfering with other elements)
  html = html.replace(/\n/g, "<br>");

  return html;
};

// Market Analysis Components
const WhaleMovementsCard = ({ data }: { data: any }) => (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 my-3">
    <div className="flex items-center gap-2 mb-3">
      <Activity className="text-blue-600" size={20} />
      <h3 className="font-bold text-blue-800">
        Whale Movements - {data.token}
      </h3>
      <span className="text-xs bg-blue-100 px-2 py-1 rounded-full text-blue-700">
        {data.timeframe}
      </span>
    </div>
    <p className="text-sm text-gray-700 mb-3">{data.summary}</p>
    <div className="space-y-2">
      {data.data.map((whale: any, index: number) => (
        <div
          key={index}
          className="bg-white border border-blue-200 rounded-lg p-3"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-bold ${
                  whale.type === "BUY"
                    ? "bg-green-100 text-green-800"
                    : whale.type === "SELL"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {whale.type}
              </span>
              <span className="text-sm font-semibold">{whale.amountUSD}</span>
            </div>
            <span className="text-xs text-gray-500">{whale.timestamp}</span>
          </div>
          <div className="text-xs text-gray-600">
            <div>
              Amount: {whale.amount} {data.token}
            </div>
            <div>Exchange: {whale.exchange}</div>
            <div>Wallet: {whale.walletAddress}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MarketSentimentCard = ({ data }: { data: any }) => (
  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 my-3">
    <div className="flex items-center gap-2 mb-3">
      <TrendingUp className="text-green-600" size={20} />
      <h3 className="font-bold text-green-800">
        Market Sentiment - {data.token}
      </h3>
      <span
        className={`px-2 py-1 rounded-full text-xs font-bold ${
          data.data.overallSentiment === "BULLISH"
            ? "bg-green-100 text-green-800"
            : data.data.overallSentiment === "BEARISH"
            ? "bg-red-100 text-red-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {data.data.overallSentiment}
      </span>
    </div>
    <p className="text-sm text-gray-700 mb-3">{data.summary}</p>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white border border-green-200 rounded-lg p-3">
        <div className="text-xs text-gray-600 mb-1">Fear & Greed Index</div>
        <div className="text-lg font-bold text-green-700">
          {data.data.fearGreedIndex}/100
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${data.data.fearGreedIndex}%` }}
          ></div>
        </div>
      </div>
      <div className="bg-white border border-green-200 rounded-lg p-3">
        <div className="text-xs text-gray-600 mb-1">24h Volume</div>
        <div className="text-lg font-bold text-green-700">
          {data.data.volume24h}
        </div>
        <div className="text-xs text-green-600">{data.data.priceChange24h}</div>
      </div>
    </div>
    <div className="mt-3 bg-white border border-green-200 rounded-lg p-3">
      <div className="text-xs text-gray-600 mb-2">Social Sentiment</div>
      <div className="flex gap-2">
        <div className="flex-1 bg-green-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${data.data.socialMentions.positive}%` }}
          ></div>
        </div>
        <span className="text-xs text-green-600">
          {data.data.socialMentions.positive}% Positive
        </span>
      </div>
    </div>
  </div>
);

const TechnicalAnalysisCard = ({ data }: { data: any }) => (
  <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-200 rounded-xl p-4 my-3">
    <div className="flex items-center gap-2 mb-3">
      <BarChart3 className="text-purple-600" size={20} />
      <h3 className="font-bold text-purple-800">
        Technical Analysis - {data.token}
      </h3>
      <span className="text-xs bg-purple-100 px-2 py-1 rounded-full text-purple-700">
        {data.timeframe}
      </span>
    </div>
    <p className="text-sm text-gray-700 mb-3">{data.summary}</p>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white border border-purple-200 rounded-lg p-3">
        <div className="text-xs text-gray-600 mb-1">Current Price</div>
        <div className="text-lg font-bold text-purple-700">
          {data.data.currentPrice}
        </div>
        <div className="text-xs text-green-600">{data.data.priceChange}</div>
      </div>
      <div className="bg-white border border-purple-200 rounded-lg p-3">
        <div className="text-xs text-gray-600 mb-1">24h Volume</div>
        <div className="text-lg font-bold text-purple-700">
          {data.data.volume}
        </div>
      </div>
    </div>
    <div className="mt-3 grid grid-cols-2 gap-2">
      <div className="bg-white border border-purple-200 rounded-lg p-2">
        <div className="text-xs text-gray-600">Support</div>
        <div className="font-semibold text-purple-700">{data.data.support}</div>
      </div>
      <div className="bg-white border border-purple-200 rounded-lg p-2">
        <div className="text-xs text-gray-600">Resistance</div>
        <div className="font-semibold text-purple-700">
          {data.data.resistance}
        </div>
      </div>
    </div>
    <div className="mt-3 bg-white border border-purple-200 rounded-lg p-3">
      <div className="text-xs text-gray-600 mb-2">Technical Indicators</div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          RSI: <span className="font-semibold">{data.data.indicators.RSI}</span>
        </div>
        <div>
          MACD:{" "}
          <span className="font-semibold">{data.data.indicators.MACD}</span>
        </div>
      </div>
    </div>
  </div>
);

export default function ChatbotPage() {
  const [message, setMessage] = useState("");
  console.log(message);
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "bot"; message: string; timestamp: string; data?: any }[]
  >([
    {
      role: "bot",
      message:
        "Hi there! I'm your Kensei AI assistant. I can help you with token information, market analysis, whale movements and social media strategy. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const client = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }: any) =>
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

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const currentAccount = useCurrentAccount();

  // Scroll to bottom when chat history updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage = {
      role: "user" as const,
      message: message.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    try {
      // Process the user query to determine if it's about news, token trading, or market analysis
      const response: any = await processUserQuery(message.trim());

      let botMessageContent = "";
      let botMessageData = null;

      if (response.queryType === "NEWS") {
        // Format news response
        const newsItems = response.result.newsItems;
        if (Array.isArray(newsItems) && newsItems.length > 0) {
          botMessageContent = `Here are some news articles about ${response.result.extractedTerms.filterTerm}:\n\n`;
          newsItems.forEach((item, index) => {
            botMessageContent += `${index + 1}. **${item.title}**\n`;
            botMessageContent += `${item.description}\n`;
            if (item.url) {
              botMessageContent += `[Read more](${item.url})\n`;
            }
            botMessageContent += "\n";
          });
        } else {
          botMessageContent = `I couldn't find any relevant news articles about ${response.result.extractedTerms.filterTerm}. Please try a different query.`;
        }
      } else if (response.queryType === "TOKEN_TRADING") {
        const network = (process.env.NEXT_PUBLIC_NETWORK ||
          "devnet") as Network;
        const tradingResult = response.result;
        if (tradingResult.action === "BUY") {
          const { buyTransaction, bondingCurveId, packageId } =
            await buildBuyTransaction(
              tradingResult.coinName,
              tradingResult.amount,
              currentAccount
            );
          try {
            signAndExecuteTransaction(
              {
                transaction: buyTransaction as any, // Type assertion to fix the linter error
                chain: `sui:${network}`,
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
                      console.log("migration status", result.data.message);
                    });
                  console.log("Buy successfully", result);
                  botMessageContent = `You have successfully bought ${tradingResult.amount} ${tradingResult.coinName}.`;
                  const botMessage = {
                    role: "bot" as const,
                    message: botMessageContent,
                    timestamp: new Date().toLocaleTimeString(),
                  };

                  setChatHistory((prev) => [...prev, botMessage]);
                },
                onError: (error: any) => {
                  console.log("error", error);
                  botMessageContent = `Sorry, I encountered an error while processing your buy request. Please try again.`;
                  const botMessage = {
                    role: "bot" as const,
                    message: botMessageContent,
                    timestamp: new Date().toLocaleTimeString(),
                  };

                  setChatHistory((prev) => [...prev, botMessage]);
                },
              }
            );
          } catch (error) {
            console.log("error", error);
            botMessageContent = `Sorry, I encountered an error while processing your buy request. Please try again.`;
            const botMessage = {
              role: "bot" as const,
              message: botMessageContent,
              timestamp: new Date().toLocaleTimeString(),
            };
            setChatHistory((prev) => [...prev, botMessage]);
          }
        } else if (tradingResult.action === "SELL") {
          const { sellTransaction, bondingCurveId, packageId } =
            await buildSellTransaction(
              tradingResult.coinName,
              tradingResult.amount,
              currentAccount
            );
          try {
            signAndExecuteTransaction(
              {
                transaction: sellTransaction as any, // Type assertion to fix the linter error
                chain: `sui:${network}`,
              },
              {
                onSuccess: (result: any) => {
                  console.log("success", result);
                  botMessageContent = `You have successfully sold ${tradingResult.amount} ${tradingResult.coinName}.`;
                  const botMessage = {
                    role: "bot" as const,
                    message: botMessageContent,
                    timestamp: new Date().toLocaleTimeString(),
                  };

                  setChatHistory((prev) => [...prev, botMessage]);
                },
                onError: (error: any) => {
                  console.log("error", error);
                  botMessageContent = `Sorry, I encountered an error while processing your sell request. Please try again.`;
                  const botMessage = {
                    role: "bot" as const,
                    message: botMessageContent,
                    timestamp: new Date().toLocaleTimeString(),
                  };

                  setChatHistory((prev) => [...prev, botMessage]);
                },
              }
            );
          } catch (error) {
            console.log("error", error);
            botMessageContent = `Sorry, I encountered an error while processing your sell request. Please try again.`;
            const botMessage = {
              role: "bot" as const,
              message: botMessageContent,
              timestamp: new Date().toLocaleTimeString(),
            };
            setChatHistory((prev) => [...prev, botMessage]);
          }
        } else {
          // For GENERAL messages
          botMessageContent =
            tradingResult.message ||
            "I'm not sure how to process your trading request. Please try again with a clearer instruction.";
        }
      } else if (response.queryType === "MARKET_ANALYSIS") {
        // Handle market analysis response
        const analysisResult = response.result;
        botMessageContent = analysisResult.summary;
        botMessageData = analysisResult;
      }

      if (botMessageContent === "") {
        return;
      }
      const botMessage = {
        role: "bot" as const,
        message: botMessageContent,
        timestamp: new Date().toLocaleTimeString(),
        data: botMessageData,
      };

      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error processing query:", error);

      // Add error message to chat
      const errorMessage = {
        role: "bot" as const,
        message:
          "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
      };

      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setChatHistory([
      {
        role: "bot",
        message: "Chat cleared. How can I help you today?",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  // Render message content with special handling for market analysis
  const renderMessageContent = (chat: any) => {
    if (chat.role === "user") {
      return <div className="whitespace-pre-wrap">{chat.message}</div>;
    }

    // For bot messages, check if there's market analysis data
    if (chat.data) {
      const analysisType = chat.data.analysisType;
      return (
        <div>
          <div
            className="markdown-content mb-3"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(chat.message) }}
          />
          {analysisType === "WHALE_MOVEMENTS" && (
            <WhaleMovementsCard data={chat.data} />
          )}
          {analysisType === "MARKET_SENTIMENT" && (
            <MarketSentimentCard data={chat.data} />
          )}
          {analysisType === "TECHNICAL_ANALYSIS" && (
            <TechnicalAnalysisCard data={chat.data} />
          )}
          {analysisType === "GENERAL" && (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 my-3">
              <h3 className="font-bold text-gray-800 mb-2">
                Market Information - {chat.data.token}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  Price:{" "}
                  <span className="font-semibold">{chat.data.data.price}</span>
                </div>
                <div>
                  Market Cap:{" "}
                  <span className="font-semibold">
                    {chat.data.data.marketCap}
                  </span>
                </div>
                <div>
                  24h Volume:{" "}
                  <span className="font-semibold">
                    {chat.data.data.volume24h}
                  </span>
                </div>
                <div>
                  Rank:{" "}
                  <span className="font-semibold">#{chat.data.data.rank}</span>
                </div>
              </div>
              <div className="mt-3 text-sm">
                <div className="font-semibold mb-1">Price Changes:</div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    1h:{" "}
                    <span className="text-green-600">
                      {chat.data.data.priceChange["1h"]}
                    </span>
                  </div>
                  <div>
                    24h:{" "}
                    <span className="text-green-600">
                      {chat.data.data.priceChange["24h"]}
                    </span>
                  </div>
                  <div>
                    7d:{" "}
                    <span className="text-green-600">
                      {chat.data.data.priceChange["7d"]}
                    </span>
                  </div>
                  <div>
                    30d:{" "}
                    <span className="text-green-600">
                      {chat.data.data.priceChange["30d"]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Regular bot message
    return (
      <div
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: markdownToHtml(chat.message) }}
      />
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black text-white">Chat Bot</h1>
        <div className="flex gap-2">
          <button
            onClick={clearChat}
            className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold border-4 border-black flex items-center gap-2"
          >
            <Trash2 size={20} />
            <span>Clear Chat</span>
          </button>
          <button className="bg-[#0046F4] text-white px-4 py-2 rounded-xl font-bold border-4 border-black flex items-center gap-2">
            <Download size={20} />
            <span>Export Chat</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Chat Interface */}
        <div className="col-span-1">
          <div className="bg-white rounded-3xl border-4 border-black overflow-hidden flex flex-col h-[calc(100vh-180px)]">
            {/* Chat Header */}
            <div className="bg-[#0039C6] p-4 border-b-4 border-black">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#c0ff00] flex items-center justify-center border-2 border-black">
                  <Bot size={24} className="text-black" />
                </div>
                <div>
                  <div className="text-white font-bold">
                    Kensei AI Assistant
                  </div>
                  <div className="text-gray-300 text-xs">Powered by GPT-4o</div>
                </div>
                <div className="ml-auto bg-[#c0ff00] px-2 py-1 rounded-full text-xs font-bold border-2 border-black flex items-center gap-1">
                  <Sparkles size={12} />
                  <span>AI</span>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {chatHistory.map((chat, index) => (
                <div
                  key={index}
                  className={`flex ${
                    chat.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-xl border-2 border-black ${
                      chat.role === "user"
                        ? "bg-[#c0ff00] text-black"
                        : "bg-[#0046F4] text-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-black bg-white">
                        {chat.role === "user" ? (
                          <User size={16} className="text-black" />
                        ) : (
                          <Bot size={16} className="text-black" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold mb-1">
                          {chat.role === "user" ? "You" : "Kensei AI"}
                          <span className="text-xs font-normal ml-2 opacity-70">
                            {chat.timestamp}
                          </span>
                        </div>
                        {renderMessageContent(chat)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-4 rounded-xl border-2 border-black bg-[#0046F4] text-white">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border-2 border-black bg-white">
                        <Bot size={16} className="text-black" />
                      </div>
                      <div>
                        <div className="font-bold mb-1">
                          Kensei AI
                          <span className="text-xs font-normal ml-2 opacity-70">
                            {new Date().toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <div
                            className="w-2 h-2 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-white rounded-full animate-bounce"
                            style={{ animationDelay: "600ms" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="p-4 border-t-4 border-black bg-gray-50">
              <h3 className="text-sm font-bold mb-2">Quick Prompts</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  className="px-3 py-1 rounded-xl border-2 border-black bg-gray-100 hover:bg-[#c0ff00] transition-colors text-sm"
                  onClick={() => {
                    setMessage(
                      "What's the current market trend for meme coins?"
                    );
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                >
                  Market trends
                </button>
                <button
                  className="px-3 py-1 rounded-xl border-2 border-black bg-gray-100 hover:bg-[#c0ff00] transition-colors text-sm"
                  onClick={() => {
                    setMessage("Show whale movements for $SUI");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                >
                  Whale movements SUI
                </button>
                <button
                  className="px-3 py-1 rounded-xl border-2 border-black bg-gray-100 hover:bg-[#c0ff00] transition-colors text-sm"
                  onClick={() => {
                    setMessage("Analyze market sentiment for SUI");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                >
                  Market sentiment
                </button>
                <button
                  className="px-3 py-1 rounded-xl border-2 border-black bg-gray-100 hover:bg-[#c0ff00] transition-colors text-sm"
                  onClick={() => {
                    setMessage("Technical analysis of SUI");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                >
                  Technical analysis
                </button>
                <button
                  className="px-3 py-1 rounded-xl border-2 border-black bg-gray-100 hover:bg-[#c0ff00] transition-colors text-sm"
                  onClick={() => {
                    setMessage("Help me draft a tweet about my PEPE token");
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                >
                  Draft tweet
                </button>
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t-4 border-black bg-gray-50">
              <div className="flex gap-2">
                <textarea
                  className="flex-1 rounded-xl border-4 border-black p-3 focus:outline-none focus:ring-4 focus:ring-[#0039C6] resize-none"
                  placeholder="Type your message..."
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                ></textarea>
                <button
                  className="bg-[#c0ff00] text-black p-3 rounded-xl border-4 border-black self-end"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isTyping}
                >
                  <Send size={24} />
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Powered by Kensei AI. Your conversations help improve our
                service.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
