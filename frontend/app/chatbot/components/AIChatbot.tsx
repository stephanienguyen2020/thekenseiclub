"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import {
  Fish,
  ArrowLeftRight,
  LineChart,
  Newspaper,
  Send,
  Copy,
  Volume2,
  RefreshCw,
  Globe,
  Mic,
  Bot,
  Brain,
  Pencil,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams, useParams } from "next/navigation";
import { useChatStore } from "../store";
import { Message as BaseMessage } from "@/types/chat";
import ThinkingMessage from "./ThinkingMessage";
import { sendChatMessage } from "../service";
import { ChatSwapInterface } from "./ChatSwapInterface/index";
import type { Message, SwapMessageContent } from "@/types/chat";

// Define local types to avoid dependency on @elizaos/core
type UUID = string;
type Content = {
  text: string;
  attachments?: Array<{
    url: string;
    contentType: string;
    title: string;
  }>;
};

import { apiClient } from "@/app/lib/chat";

import {
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { toast, useToast } from "@/hooks/use-toast";
import { NewsTickerWidget } from "./NewsTickerWidget";
import { ThinkingDots } from "@/components/ui/thinking-dots";

// Map of icon components
const icons = {
  Fish,
  ArrowLeftRight,
  LineChart,
  Newspaper,
};

interface ActionType {
  iconName: keyof typeof icons;
  label: string;
  prompt: string;
}

const quickActions: ActionType[] = [
  {
    iconName: "Fish",
    label: "Whale Activity",
    prompt: "Show me recent whale activity. What are they dumping and buying?",
  },
  {
    iconName: "ArrowLeftRight",
    label: "Compare Coins",
    prompt:
      "Compare the top trending meme coins. Show key metrics and differences.",
  },
  {
    iconName: "LineChart",
    label: "Stalker Mode",
    prompt: "Which tokens have strong holders but low volume?",
  },
  {
    iconName: "Newspaper",
    label: "News Scanner",
    prompt:
      "Show me the latest news and social media sentiment about meme coins.",
  },
];

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
  walletId?: string;
};

type ContentWithUser = Content & ExtraContentFields;

