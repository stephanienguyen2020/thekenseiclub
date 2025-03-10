import { pinata } from "@/app/lib/pinata";
import { NextResponse } from "next/server"; 

export async function POST(req: Request): Promise<NextResponse> {
    try {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;;
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const uploadData = await pinata.upload.file(file);
      return NextResponse.json({ hash: uploadData.IpfsHash }, { status: 200 });
    } catch (error) {
      console.error("Pinata Upload Error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }