"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import {
  Brain,
  Send,
  Loader2,
  Users,
  Activity,
  Droplets,
  Twitter,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

import { apiClient } from "@/app/lib/chat";

import {
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { toast, useToast } from "@/hooks/use-toast";
import { NewsTickerWidget } from "@/app/chatbot/components/NewsTickerWidget";
import { ThinkingDots } from "@/components/ui/thinking-dots";

type UUID = string;
type Content = {
  text: string;
  attachments?: Array<{
    url: string;
    contentType: string;
    title: string;
  }>;
};
interface IAttachment {
  url: string;
  contentType: string;
  title: string;
}
type News = {
  author: string;
  content: string;
  description: string;
  publishedAt: string;
  source: { id: null; name: string };
  title: string;
  url: string;
  urlToImage: string;
};

type ExtraContentFields = {
  user: string;
  createdAt: number;
  isLoading?: boolean;
  data?: {
    articles: News[];
  };
};

type ContentWithUser = Content & ExtraContentFields;

interface Message {
  role: "user" | "assistant";
  content: string;
}

function CoinChatContent({ symbol }: { symbol: string }) {
  const agentId: UUID = "c3bd776c-4465-037f-9c7a-bf94dfba78d9";
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  // Retrieve messages from the query cache
  const messages: ContentWithUser[] =
    queryClient.getQueryData(["messages", agentId]) || [];

  const [userWalletId, setUserWalletId] = useState<string | null>(null);

  useEffect(() => {
    // This code only runs on the client side
    const storedWalletId = localStorage.getItem("userAddress");
    setUserWalletId(storedWalletId);
  }, []);

  const handleSendMessage = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!input || isLoading) return;

    setIsLoading(true);

    const attachments: IAttachment[] | undefined = selectedFile
      ? [
          {
            url: URL.createObjectURL(selectedFile),
            contentType: selectedFile.type,
            title: selectedFile.name,
          },
        ]
      : undefined;

    const userMessage = {
      text: input + " about " + symbol,
      user: "user",
      createdAt: Date.now(),
      attachments,
    };

    const thinkingMessage = {
      text: "Cooking up my response...",
      user: "Sage",
      createdAt: Date.now() + 1,
      isLoading: true,
    };

    queryClient.setQueryData(
      ["messages", agentId],
      (old: ContentWithUser[] = []) => [...old, userMessage, thinkingMessage]
    );

    sendMessageMutation.mutate({
      message: input + " about " + symbol + " token",
      selectedFile: selectedFile ? selectedFile : null,
    });

    setSelectedFile(null);
    setInput("");
    if (formRef.current) formRef.current.reset();
  };

  const handleInsightRequest = (insightType: string) => {
    const insightPrompts: Record<string, string> = {
      "Holder Analysis": `Analyze the holder distribution for ${symbol}. Who are the top holders and is there any concerning concentration?`,
      "Liquidity Pools": `What are the main liquidity pools for ${symbol}? How stable is the liquidity?`,
      "Twitter Sentiment": `What's the current Twitter sentiment around ${symbol}? Any notable influencers talking about it?`,
      "Trading Activity": `Analyze recent trading activity for ${symbol}. Any unusual patterns or whale movements?`,
    };

    const prompt =
      insightPrompts[insightType] ||
      `Tell me about ${insightType} for ${symbol}`;
    setInput(prompt);
    handleSendMessage();
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationKey: ["send_message", agentId],
    mutationFn: ({
      message,
      selectedFile,
    }: {
      message: string;
      selectedFile?: File | null;
    }) => apiClient.sendMessage(agentId, message, selectedFile, userWalletId),
    onSuccess: (newMessages: ContentWithUser[]) => {
      queryClient.setQueryData(
        ["messages", agentId],
        (old: ContentWithUser[] = []) => [
          ...old.filter((msg) => !msg.isLoading),
          ...newMessages.map((msg) => ({
            ...msg,
            createdAt: Date.now(),
          })),
        ]
      );
      setIsLoading(false);
    },
    onError: (e) => {
      // Remove the thinking message on error
      queryClient.setQueryData(
        ["messages", agentId],
        (old: ContentWithUser[] = []) => old.filter((msg) => !msg.isLoading)
      );

      // Add an error message
      const errorMessage = {
        text: `Sorry, I encountered an error: ${e.message}. Please try again.`,
        user: "Sage",
        createdAt: Date.now(),
      };

      queryClient.setQueryData(
        ["messages", agentId],
        (old: ContentWithUser[] = []) => [...old, errorMessage]
      );

      toast({
        variant: "destructive",
        title: "Unable to send message",
        description: e.message,
      });

      setIsLoading(false);
    },
  });

  const renderMessageContent = (message: ContentWithUser) => {
    if (message.data) {
      return (
        <div className="w-full">
          <NewsTickerWidget news={message.data.articles} />
        </div>
      );
    }
    return (
      <p className="whitespace-pre-wrap">
        {message.text}
        {message.isLoading && <ThinkingDots />}
      </p>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 rounded-t-lg bg-black/20"></div>

      <Card className="bg-[#1A1B1E] border-none w-full h-full overflow-hidden shadow-xl flex flex-col">
        <CardContent className="flex flex-col h-full p-0">
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
                    msg.user === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl text-sm max-w-[80%] ${
                      msg.user === "user"
                        ? "bg-blue-600 text-white self-end"
                        : "bg-[#2A2B2E] text-gray-200 self-start"
                    }`}
                  >
                    {renderMessageContent(msg)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
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
                onClick={() => handleInsightRequest("Holder Analysis")}
              >
                <Users className="flex-shrink-0 w-4 h-4 mr-1" />
                <span className="truncate">Holder Analysis</span>
              </Button>
              <Button
                variant="outline"
                className="bg-[#2A2B2E] border-[#353538] text-gray-300 hover:bg-[#353538] hover:text-white flex items-center justify-start text-xs sm:text-sm"
                onClick={() => handleInsightRequest("Liquidity Pools")}
              >
                <Droplets className="flex-shrink-0 w-4 h-4 mr-1" />
                <span className="truncate">Liquidity Pools</span>
              </Button>
              <Button
                variant="outline"
                className="bg-[#2A2B2E] border-[#353538] text-gray-300 hover:bg-[#353538] hover:text-white flex items-center justify-start text-xs sm:text-sm"
                onClick={() => handleInsightRequest("Twitter Sentiment")}
              >
                <Twitter className="flex-shrink-0 w-4 h-4 mr-1" />
                <span className="truncate">Twitter Sentiment</span>
              </Button>
              <Button
                variant="outline"
                className="bg-[#2A2B2E] border-[#353538] text-gray-300 hover:bg-[#353538] hover:text-white flex items-center justify-start text-xs sm:text-sm"
                onClick={() => handleInsightRequest("Trading Activity")}
              >
                <Activity className="flex-shrink-0 w-4 h-4 mr-1" />
                <span className="truncate">Trading Activity</span>
              </Button>
            </div>
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            ref={formRef}
            className="p-4 border-t border-[#2A2B2E] flex items-center gap-2 bg-[#1A1B1E]"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about trading insights..."
              className="flex-1 bg-[#2A2B2E] border-[#353538] focus-visible:ring-blue-600 text-white"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="text-white bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const CoinChat = ({ symbol }: { symbol: string }) => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <ThinkingDots />
        </div>
      }
    >
      <CoinChatContent symbol={symbol} />
    </Suspense>
  );
};

export default CoinChat;
