import api from "@/lib/api";
import {NextResponse} from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {username, suiAddress, profilePictureUrl} = body;

    // Here you would typically save this to a database
    // For now, we'll just return the user data
    const user = {
      username,
      suiAddress,
      profilePictureUrl,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(user, {status: 201});
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      {error: "Failed to create user"},
      {status: 500}
    );
  }
}

// User API endpoints
export const fetchUserByAddress = async (suiAddress: string) => {
  try {
    const response = await api.get(`/users/${suiAddress}`);
    if (response.status !== 200) {
      throw new Error("Failed to fetch user data");
    }
    console.log("User data fetched successfully:", response.data);
    return await response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const updateUserProfile = async (
  suiAddress: string,
  userData: {
    username?: string;
    email?: string;
    profilePictureUrl?: string;
  }
) => {
  try {
    const response = await api.put(`/users/${suiAddress}`, {
      ...userData
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};
