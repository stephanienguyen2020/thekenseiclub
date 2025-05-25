import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Define the available tribes
export const TRIBES = {
  CANINE_CLANS: "canine_clans",
  FELINE_SYNDICATES: "feline_syndicates",
  AQUATIC_ORDERS: "aquatic_orders",
  WILDCARDS: "wildcards",
} as const;

export type TribeType = (typeof TRIBES)[keyof typeof TRIBES];

// Tribe metadata for UI display
export const TRIBE_METADATA = {
  [TRIBES.CANINE_CLANS]: {
    name: "Canine Clans",
    description: "Dog coins coordinate from the Kennel Council",
    emoji: "🐕",
    council: "Kennel Council",
  },
  [TRIBES.FELINE_SYNDICATES]: {
    name: "Feline Syndicates",
    description: "Cat tokens organize in the Litterbox Syndicate",
    emoji: "🐱",
    council: "Litterbox Syndicate",
  },
  [TRIBES.AQUATIC_ORDERS]: {
    name: "Aquatic Orders",
    description: "Degen fish make waves from The Reef",
    emoji: "🐠",
    council: "The Reef",
  },
  [TRIBES.WILDCARDS]: {
    name: "Wildcards",
    description: "Unique tokens that march to their own beat",
    emoji: "🃏",
    council: "Wild Assembly",
  },
};

// Initialize OpenAI client server-side
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { name, symbol, description } = await request.json();

    const apiKey = process.env.OPENAI_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 401 }
      );
    }

    if (!name || !symbol || !description) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    const prompt = `
You are an AI classifier for the Animal Kingdom token ecosystem. Your job is to classify tokens into one of four tribes based on their name, symbol, and description.

The four tribes are:
1. CANINE_CLANS - For dog-related tokens (dogs, puppies, breeds, dog behaviors, etc.)
2. FELINE_SYNDICATES - For cat-related tokens (cats, kittens, breeds, cat behaviors, etc.) 
3. AQUATIC_ORDERS - For water/sea-related tokens (fish, marine life, ocean, water themes, etc.)
4. WILDCARDS - For everything else that doesn't clearly fit into the above categories

Token Details:
- Name: "${name}"
- Symbol: "${symbol}" 
- Description: "${description}"

Analyze the token and determine which tribe it belongs to. Consider:
- Animal references in name/symbol/description
- Emojis that might indicate animals
- Themes and concepts
- Cultural references to animals

Respond with ONLY one of these exact values:
- canine_clans
- feline_syndicates  
- aquatic_orders
- wildcards

Classification:`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const classification = response.choices[0]?.message?.content
      ?.trim()
      .toLowerCase();

    console.log("classification", classification);

    let parsedResponse: {
      classification: string;
      metadata: (typeof TRIBE_METADATA)[TribeType];
    } = {
      classification: TRIBES.WILDCARDS,
      metadata: TRIBE_METADATA[TRIBES.WILDCARDS],
    };

    // Validate the response is one of our valid tribes
    const validTribes = Object.values(TRIBES);
    if (classification && validTribes.includes(classification as TribeType)) {
      parsedResponse = {
        classification: classification,
        metadata: TRIBE_METADATA[classification as TribeType],
      };
    }

    console.log("parsedResponse", parsedResponse);

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error("Error processing tribe classification request:", error);
    return NextResponse.json(
      { error: "Failed to process tribe classification request" },
      { status: 500 }
    );
  }
}
