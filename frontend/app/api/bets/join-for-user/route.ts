import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import BettingABI from "@/abi/Betting.json";

// Contract address from the BettingService
const contractAddress = "0xd1b6BEa5A3b3dd4836100f5C55877c59d4666569";

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { twitterHandle, betId, support } = body;

    // Validate required fields
    if (
      twitterHandle === undefined ||
      betId === undefined ||
      support === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Connect to the provider - use environment variable for RPC URL
    const provider = new ethers.JsonRpcProvider(
      "https://rpc.blaze.soniclabs.com"
    );

    // Use your agent private key from environment variables
    const privateKey = process.env.AGENT_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: "Agent private key not configured" },
        { status: 500 }
      );
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const bettingContract = new ethers.Contract(
      contractAddress,
      BettingABI,
      wallet
    );

    // Call the joinBetForUser function
    const tx = await bettingContract.joinBetForUser(
      twitterHandle,
      betId,
      support
    );

    const receipt = await tx.wait();

    // Return success response with transaction details
    return NextResponse.json({
      success: true,
      message: `Bet joined successfully. Position: ${support ? "Yes" : "No"}`,
      transactionHash: receipt.hash,
      redirectUrl: `/bets/place-bet?id=${betId}`, // URL to the specific bet page
    });
  } catch (error: any) {
    console.error("Error joining bet:", error);

    // Check for onlyAgent error
    if (
      error.message &&
      error.message.includes("Only agent can call this function")
    ) {
      return NextResponse.json(
        {
          error: "Agent authorization failed",
          message:
            "The wallet address is not authorized as an agent in the smart contract. Please check setup-guide.md for instructions.",
          walletAddress: new ethers.Wallet(process.env.AGENT_PRIVATE_KEY || "")
            .address,
        },
        { status: 403 }
      );
    }

    // Check for Twitter handle not registered error
    if (
      error.message &&
      error.message.includes("Twitter handle not registered")
    ) {
      return NextResponse.json(
        {
          error: "Twitter handle not registered",
          message: `The Twitter handle provided is not registered in the smart contract. Users must register their Twitter handle with their wallet address first.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to join bet",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
