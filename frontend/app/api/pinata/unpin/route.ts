import { NextResponse } from "next/server";
import { pinata } from "@/app/lib/pinata";

export async function DELETE(req: Request): Promise<NextResponse> {
  try {
    const urlParts = req.url.split("/");
    const hash = urlParts[urlParts.length - 1]; // Extract CID from request

    if (!hash) {
      return NextResponse.json({ error: "No hash provided" }, { status: 400 });
    }

    await pinata.unpin([hash]);

    return NextResponse.json({ message: `Successfully unpinned ${hash}` }, { status: 200 });
  } catch (error) {
    console.error("Pinata Unpin Error:", error);
    return NextResponse.json({ error: "Failed to unpin file" }, { status: 500 });
  }
}
