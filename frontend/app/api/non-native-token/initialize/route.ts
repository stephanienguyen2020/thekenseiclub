import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function POST() {
  try {
    console.log("Initializing token database...");

    const response = await fetch(
      `${BACKEND_URL}/api/non-native-token/tokens/update`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to initialize token database:", errorData);
      return NextResponse.json(
        { error: "Failed to initialize token database", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Token database initialized successfully");

    return NextResponse.json({
      success: true,
      message: "Token database initialized successfully",
      tokensCount: data.length,
    });
  } catch (error) {
    console.error("Error initializing token database:", error);
    return NextResponse.json(
      { error: "Internal server error during initialization" },
      { status: 500 }
    );
  }
}
