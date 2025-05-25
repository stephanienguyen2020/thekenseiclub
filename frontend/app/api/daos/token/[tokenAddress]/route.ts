import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tokenAddress: string }> }
) {
  try {
    const { tokenAddress } = await params;
    const response = await fetch(
      `${BACKEND_URL}/api/proposals/token/${tokenAddress}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch proposals");
    }

    const data = await response.json();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch proposals" },
      { status: 500 }
    );
  }
}
