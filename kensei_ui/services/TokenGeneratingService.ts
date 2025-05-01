import { generateTokenConcept } from "@/app/lib/nebula";
import OpenAI from "openai";

interface TokenAIGeneratedDetails {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  imageBase64?: string;
  image_description?: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

export const useTokenGeneratingService = () => {
  const generateImageFromPrompt = async (
    prompt: string
  ): Promise<{ imageUrl: string; imageBase64: string }> => {
    if (!prompt.trim()) {
      throw new Error("Prompt is required");
    }
    
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "b64_json"
      });

      if (!response.data?.[0]?.b64_json) {
        throw new Error("No image data received from OpenAI");
      }

      const imageBase64 = response.data[0].b64_json;

      // For browser context, create a blob URL
      if (typeof window !== "undefined") {
        // Convert base64 to binary
        const byteCharacters = atob(imageBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "image/png" });
        const file = new File([blob], "ai-generated.png", {
          type: "image/png",
        });
        const imageUrl = URL.createObjectURL(file);

        return { imageUrl, imageBase64 };
      }

      // For server context, just return the base64 data
      return {
        imageUrl: `data:image/png;base64,${imageBase64}`,
        imageBase64,
      };
    } catch (error) {
      console.error("Error generating image with OpenAI:", error);
      throw new Error("Failed to generate image");
    }
  };

  const generateTokenWithAI = async (
    input: string
  ): Promise<TokenAIGeneratedDetails> => {
    try {
      const response = await generateTokenConcept(input);
      
      if (!response.image_description) {
        throw new Error("No image description generated");
      }

      // Generate image using the description
      const { imageUrl, imageBase64 } = await generateImageFromPrompt(
        response.image_description
      );

      return {
        ...response,
        imageUrl,
        imageBase64,
      };
    } catch (error) {
      console.error("Error in generateTokenWithAI:", error);
      throw new Error("Failed to generate token details");
    }
  };

  return {
    generateTokenWithAI,
    generateImageFromPrompt,
  };
};
