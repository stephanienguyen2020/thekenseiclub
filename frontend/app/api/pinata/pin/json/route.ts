import { NextResponse } from "next/server";
import { pinata } from "@/app/lib/pinata";

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const json = await req.json();

    if (!json) {
      return NextResponse.json({ error: "No JSON provided" }, { status: 400 });
    }

    const uploadData = await pinata.upload.json(json);

    return NextResponse.json({ hash: uploadData.IpfsHash }, { status: 200 });
  } catch (error) {
    console.error("Pinata JSON Upload Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