// Wrap the content component that uses useSearchParams
function AIChatbotContent() {
  const agentId: UUID = "c3bd776c-4465-037f-9c7a-bf94dfba78d9";
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(
    null
  );
  const [editingContent, setEditingContent] = useState("");
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFollowUpActions, setShowFollowUpActions] = useState(false);
  const searchParams = useSearchParams();
  const [showSwapInterface, setShowSwapInterface] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [userWalletId, setUserWalletId] = useState<string | null>(null);

  useEffect(() => {
    // This code only runs on the client side
    const storedWalletId = localStorage.getItem("userAddress");
    setUserWalletId(storedWalletId);
  }, []);

  console.log("user wallet ID", userWalletId);

  // Type guard for SwapMessageContent
  const isSwapContent = (content: any): content is SwapMessageContent =>
    typeof content === "object" && content.type === "swap";

  const queryClient = useQueryClient();

  const messages =
    queryClient.getQueryData<ContentWithUser[]>(["messages", agentId]) || [];

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input) return;

    setHasInteracted(true);
    setShowFollowUpActions(false);

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
      text: input,
      user: "user",
      createdAt: Date.now(),
      attachments,
      userWalletId,
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
      message: input,
      selectedFile: selectedFile ? selectedFile : null,
    });

    setSelectedFile(null);
    setInput("");
    formRef.current?.reset();
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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
      setShowFollowUpActions(true);
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
    },
  });

  // Check if we need to start a new chat
  useEffect(() => {
    if (searchParams.get("new") === "true") {
      startNewChat();
    }
  }, [searchParams.get("new"), searchParams.get("t")]);

  // Follow-up quick actions based on previous interaction
  const followUpActions = [
    {
      label: "Quick Swap",
      prompt: "Help me swap these tokens on the best DEX with lowest fees",
      icon: <ArrowLeftRight className="w-4 h-4" />,
    },
    {
      label: "Latest News",
      prompt: "Show me the latest news about these tokens",
      icon: <Newspaper className="w-4 h-4" />,
    },
    {
      label: "Price Alert",
      prompt: "Set a price alert for these tokens",
      icon: <LineChart className="w-4 h-4" />,
    },
  ];

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (input.length > 0) {
      scrollToBottom();
    }
  }, [input, scrollToBottom]);

  const handleSwapComplete = (
    fromAmount: string,
    fromToken: string,
    toAmount: string,
    toToken: string
  ) => {
    // Add a success message to the chat
    const successMessage = {
      text: `✅ Successfully swapped ${fromAmount} ${fromToken} to ${toAmount} ${toToken}`,
      user: "assistant",
      createdAt: Date.now(),
    };

    queryClient.setQueryData(
      ["messages", agentId],
      (old: ContentWithUser[] = []) => [...old, successMessage]
    );

    setShowSwapInterface(false);
  };

  const handleQuickAction = (prompt: string) => {
    setHasInteracted(true);
    setShowFollowUpActions(false);
    setInput(prompt);

    const fakeEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>;

    handleSendMessage(fakeEvent);
  };

  // Function to start a new chat
  const startNewChat = () => {
    queryClient.setQueryData(["messages", agentId], []);
    setInput("");
    setHasInteracted(false);
    setShowFollowUpActions(false);
  };

  const handleCopy = (content: string | SwapMessageContent) => {
    if (typeof content === "string") {
      navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        duration: 2000,
      });
    }
  };

  const handleSpeak = (content: string | SwapMessageContent) => {
    if (typeof content === "string") {
      const utterance = new SpeechSynthesisUtterance(content);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleEdit = (index: number, message: ContentWithUser) => {
    setEditingMessageIndex(index);
    if (typeof message.text === "string") {
      setEditingContent(message.text);
    }
  };

  const handleSaveEdit = () => {
    if (editingMessageIndex === null) return;

    // Update the message in the store
    queryClient.setQueryData(
      ["messages", agentId],
      (old: ContentWithUser[] = []) =>
        old.map((msg, idx) =>
          idx === editingMessageIndex ? { ...msg, text: editingContent } : msg
        )
    );

    setEditingMessageIndex(null);
    setEditingContent("");
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join("");

      setInput(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setInput(`Uploaded file: ${file.name}`);
    }
  };

  const handleRegenerate = async (index: number) => {
    // Get the previous user message
    const previousUserMessage = messages
      .slice(0, index)
      .reverse()
      .find((m) => m.user === "user");

    if (!previousUserMessage) return;

    // Remove the bot message and all messages after it
    const newMessages = messages.slice(0, index);

    // Update the store with the new messages
    queryClient.setQueryData(["messages", agentId], newMessages);

    // Add thinking message
    const thinkingMessage = {
      text: "Cooking up my response...",
      user: "Sage",
      createdAt: Date.now(),
      isLoading: true,
    };

    queryClient.setQueryData(
      ["messages", agentId],
      (old: ContentWithUser[] = []) => [...old, thinkingMessage]
    );

    // Regenerate response
    sendMessageMutation.mutate({
      message: previousUserMessage.text,
      selectedFile: null,
    });
  };

  const renderMessageContent = (message: ContentWithUser) => {
    console.log("Rendering message:", message);
    if (message.data) {
      return (
        <div className="w-full">
          <NewsTickerWidget news={message.data.articles} />
        </div>
      );
    }
    console.log("IM here?", message);
    return (
      <p className="whitespace-pre-wrap font-clean">
        {message.text}
        {message.isLoading && <ThinkingDots />}
      </p>
    );
  };

  return (
    <div className="ml-10 mr-10 mx-auto flex flex-col h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] pt-12">
      <AnimatePresence>
        {!hasInteracted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="py-8 mt-4 space-y-6 text-center"
          >
            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-primary/10">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">
              HyperSonic{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                Bot
              </span>
            </h1>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Quick Actions */}
      <AnimatePresence>
        {!hasInteracted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-4"
          >
            {quickActions.map((action) => {
              const Icon = icons[action.iconName];
              return (
                <Card
                  key={action.label}
                  className="p-4 cursor-pointer bg-[#2A2B2E] border-[#353538] text-gray-300 hover:bg-[#353538] hover:text-white transition-colors"
                  onClick={() => handleQuickAction(action.prompt)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                </Card>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 p-4 mt-2 space-y-4 overflow-y-auto"
      >
        {messages.map((message, index) => {
          const isBot = message.user === "Sage" || message.data;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3",
                isBot ? "items-start" : "items-start flex-row-reverse"
              )}
            >
              <Avatar>
                {isBot ? (
                  <>
                    <AvatarImage src="https://example.com/bot-meme-avatar.png" />
                    <AvatarFallback>
                      <Bot className="w-5 h-5" />
                    </AvatarFallback>
                  </>
                ) : (
                  <>
                    <AvatarImage src="https://example.com/user-meme-avatar.png" />
                    <AvatarFallback>U</AvatarFallback>
                  </>
                )}
              </Avatar>
              <div
                className={cn(
                  "flex flex-col gap-2",
                  isBot ? "items-start" : "items-end"
                )}
              >
                {editingMessageIndex === index ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="min-w-[300px]"
                      autoFocus
                    />
                    <Button size="sm" onClick={handleSaveEdit}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingMessageIndex(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2 max-w-[80%]",
                      isBot
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {isBot ? (
                      message.isLoading ? (
                        <ThinkingMessage />
                      ) : (
                        <div className="text-sm whitespace-pre-wrap">
                          {renderMessageContent(message)}
                        </div>
                      )
                    ) : (
                      <div className="text-sm whitespace-pre-wrap">
                        {renderMessageContent(message)}
                      </div>
                    )}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="flex items-center gap-2 p-2 mt-2 rounded bg-background/10">
                        <Plus className="w-4 h-4" />
                        <a
                          href={message.attachments[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm underline"
                        >
                          {message.attachments[0].title}
                        </a>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                  {isBot ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6"
                        onClick={() => handleCopy(message.text)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6"
                        onClick={() => handleSpeak(message.text)}
                      >
                        <Volume2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6"
                        onClick={() => handleRegenerate(index)}
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6"
                        onClick={() => handleCopy(message.text)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6"
                        onClick={() => handleEdit(index, message)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </motion.div>

      {/* Follow-up Quick Actions */}
      <AnimatePresence>
        {showFollowUpActions && hasInteracted && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-4 py-3"
          >
            <div className="flex justify-center gap-4">
              {followUpActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="default"
                  className="bg-[#2A2B2E] border-[#353538] text-gray-300 hover:bg-[#353538] hover:text-white flex items-center justify-start text-sm gap-2 px-6 py-2 min-w-[160px]"
                  onClick={() => handleQuickAction(action.prompt)}
                >
                  <span className="text-primary">{action.icon}</span>
                  <span>{action.label}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="pt-4 mt-auto">
        <form ref={formRef} onSubmit={handleSendMessage} className="relative">
          <div className="relative flex items-center">
            <div className="absolute flex items-center gap-2 left-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="w-8 h-8"
              >
                <Globe className="w-4 h-4" />
              </Button>
            </div>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  formRef.current?.requestSubmit();
                }
              }}
              placeholder="Ask me anything..."
              className="pl-20 pr-24"
            />
            <div className="absolute flex items-center gap-2 right-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", isListening && "text-red-500")}
                onClick={handleVoiceInput}
              >
                <Mic className="w-4 h-4" />
              </Button>
              <Button
                type="submit"
                size="icon"
                className="w-8 h-8"
                disabled={!input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Export the main component with Suspense
export default function AIChatbot() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <ThinkingDots />
        </div>
      }
    >
      <AIChatbotContent />
    </Suspense>
  );
}
