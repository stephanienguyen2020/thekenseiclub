import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, suiAddress, profilePictureUrl } = body;

    // Here you would typically save this to a database
    // For now, we'll just return the user data
    const user = {
      username,
      suiAddress,
      profilePictureUrl,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
