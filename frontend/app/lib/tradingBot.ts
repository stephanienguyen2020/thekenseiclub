export async function tradeAgent(input: string): Promise<{
  action: "BUY" | "SELL" | "BUY_ALL" | "SELL_ALL" | "GENERAL";
  amount: string;
  coinName: string;
  message: string;
}> {
  try {
    const response = await fetch("/api/openai/trading-agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to process trading request");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error in tradeAgent:", error);
    throw error;
  }
}
