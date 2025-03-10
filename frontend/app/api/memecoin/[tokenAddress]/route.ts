import { NextRequest, NextResponse } from "next/server";
import { getTokenDetails } from "@/services/memecoin-launchpad";

// Helper function to make BigInt serializable
function serializeBigInt(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export async function GET(
  request: NextRequest,
  context: { params: { tokenAddress: string } }
): Promise<NextResponse> {
  try {
    // Get the tokenAddress from the URL pattern
    const { tokenAddress } = await context.params;

    if (!tokenAddress) {
      return NextResponse.json(
        { error: "Token address is required" },
        { status: 400 }
      );
    }

    const tokenDetails = await getTokenDetails(tokenAddress);

    if (!tokenDetails) {
      return NextResponse.json(
        { error: "Token not found" },
        { status: 404 }
      );
    }

    // Serialize the response to handle BigInt values
    const serializedData = serializeBigInt(tokenDetails);

    return NextResponse.json({
      success: true,
      data: serializedData,
    });
  } catch (error: any) {
    console.error("Error fetching token details:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch token details",
        message: error.message,
      },
      { status: 500 }
    );
  }
} 