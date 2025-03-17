import { NextRequest, NextResponse } from "next/server";
import { getTokensByCreator } from "@/services/memecoin-launchpad";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const createdBy = searchParams.get('created_by');

    // Get all tokens if createdBy is not provided, otherwise get tokens by creator
    const tokens = await getTokensByCreator(createdBy || undefined);

    return NextResponse.json({
      success: true,
      tokens,
    });
  } catch (error: any) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch tokens",
        message: error.message,
      },
      { status: 500 }
    );
  }
} 