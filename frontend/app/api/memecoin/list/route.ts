import { NextRequest, NextResponse } from "next/server";
import { getTokens, getTokensByCreator } from "@/services/memecoin-launchpad";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const createdBy = searchParams.get('created_by');

    if (!createdBy) {
      return NextResponse.json(
        { error: "Missing required 'created_by' parameter" },
        { status: 400 }
      );
    }

    const tokens = await getTokensByCreator(createdBy);

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