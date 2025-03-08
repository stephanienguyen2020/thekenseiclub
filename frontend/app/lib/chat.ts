// Define local types to avoid dependency on @elizaos/core
type UUID = string;
type Character = {
  id: string;
  name: string;
  // Add other properties as needed
};

const BASE_URL =
  process.env.NEXT_PUBLIC_AGENT_SERVER || "http://localhost:3001"; // Add fallback URL
console.log("API Base URL:", BASE_URL);

const fetcher = async ({
  url,
  method,
  body,
  headers,
}: {
  url: string;
  method?: "GET" | "POST";
  body?: object | FormData;
  headers?: HeadersInit;
}) => {
  const options: RequestInit = {
    method: method ?? "GET",
    headers: headers
      ? headers
      : {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
  };

  if (method === "POST") {
    if (body instanceof FormData) {
      if (options.headers && typeof options.headers === "object") {
        // Create new headers object without Content-Type
        options.headers = Object.fromEntries(
          Object.entries(options.headers as Record<string, string>).filter(
            ([key]) => key !== "Content-Type"
          )
        );
      }
      options.body = body;
    } else {
      options.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(`${BASE_URL}${url}`, options);
    const contentType = response.headers.get("Content-Type");

    if (contentType === "audio/mpeg") {
      return await response.blob();
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error: ", errorText);

      let errorMessage = "An error occurred.";
      try {
        const errorObj = JSON.parse(errorText);
        errorMessage = errorObj.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error("Network or API Error:", error);
    // Add more descriptive error for debugging
    if (error instanceof Error) {
      throw new Error(`API request failed: ${error.message}`);
    }
    throw new Error("API request failed with an unknown error");
  }
};

export const apiClient = {
  sendMessage: (
    agentId: string,
    message: string,
    selectedFile?: File | null,
    userWalletId?: string | null
  ) => {
    const formData = new FormData();
    formData.append("text", message);
    formData.append("user", "user");

    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    if (userWalletId) {
      formData.append("userWalletId", userWalletId);
    }

    // Check if we're in development mode and the API server is not available
    if (process.env.NODE_ENV === "development" && !BASE_URL) {
      console.log("Using mock response for development");
      // Return a mock response after a short delay
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            {
              text: `I received your message: "${message}"\n\nThis is a mock response since the API server is not available. Please configure NEXT_PUBLIC_AGENT_SERVER in your environment variables.`,
              user: "Sage",
              createdAt: Date.now(),
            },
          ]);
        }, 1500);
      });
    }

    return fetcher({
      url: `/${agentId}/message`,
      method: "POST",
      body: formData,
    });
  },
  getAgents: () => fetcher({ url: "/agents" }),
  getAgent: (agentId: string): Promise<{ id: UUID; character: Character }> =>
    fetcher({ url: `/agents/${agentId}` }),
  tts: (agentId: string, text: string) =>
    fetcher({
      url: `/${agentId}/tts`,
      method: "POST",
      body: {
        text,
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
        "Transfer-Encoding": "chunked",
      },
    }),
  whisper: async (agentId: string, audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.wav");
    return fetcher({
      url: `/${agentId}/whisper`,
      method: "POST",
      body: formData,
    });
  },
};

interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: "defi" | "nft" | "layer1" | "layer2" | "meme" | "stablecoin";
  price: number;
  priceChange: number;
  priceChangePercent: number;
  dailyPL: number;
  avgCost: number;
  pl: number;
  plPercent: number;
  value: number;
  holdings: number;
  address?: string;
}

export const autoShill = async (asset: Asset, agentId: UUID) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_AGENT_SERVER}/post-tweet/${agentId}/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coinSymbol: asset.symbol,
        coinName: asset.name,
      }),
    }
  );
  return await res.json();
};
