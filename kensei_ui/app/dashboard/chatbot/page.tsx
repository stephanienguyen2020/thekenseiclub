"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles, Trash2, Download } from "lucide-react"

export default function ChatbotPage() {
  const [message, setMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "bot"; message: string; timestamp: string }[]>([
    {
      role: "bot",
      message:
        "Hi there! I'm your Kensei AI assistant. I can help you with token information, market analysis, and social media strategy. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when chat history updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatHistory])

  const handleSendMessage = () => {
    if (!message.trim()) return

    // Add user message to chat
    const userMessage = {
      role: "user" as const,
      message: message.trim(),
      timestamp: new Date().toLocaleTimeString(),
    }

    setChatHistory((prev) => [...prev, userMessage])
    setMessage("")
    setIsTyping(true)

    // Simulate bot response after a delay
    setTimeout(() => {
      let botResponse = ""

      if (message.toLowerCase().includes("token") || message.toLowerCase().includes("coin")) {
        botResponse =
          "I can help you analyze token performance and market trends. Which specific token are you interested in? I have data on PEPE, DOGE, SHIB, and many other popular tokens."
      } else if (message.toLowerCase().includes("market") || message.toLowerCase().includes("price")) {
        botResponse =
          "The current market is showing mixed signals. Some meme coins like PEPE are up 12% in the last 24 hours, while others are consolidating. Would you like a detailed analysis of any specific token?"
      } else if (
        message.toLowerCase().includes("social") ||
        message.toLowerCase().includes("tweet") ||
        message.toLowerCase().includes("post")
      ) {
        botResponse =
          "For effective social media strategy, I recommend posting content that resonates with your community. Memes, token updates, and governance proposals tend to get the most engagement. Would you like me to help draft a tweet for your token?"
      } else if (message.toLowerCase().includes("proposal") || message.toLowerCase().includes("governance")) {
        botResponse =
          "Governance proposals are a great way to engage your community. The most successful proposals tend to be clear, actionable, and beneficial to the token ecosystem. Would you like help drafting a proposal?"
      } else if (message.toLowerCase().includes("autoshill") || message.toLowerCase().includes("shill")) {
        botResponse =
          "The AutoShill feature automatically promotes your token across various platforms using AI-generated content tailored to your token's unique characteristics. Would you like me to set up an AutoShill campaign for one of your tokens?"
      } else {
        botResponse =
          "I'm here to help with all your token needs! I can provide market analysis, social media strategies, governance insights, and more. Feel free to ask about specific tokens or features."
      }

      const botMessage = {
        role: "bot" as const,
        message: botResponse,
        timestamp: new Date().toLocaleTimeString(),
      }

      setChatHistory((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setChatHistory([
      {
        role: "bot",
        message: "Chat cleared. How can I help you today?",
        timestamp: new Date().toLocaleTimeString(),
      },
    ])
  }

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
            {/* Chat Header - keep as is */}
            <div className="bg-[#0039C6] p-4 border-b-4 border-black">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#c0ff00] flex items-center justify-center border-2 border-black">
                  <Bot size={24} className="text-black" />
                </div>
                <div>
                  <div className="text-white font-bold">Kensei AI Assistant</div>
                  <div className="text-gray-300 text-xs">Powered by GPT-4o</div>
                </div>
                <div className="ml-auto bg-[#c0ff00] px-2 py-1 rounded-full text-xs font-bold border-2 border-black flex items-center gap-1">
                  <Sparkles size={12} />
                  <span>AI</span>
                </div>
              </div>
            </div>

            {/* Chat Messages - keep as is */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map((chat, index) => (
                <div key={index} className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] p-4 rounded-xl border-2 border-black ${
                      chat.role === "user" ? "bg-[#c0ff00] text-black" : "bg-[#0046F4] text-white"
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
                      <div>
                        <div className="font-bold mb-1">
                          {chat.role === "user" ? "You" : "Kensei AI"}
                          <span className="text-xs font-normal ml-2 opacity-70">{chat.timestamp}</span>
                        </div>
                        <div className="whitespace-pre-wrap">{chat.message}</div>
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
                          <span className="text-xs font-normal ml-2 opacity-70">{new Date().toLocaleTimeString()}</span>
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

            {/* Quick Prompts - Add this section before the Chat Input */}
            <div className="p-4 border-t-4 border-black bg-gray-50">
              <h3 className="text-sm font-bold mb-2">Quick Prompts</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  className="px-3 py-1 rounded-xl border-2 border-black bg-gray-100 hover:bg-[#c0ff00] transition-colors text-sm"
                  onClick={() => {
                    setMessage("What's the current market trend for meme coins?")
                    setTimeout(() => handleSendMessage(), 100)
                  }}
                >
                  Market trends
                </button>
                <button
                  className="px-3 py-1 rounded-xl border-2 border-black bg-gray-100 hover:bg-[#c0ff00] transition-colors text-sm"
                  onClick={() => {
                    setMessage("Help me draft a tweet about my PEPE token")
                    setTimeout(() => handleSendMessage(), 100)
                  }}
                >
                  Draft tweet
                </button>
                <button
                  className="px-3 py-1 rounded-xl border-2 border-black bg-gray-100 hover:bg-[#c0ff00] transition-colors text-sm"
                  onClick={() => {
                    setMessage("How do I create an effective governance proposal?")
                    setTimeout(() => handleSendMessage(), 100)
                  }}
                >
                  Governance help
                </button>
                <button
                  className="px-3 py-1 rounded-xl border-2 border-black bg-gray-100 hover:bg-[#c0ff00] transition-colors text-sm"
                  onClick={() => {
                    setMessage("Explain how AutoShill works")
                    setTimeout(() => handleSendMessage(), 100)
                  }}
                >
                  About AutoShill
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
                Powered by Kensei AI. Your conversations help improve our service.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
