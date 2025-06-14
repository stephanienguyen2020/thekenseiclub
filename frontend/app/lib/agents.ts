import { fetchNewsItems } from "./news";
import { tradeAgent } from "./tradingBot";

export async function agent(input: string) {
  // This function appears to be a placeholder. For now, just delegate to processUserQuery
  return await processUserQuery(input);
}

/**
 * Processes a user query to determine if it's about news, token trading, or market analysis
 * @param userInput The user's message
 * @returns An object containing the query type and the result of processing the query
 */
export async function processUserQuery(userInput: string) {
  // Define the prompt for GPT-4 to determine the query type
  const queryTypePrompt = `
You are an AI assistant that helps users with three types of queries:
1. News queries - where users ask for news or information about a topic
2. Token trading queries - where users want to buy or sell tokens
3. Market analysis queries - where users ask for market sentiments, whale movements, or technical analysis

Your task is to analyze the user's input and determine which type of query it is.

Examples of news queries:
- "Show me news about Bitcoin"
- "What's happening with Ethereum lately?"
- "Tell me about recent developments in AI"
- "Latest news on cryptocurrency"
- "Updates on blockchain technology"

Examples of token trading queries:
- "Buy 10 tokens of SUI"
- "I want to sell 25 XYZ tokens"
- "Purchase 5 SUI tokens"
- "Sell 15 tokens"
- "Buy 100 PEPE"

Examples of market analysis queries:
- "Show whale movements for $SUI"
- "What's the market sentiment for Bitcoin?"
- "Analyze the price trend of Ethereum"
- "Whale activity on Solana"
- "Market fear and greed index"
- "Show me large transactions for SUI"

Respond with a JSON object with the following structure:
{
  "queryType": "NEWS" | "TOKEN_TRADING" | "MARKET_ANALYSIS"
}

User input: "${userInput}"
`;

  try {
    // Call our secure API to determine the query type
    const response = await fetch("/api/openai/query-processor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userInput, type: "query-type" }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to process query");
    }

    const queryTypeResult = await response.json();

    // Process the query based on its type
    if (queryTypeResult.queryType === "NEWS") {
      // If it's a news query, use the existing extractTermsAndFetchNews function
      const newsResult = await extractTermsAndFetchNews(userInput);
      return {
        queryType: "NEWS",
        result: newsResult,
      };
    } else if (queryTypeResult.queryType === "TOKEN_TRADING") {
      // If it's a token trading query, use the tradeAgent function
      const tradingResult = await tradeAgent(userInput);
      return {
        queryType: "TOKEN_TRADING",
        result: tradingResult,
      };
    } else {
      // If it's a market analysis query, use the marketAnalysisAgent function
      const analysisResult = await marketAnalysisAgent(userInput);
      return {
        queryType: "MARKET_ANALYSIS",
        result: analysisResult,
      };
    }
  } catch (error) {
    console.error("Error processing user query:", error);
    throw error;
  }
}

/**
 * Processes market analysis queries including whale movements and market sentiment
 * @param userInput The user's message asking for market analysis
 * @returns An object containing the analysis type and relevant data
 */
