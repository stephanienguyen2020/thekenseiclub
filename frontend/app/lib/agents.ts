import OpenAI from "openai";
import { fetchNewsItems } from "./news";
import { tradeAgent } from "./tradingBot";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Required for client-side usage
});

export async function agent(input: string) {
  const tradingPrompt = ``;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: tradingPrompt,
      },
    ],
  });
  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No content received from OpenAI");
  }
  // Parse the JSON response
  return JSON.parse(content);
}

/**
 * Processes a user query to determine if it's about news or token trading
 * @param userInput The user's message
 * @returns An object containing the query type and the result of processing the query
 */
export async function processUserQuery(userInput: string) {
  // Define the prompt for GPT-4 to determine the query type
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

  try {
    // Call OpenAI API to determine the query type
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

    // Parse the JSON response
    const queryTypeResult = JSON.parse(content);

    // Process the query based on its type
    if (queryTypeResult.queryType === "NEWS") {
      // If it's a news query, use the existing extractTermsAndFetchNews function
      const newsResult = await extractTermsAndFetchNews(userInput);
      return {
        queryType: "NEWS",
        result: newsResult
      };
    } else {
      // If it's a token trading query, use the tradeAgent function
      const tradingResult = await tradeAgent(userInput);
      return {
        queryType: "TOKEN_TRADING",
        result: tradingResult
      };
    }
  } catch (error) {
    console.error("Error processing user query:", error);
    throw error;
  }
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
    // Call OpenAI API to extract search and filter terms
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

    // Parse the JSON response
    const extractedTerms = JSON.parse(content);

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
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    // Parse and validate the response
    const result = JSON.parse(content);
    
    // Add timestamp and version
    return {
      ...result,
      timestamp: new Date().toISOString(),
      version: "1.0",
      analysisType: "meme-tribe-classification"
    };
  } catch (error: any) {
    console.error("Error in getTokenTags:", error);
    throw new Error(`Failed to analyze token: ${error.message || 'Unknown error'}`);
  }
}
