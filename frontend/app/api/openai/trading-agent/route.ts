import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client server-side
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    const apiKey = process.env.OPENAI_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 401 }
      );
    }

    if (!input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    const tradingPrompt = `You are a trading assistant that processes user commands.

User query: "${input}"

Analyze the query and determine if it's a BUY command, SELL command, or a GENERAL message.
For BUY commands, the amount will always be in SUI and you need to extract the token name to buy.
For SELL commands, the amount will always be the token and you need to extract the token name to sell.

Return a JSON object with the following structure:
{
  "action": "BUY" | "SELL" | "GENERAL",
  "amount": string, // Only include when action is BUY or SELL. This is the numeric amount of tokens to buy or sell.
  "coinName": string, // Only include when action is BUY or SELL. This is the name of the token to buy or sell.
  "message": string // Only include when action is GENERAL. This is your response to the user's query.
}

Examples:
1. User: "Buy token XYZ with 10 SUI"
   Response: {"action": "BUY", "amount": "10", "coinName": "XYZ"}

2. User: "Use 10 SUI to buy ABC"
   Response: {"action": "BUY", "amount": "10", "coinName": "ABC"}

3. User: "I want to sell 25 XYZ tokens"
   Response: {"action": "SELL", "amount": "25", "coinName": "XYZ"}

4. User: "Sell 15 PEPE"
   Response: {"action": "SELL", "amount": "15", "coinName": "PEPE"}

5. User: "What is the current price of token A?"
   Response: {"action": "GENERAL", "message": "I'll provide information about token A's current price."}

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

    const parsedResponse = JSON.parse(content);
    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error("Error processing trading agent request:", error);
    return NextResponse.json(
      { error: "Failed to process trading request" },
      { status: 500 }
    );
  }
}
