import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client server-side
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userInput, type } = await request.json();

    const apiKey = process.env.OPENAI_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 401 }
      );
    }

    if (!userInput) {
      return NextResponse.json(
        { error: "User input is required" },
        { status: 400 }
      );
    }

    if (type === "query-type") {
      // Determine if the query is about news or token trading
      const queryTypePrompt = `
You are an AI assistant that helps users with two types of queries:
1. News queries - where users ask for news or information about a topic
2. Token trading queries - where users want to buy or sell tokens

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

Respond with a JSON object with the following structure:
{
  "queryType": "NEWS" | "TOKEN_TRADING"
}

User input: "${userInput}"
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: queryTypePrompt,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content received from OpenAI");
      }

      return NextResponse.json(JSON.parse(content));
    } else if (type === "extract-terms") {
      // Extract search and filter terms for news
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

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: extractionPrompt,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content received from OpenAI");
      }

      return NextResponse.json(JSON.parse(content));
    } else if (type === "token-tags") {
      // Get token tags classification
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

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content received from OpenAI");
      }

      return NextResponse.json(JSON.parse(content));
    } else {
      return NextResponse.json(
        { error: "Invalid type parameter" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing query:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
}
