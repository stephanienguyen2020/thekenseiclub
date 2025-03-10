import { generateTokenConcept } from "@/app/lib/nebula";

interface TokenAIGeneratedDetails {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  imageBase64?: string;
  image_description?: string;
}

export const useTokenGeneratingService = () => {
  const generateImageFromPrompt = async (
    prompt: string
  ): Promise<{ imageUrl: string; imageBase64: string }> => {
    if (!prompt.trim()) {
      throw new Error("Prompt is required");
    }
    
    try {
      const url = "https://api.nebulablock.com/api/v1/images/generation";

      const response = await fetch(url, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_NEBULA_API_KEY}`,
        },

        body: JSON.stringify({
          model_name: "black-forest-labs/FLUX.1-schnell",
          prompt: prompt,
          num_steps: 4,
          guidance_scale: 3.5,
          seed: -1,
          width: 1024,
          height: 1024,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const { data } = await response.json();
      console.log("data", data);
      const imageBase64 = data.image_file;

      // For browser context, also create a blob URL
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
      console.error("Error generating image:", error);
      throw new Error("Failed to generate image");
    }
  };

  const generateTokenWithAI = async (
    input: string
  ): Promise<TokenAIGeneratedDetails> => {
    try {
      const response = await generateTokenConcept(input);
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
