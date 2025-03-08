import type { Content, UUID, News } from "@/types/chat";
import OpenAI from "openai";

// Mock data for news articles
const mockNewsArticles = [
  {
    author: "CryptoNews",
    content:
      "Bitcoin reaches new all-time high as institutional adoption increases.",
    description:
      "Bitcoin has reached a new all-time high as more institutions adopt cryptocurrency.",
    publishedAt: new Date().toISOString(),
    source: { id: null, name: "CryptoNews" },
    title: "Bitcoin Reaches New All-Time High",
    url: "https://example.com/bitcoin-ath",
    urlToImage: "https://example.com/bitcoin.jpg",
    category: "Cryptocurrency",
  },
  {
    author: "MemeWatch",
    content:
      "Dogecoin sees surge in popularity following celebrity endorsements.",
    description: "Dogecoin price increases after celebrity tweets.",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    source: { id: null, name: "MemeWatch" },
    title: "Dogecoin Surges After Celebrity Endorsements",
    url: "https://example.com/dogecoin-surge",
    urlToImage: "https://example.com/dogecoin.jpg",
    category: "Meme Coins",
  },
  {
    author: "CryptoInsider",
    content: "Ethereum upgrade expected to reduce gas fees significantly.",
    description:
      "The upcoming Ethereum upgrade aims to address high transaction costs.",
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    source: { id: null, name: "CryptoInsider" },
    title: "Ethereum Upgrade to Reduce Gas Fees",
    url: "https://example.com/ethereum-upgrade",
    urlToImage: "https://example.com/ethereum.jpg",
    category: "DeFi",
  },
];

// Sample responses for different query types
const sampleResponses: Record<string, any> = {
  whale: {
    text: "Here's the latest whale activity I've detected:",
    data: null,
    content:
      "Recent whale movements show significant accumulation of BTC and ETH. In the last 24 hours:\n\n- Wallet 0x7a2...f3e moved 1,200 ETH to Binance\n- Wallet 0x3b5...a7d purchased 150 BTC from Coinbase\n- A dormant wallet holding 3,000 BTC since 2017 has become active\n\nThis suggests bullish sentiment among large holders.",
  },
  compare: {
    text: "Here's a comparison of trending meme coins:",
    data: null,
    content:
      "Comparing top meme coins by market metrics:\n\n1. DOGE: $0.12 | 24h: +5.2% | Vol: $1.2B | MC: $16.8B\n2. SHIB: $0.000028 | 24h: +3.7% | Vol: $890M | MC: $11.2B\n3. PEPE: $0.000012 | 24h: +15.3% | Vol: $420M | MC: $4.8B\n4. FLOKI: $0.0002 | 24h: +8.1% | Vol: $210M | MC: $1.9B\n\nPEPE showing strongest momentum with highest 24h gains.",
  },
  stalker: {
    text: "I've identified these tokens with strong holders but low volume:",
    data: null,
    content:
      "Tokens with strong holders but low trading volume:\n\n1. CULT: 85% held by diamond hands, only $120K daily volume\n2. BOTTO: 92% held by long-term holders, $80K daily volume\n3. LOOKS: 78% held by stakers, volume down 65% this month\n\nThese could be potential gems with reduced selling pressure, but also indicate low liquidity.",
  },
  news: {
    text: "Here's the latest crypto news:",
    data: {
      articles: mockNewsArticles,
    },
    content: "Latest crypto news and social sentiment:",
  },
  default: {
    text: "I'm your crypto assistant. I can help with market analysis, token research, and trading strategies.",
    data: null,
    content:
      "I'm your crypto assistant. I can help with market analysis, token research, and trading strategies. Try asking me about whale activity, comparing coins, or the latest news!",
  },
};

class ApiClient {
  private openai: OpenAI;

  constructor() {
    // Initialize OpenAI client with API key from environment variable
    this.openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });
  }

  async sendMessage(
    agentId: UUID,
    message: string,
    file?: File | null
  ): Promise<any[]> {
    try {
      // Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful crypto assistant that provides information about cryptocurrency markets, tokens, and trading strategies.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
      });

      // Extract the response
      const responseContent =
        completion.choices[0]?.message?.content ||
        "I'm sorry, I couldn't process that request.";

      return [
        {
          id: `msg-${Date.now()}`,
          type: "text",
          text: responseContent,
          content: responseContent,
          user: "assistant",
          timestamp: Date.now(),
          data: null,
        },
      ];
    } catch (error) {
      console.error("OpenAI API Error:", error);
      return [
        {
          id: `msg-${Date.now()}`,
          type: "text",
          text: "Sorry, I encountered an error processing your request.",
          content: "Sorry, I encountered an error processing your request.",
          user: "assistant",
          timestamp: Date.now(),
          data: null,
        },
      ];
    }
  }
}

export const apiClient = new ApiClient();
