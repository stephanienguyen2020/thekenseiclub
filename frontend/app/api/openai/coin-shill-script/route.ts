import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client server-side
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Ensure the request has a JSON content type
    if (request.headers.get('content-type') !== 'application/json') {
      return NextResponse.json({ error: 'Content type must be application/json' }, { status: 415 });
    }

    const { 
      name,
      description,
      price,
      priceChange24h,
      marketCap,
      tribe,
      tribeMetadata
    } = await request.json();

    const apiKey = process.env.OPENAI_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 401 }
      );
    }

    if (!name || !price) {
      return NextResponse.json({ error: "Name and price are required" }, { status: 400 });
    }

    const prompt = `
You are a crypto influencer known for your creative, engaging, and hype-generating tweets about new tokens. 
Your task is to create a tweet (max 150 characters) to promote this token in an exciting way.

Token Details:
- Name: ${name}
- Description: ${description || ""}
- Current Price: $${price}
${priceChange24h ? `- 24h Change: ${priceChange24h}%` : ""}
${marketCap ? `- Market Cap: $${marketCap}` : ""}
- Tribe: ${tribeMetadata?.name || tribe} ${tribeMetadata?.emoji || ""}

Guidelines:
- Be creative and engaging
- Use emojis strategically
- Highlight the most impressive metrics
- Reference the token's tribe/community
- Create FOMO but avoid explicit financial advice
- Keep it under 150 characters
- Make it feel organic and exciting
- Include relevant hashtags

Write a single tweet:`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.9, // Higher temperature for more creative responses
    });

    const tweetContent = response.choices[0]?.message?.content?.trim();

    return NextResponse.json({ tweet: tweetContent });
  } catch (error) {
    console.error("Error generating shill tweet:", error);
    return NextResponse.json(
      { error: "Failed to generate shill tweet" },
      { status: 500 }
    );
  }
}