export async function marketAnalysisAgent(userInput: string) {
  // Extract analysis type and parameters
  const analysisPrompt = `
You are a market analysis AI. Analyze the user's request and determine what type of market analysis they want:

Types:
1. WHALE_MOVEMENTS - Large transactions, whale activity
2. MARKET_SENTIMENT - Overall market mood, fear/greed
3. TECHNICAL_ANALYSIS - Price trends, patterns, indicators
4. GENERAL - General market analysis

Also extract:
- token/symbol if mentioned (e.g., SUI, BTC, ETH)
- timeframe if mentioned (e.g., 24h, 7d, 1M)

Respond with JSON:
{
  "analysisType": "WHALE_MOVEMENTS" | "MARKET_SENTIMENT" | "TECHNICAL_ANALYSIS" | "GENERAL",
  "token": "extracted token symbol or null",
  "timeframe": "extracted timeframe or 24h"
}

User input: "${userInput}"
`;

  try {
    const response = await fetch("/api/openai/query-processor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userInput, type: "market-analysis" }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to analyze market query");
    }

    const analysisParams = await response.json();

    // Based on analysis type, fetch relevant data
    switch (analysisParams.analysisType) {
      case "WHALE_MOVEMENTS":
        return await getWhaleMovements(
          analysisParams.token || "SUI",
          analysisParams.timeframe || "24h"
        );

      case "MARKET_SENTIMENT":
        return await getMarketSentiment(analysisParams.token || "SUI");

      case "TECHNICAL_ANALYSIS":
        return await getTechnicalAnalysis(
          analysisParams.token || "SUI",
          analysisParams.timeframe || "24h"
        );

      default:
        return await getGeneralMarketAnalysis(analysisParams.token || "SUI");
    }
  } catch (error) {
    console.error("Error in market analysis:", error);
    throw error;
  }
}

/**
 * Fetches whale movements data for a specific token
 */
async function getWhaleMovements(token: string, timeframe: string) {
  // Mock data for whale movements - in production, this would connect to real APIs
  const mockWhaleData = [
    {
      txHash: "0x1234...abcd",
      amount: "1,250,000",
      amountUSD: "$2,875,000",
      type: "BUY",
      exchange: "Binance",
      timestamp: "2 hours ago",
      walletAddress: "0x789a...ef12",
    },
    {
      txHash: "0x5678...cdef",
      amount: "850,000",
      amountUSD: "$1,955,000",
      type: "SELL",
      exchange: "Coinbase",
      timestamp: "5 hours ago",
      walletAddress: "0xabcd...1234",
    },
    {
      txHash: "0x9abc...3456",
      amount: "2,100,000",
      amountUSD: "$4,830,000",
      type: "TRANSFER",
      exchange: "Unknown Wallet",
      timestamp: "8 hours ago",
      walletAddress: "0xdef0...5678",
    },
  ];

  return {
    analysisType: "WHALE_MOVEMENTS",
    token: token.toUpperCase(),
    timeframe,
    data: mockWhaleData,
    summary: `Found ${
      mockWhaleData.length
    } large transactions for ${token.toUpperCase()} in the last ${timeframe}. Total volume: $9.66M with mixed buy/sell pressure.`,
  };
}

/**
 * Fetches market sentiment data
 */
async function getMarketSentiment(token: string) {
  // Mock sentiment data
  const mockSentimentData = {
    overallSentiment: "BULLISH",
    fearGreedIndex: 72,
    socialMentions: {
      positive: 65,
      negative: 25,
      neutral: 10,
    },
    technicalIndicators: {
      RSI: 58,
      MACD: "BULLISH_CROSSOVER",
      MovingAverages: "ABOVE_20_50_MA",
    },
    volume24h: "$125.6M",
    priceChange24h: "+8.2%",
  };

  return {
    analysisType: "MARKET_SENTIMENT",
    token: token.toUpperCase(),
    data: mockSentimentData,
    summary: `${token.toUpperCase()} shows bullish sentiment with Fear & Greed Index at 72 (Greed). Social sentiment is 65% positive with strong technical indicators.`,
  };
}

/**
 * Fetches technical analysis data
 */
async function getTechnicalAnalysis(token: string, timeframe: string) {
  const mockTechnicalData = {
    currentPrice: "$2.30",
    priceChange: "+8.2%",
    support: "$2.15",
    resistance: "$2.45",
    volume: "$125.6M",
    indicators: {
      RSI: 58,
      MACD: "BULLISH",
      BollingerBands: "MIDDLE",
      StochasticRSI: 0.72,
    },
    trend: "UPTREND",
  };

  return {
    analysisType: "TECHNICAL_ANALYSIS",
    token: token.toUpperCase(),
    timeframe,
    data: mockTechnicalData,
    summary: `${token.toUpperCase()} is in an uptrend at $2.30 (+8.2%). Support at $2.15, resistance at $2.45. RSI at 58 suggests room for growth.`,
  };
}

