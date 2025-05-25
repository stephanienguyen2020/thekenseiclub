import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const coinId = searchParams.get("coinId");
  const vsCurrency = searchParams.get("vs_currency") || "usd";

  if (!coinId) {
    return NextResponse.json({ error: "Coin ID is required" }, { status: 400 });
  }

  try {
    const backendUrl = `${BACKEND_URL}/api/non-native-token/ohlc/${coinId}?vs_currency=${vsCurrency}`;
    const response = await fetch(backendUrl);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: "Failed to fetch OHLC data from backend", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching OHLC data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
