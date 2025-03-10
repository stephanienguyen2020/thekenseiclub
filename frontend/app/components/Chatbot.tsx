"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Brain,
  Star,
  TrendingUp,
  Zap,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatCompletionChoice {
  message: {
    content: string;
    role: string;
  };
  finish_reason: string;
  index: number;
}

interface ChatCompletionResponse {
  id: string;
  choices: ChatCompletionChoice[];
  created: number;
  model: string;
  object: string;
}

const formatBotResponse = (text: string): string => {
  const formattedText = text
    .replace(/•/g, "\n•")
    .replace(/(\d+\.\s)/g, "\n$1")
    .replace(/(\*\*.*?\*\*)/g, "\n$1\n");

  return formattedText.replace(/\n{3,}/g, "\n\n").trim();
};

const getCurrentTime = () => {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your HyperSonic assistant. I can help you analyze meme coins, spot trends, and identify potential rugs. What would you like to know?",
      timestamp: getCurrentTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Reset chat when route changes
  useEffect(() => {
    setIsOpen(false);
  }, []);

  // Scroll to the bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: getCurrentTime(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Replace this with your actual API call
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const botResponseText = formatBotResponse(
        data.message || "Sorry, I didn't understand that."
      );

      const botMessage: Message = {
        role: "assistant",
        content: botResponseText,
        timestamp: getCurrentTime(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: getCurrentTime(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsightRequest = (insight: string) => {
    const userMessage: Message = {
      role: "user",
      content: `Tell me about ${insight}`,
      timestamp: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        "Meme Coin Analysis":
          "Meme coins typically show high volatility and are driven by community sentiment rather than fundamentals. Current trends show increased interest in utility-focused meme coins with actual use cases beyond speculation.",
        "Market Trends":
          "The current market is showing a bullish trend with increased institutional adoption. DeFi tokens are outperforming the market, while NFT-related tokens are experiencing a correction phase.",
        "Risk Assessment":
          "When assessing risk for crypto investments, consider: liquidity levels, developer activity, token distribution, smart contract audits, and community engagement. These factors help identify potential rug pulls.",
        "Portfolio Optimization":
          "For optimal portfolio management, consider a 60-30-10 allocation: 60% in established cryptocurrencies, 30% in mid-cap promising projects, and 10% in high-risk high-reward opportunities like new meme coins.",
      };

      const assistantMessage: Message = {
        role: "assistant",
        content: responses[insight] || `Let me analyze ${insight} for you...`,
        timestamp: getCurrentTime(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-96">
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Need Help?</span>
            </Button>
          </motion.div>
        )}

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full h-[500px] overflow-hidden"
          >
            <Card className="bg-[#1A1B1E] border-none w-full h-full overflow-hidden shadow-xl flex flex-col">
              <CardContent className="p-0 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-3 bg-black/20 backdrop-blur-sm border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs">
                      AI
                    </div>
                    <span className="font-medium">HyperSonic Assistant</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#1A1B1E]">
                  <AnimatePresence>
                    {messages.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-xl text-sm max-w-[80%] ${
                            msg.role === "user"
                              ? "bg-blue-600 text-white self-end"
                              : "bg-[#2A2B2E] text-gray-200 self-start"
                          }`}
                        >
                          {msg.content}
                          <div
                            className={`text-xs mt-1 ${
                              msg.role === "user"
                                ? "text-blue-200"
                                : "text-gray-400"
                            }`}
                          >
                            {msg.timestamp}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isLoading && (
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick Insight Buttons */}
                <div className="px-4 pt-3 pb-2 bg-[#1A1B1E] border-[#2A2B2E]">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Button
                      variant="outline"
                      className="bg-[#2A2B2E] border-[#353538] text-gray-300 hover:bg-[#353538] hover:text-white flex items-center justify-start text-xs sm:text-sm"
                      onClick={() => handleInsightRequest("Meme Coin Analysis")}
                    >
                      <Brain className="mr-1 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Meme Coin Analysis</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-[#2A2B2E] border-[#353538] text-gray-300 hover:bg-[#353538] hover:text-white flex items-center justify-start text-xs sm:text-sm"
                      onClick={() => handleInsightRequest("Market Trends")}
                    >
                      <TrendingUp className="mr-1 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Market Trends</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-[#2A2B2E] border-[#353538] text-gray-300 hover:bg-[#353538] hover:text-white flex items-center justify-start text-xs sm:text-sm"
                      onClick={() => handleInsightRequest("Risk Assessment")}
                    >
                      <Zap className="mr-1 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Risk Assessment</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-[#2A2B2E] border-[#353538] text-gray-300 hover:bg-[#353538] hover:text-white flex items-center justify-start text-xs sm:text-sm"
                      onClick={() =>
                        handleInsightRequest("Portfolio Optimization")
                      }
                    >
                      <Star className="mr-1 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Portfolio Optimization</span>
                    </Button>
                  </div>
                </div>

                {/* Input Area */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-[#2A2B2E] flex items-center gap-2 bg-[#1A1B1E]"
                >
                  <Input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about meme coins..."
                    className="flex-1 bg-[#2A2B2E] border-[#353538] focus-visible:ring-blue-600 text-white"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isLoading || !input.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
