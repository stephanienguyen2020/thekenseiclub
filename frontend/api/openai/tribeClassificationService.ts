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

class TribeClassificationService {
  private openai: OpenAI | null = null;

  constructor() {
    // Only initialize OpenAI if API key is available
    if (process.env.OPENAI_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_KEY,
        dangerouslyAllowBrowser: true,
      });
    }
  }

  async classifyTribe(
    name: string,
    symbol: string,
    description: string
  ): Promise<TribeType> {
    try {
      // Use AI classification if OpenAI is configured
      if (this.openai) {
        return await this.classifyWithAI(name, symbol, description);
      } else {
        // Use fallback classification
        return this.classifyTribeFallback(name, symbol, description);
      }
    } catch (error) {
      console.error("Error classifying tribe:", error);
      // Default to fallback on error
      return this.classifyTribeFallback(name, symbol, description);
    }
  }

  private async classifyWithAI(
    name: string,
    symbol: string,
    description: string
  ): Promise<TribeType> {
    if (!this.openai) {
      throw new Error("OpenAI not initialized");
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

    const response = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 50,
      temperature: 0.3,
    });

    const classification = response.choices[0]?.message?.content
      ?.trim()
      .toLowerCase();

    // Validate the response is one of our valid tribes
    const validTribes = Object.values(TRIBES);
    if (classification && validTribes.includes(classification as TribeType)) {
      return classification as TribeType;
    }

    // Default to wildcards if classification fails or is invalid
    return TRIBES.WILDCARDS;
  }

  // Fallback classification without AI for development/testing
  classifyTribeFallback(
    name: string,
    symbol: string,
    description: string
  ): TribeType {
    const content = `${name} ${symbol} ${description}`.toLowerCase();

    // Dog-related keywords
    const dogKeywords = [
      "dog",
      "doge",
      "shib",
      "puppy",
      "canine",
      "hound",
      "retriever",
      "bulldog",
      "poodle",
      "beagle",
      "husky",
      "corgi",
      "labrador",
      "german",
      "shepherd",
      "woof",
      "bark",
      "kennel",
      "tail",
      "paw",
      "🐕",
      "🐶",
      "🦮",
    ];

    // Cat-related keywords
    const catKeywords = [
      "cat",
      "kitten",
      "feline",
      "meow",
      "purr",
      "whiskers",
      "siamese",
      "persian",
      "maine",
      "coon",
      "tabby",
      "calico",
      "litterbox",
      "scratch",
      "claw",
      "🐱",
      "🐈",
      "😸",
      "😹",
      "😻",
    ];

    // Aquatic-related keywords
    const aquaticKeywords = [
      "fish",
      "shark",
      "whale",
      "dolphin",
      "octopus",
      "crab",
      "lobster",
      "shrimp",
      "sea",
      "ocean",
      "marine",
      "aquatic",
      "reef",
      "coral",
      "wave",
      "tide",
      "swim",
      "fin",
      "scale",
      "🐠",
      "🐟",
      "🦈",
      "🐋",
      "🐙",
      "🦀",
      "🦞",
    ];

    // Check for matches
    if (dogKeywords.some((keyword) => content.includes(keyword))) {
      return TRIBES.CANINE_CLANS;
    }

    if (catKeywords.some((keyword) => content.includes(keyword))) {
      return TRIBES.FELINE_SYNDICATES;
    }

    if (aquaticKeywords.some((keyword) => content.includes(keyword))) {
      return TRIBES.AQUATIC_ORDERS;
    }

    return TRIBES.WILDCARDS;
  }
}

export const tribeClassificationService = new TribeClassificationService();
