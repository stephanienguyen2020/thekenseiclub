import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client server-side
console.log("OPENAI_KEY", process.env.OPENAI_KEY);
console.log("News API Key", process.env.NEWS_API_KEY);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

async function generateTokenConcept(input: string) {
  const token_gen_prompt = `Generate a creative token concept based on this input: "${input}".
  Return ONLY a JSON object with the following fields:
  {
    "name": "A creative name for the token (max 32 chars) with no spaces", 
    "symbol": "A 3-6 character ticker symbol in caps",
    "description": "A compelling 2-3 sentence description of the token's purpose and vision",
    "image_description": "A description of the image that will be generated for the token",
    }
  Do not include any other text or explanation.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: token_gen_prompt,
      },
    ],
  });

  const content = response.choices[0].message?.content;
  if (!content) {
    throw new Error("No content received from OpenAI");
  }

  return JSON.parse(content);
}

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

    const tokenConcept = await generateTokenConcept(input);

    return NextResponse.json(tokenConcept);
  } catch (error) {
    console.error("Error generating token concept:", error);
    return NextResponse.json(
      { error: "Failed to generate token concept" },
      { status: 500 }
    );
  }
}
