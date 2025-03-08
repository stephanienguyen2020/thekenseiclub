import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const { message, agentId, file } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Use our apiClient to process the message
    const response = await apiClient.sendMessage(agentId, message, file);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
