import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Required for client-side usage
});

export async function tradeAgent(input: string): Promise<{
  action: "BUY" | "SELL" | "GENERAL",
  amount: string,
  message: string,
}> {
  const tradingPrompt = `You are a trading assistant that processes user commands.

User query: "${input}"

Analyze the query and determine if it's a BUY command, SELL command, or a GENERAL message.
Return a JSON object with the following structure:
{
  "action": "BUY" | "SELL" | "GENERAL",
  "amount": string, // Only include when action is BUY or SELL. This is the numeric amount of tokens to buy or sell.
  "message": string // Only include when action is GENERAL. This is your response to the user's query.
}

Examples:
1. User: "Buy 10 tokens of ABC"
   Response: {"action": "BUY", "amount": 10}

2. User: "I want to sell 25 XYZ tokens"
   Response: {"action": "SELL", "amount": 25}

3. User: "What is the current price of token A?"
   Response: {"action": "GENERAL", "message": "I'll provide information about token A's current price."}

4. User: "Purchase 5 SUI tokens"
   Response: {"action": "BUY", "amount": 5}

Return only the JSON object without any additional text or explanation.`;

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