/**
 * Fetches general market analysis
 */
async function getGeneralMarketAnalysis(token: string) {
  const mockGeneralData = {
    price: "$2.30",
    marketCap: "$6.8B",
    volume24h: "$125.6M",
    circulatingSupply: "2.95B",
    rank: 12,
    priceChange: {
      "1h": "+1.2%",
      "24h": "+8.2%",
      "7d": "+15.4%",
      "30d": "+23.7%",
    },
  };

  return {
    analysisType: "GENERAL",
    token: token.toUpperCase(),
    data: mockGeneralData,
    summary: `${token.toUpperCase()} is trading at $2.30 with a market cap of $6.8B (Rank #12). Strong performance: +8.2% (24h), +15.4% (7d), +23.7% (30d).`,
  };
}

/**
 * Extracts search and filter terms from user input using GPT-4 and fetches relevant news articles
 * @param userInput The user's message asking for news
 * @returns An object containing the extracted terms and the fetched news articles
 */
export async function extractTermsAndFetchNews(userInput: string) {
  // Define the prompt for GPT-4 to extract search and filter terms
  const extractionPrompt = `
You are an AI assistant that helps users find relevant news articles. 
Your task is to analyze the user's input and extract:
1. A search term - used for querying the news API (should be concise, use + for multi-word terms)
2. A filter term - used for filtering the results (can be more descriptive)

For example:
- If the user asks "Show me news about Bitcoin price", you might extract:
  - Search term: "Bitcoin+price"
  - Filter term: "Bitcoin price"
- If the user asks "What's happening with Ethereum lately?", you might extract:
  - Search term: "Ethereum"
  - Filter term: "Ethereum"
- If the user asks "Tell me about recent developments in AI", you might extract:
  - Search term: "artificial+intelligence+developments"
  - Filter term: "AI development"

Respond with a JSON object containing only these two fields:
{
  "searchTerm": "the extracted search term",
  "filterTerm": "the extracted filter term"
}

User input: "${userInput}"
`;

  try {
    // Call our secure API to extract search and filter terms
    const response = await fetch("/api/openai/query-processor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userInput, type: "extract-terms" }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to extract terms");
    }

    const extractedTerms = await response.json();

    // Fetch news items using the extracted terms
    const newsItems = await fetchNewsItems({
      searchTerm: extractedTerms.searchTerm,
      filterTerm: extractedTerms.filterTerm,
    });

    // Return both the extracted terms and the news items
    return {
      extractedTerms,
      newsItems,
    };
  } catch (error) {
    console.error("Error extracting terms or fetching news:", error);
    throw error;
  }
}

export async function getTokenTags(userInput: string) {
  const prompt = `
You are an AI classifier for meme tokens in the crypto space. Your task is to analyze the token information and classify it into tribes and provide relevant meme metadata.

Token Information to analyze:
${userInput}

Classify the token into one of these primary tribes:
1. Canine Clan (dog-related tokens)
2. Feline Syndicate (cat-related tokens)
3. Aquatic Order (sea/water-related tokens)
4. Wildcard Degens (other meme tokens)

Return the analysis in the following JSON format:
{
  "tribe": {
    "name": "primary tribe name",
    "confidence": "confidence score 1-100",
    "subCategory": "specific category within tribe"
  }
}
`;

  try {
    // Call our secure API to get token tags
    const response = await fetch("/api/openai/query-processor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userInput, type: "token-tags" }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get token tags");
    }

    const result = await response.json();

    // Add timestamp and version
    return {
      ...result,
      timestamp: new Date().toISOString(),
      version: "1.0",
      analysisType: "meme-tribe-classification",
    };
  } catch (error: any) {
    console.error("Error in getTokenTags:", error);
    throw new Error(
      `Failed to analyze token: ${error.message || "Unknown error"}`
    );
  }
}
