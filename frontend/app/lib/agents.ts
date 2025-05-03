import OpenAI from "openai";
import { fetchNewsItems } from "./news";

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
