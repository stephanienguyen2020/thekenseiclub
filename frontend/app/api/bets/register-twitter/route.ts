import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import BettingABI from "@/abi/Betting.json";

// Contract address from the BettingService
const contractAddress = "0xd1b6BEa5A3b3dd4836100f5C55877c59d4666569";

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { twitterHandle, signature, message, testMode } = body;

    // Validate required fields
    if (!twitterHandle) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Connect to the provider - use environment variable for RPC URL
    const provider = new ethers.JsonRpcProvider(
      "https://rpc.blaze.soniclabs.com"
    );

    let wallet;

    // In test mode, use the agent wallet instead of verifying signatures
    if (testMode) {
      console.log("Running in test mode - using agent wallet for registration");
      const privateKey = process.env.AGENT_PRIVATE_KEY;
      if (!privateKey) {
        return NextResponse.json(
          { error: "Agent private key not configured" },
          { status: 500 }
        );
      }
      wallet = new ethers.Wallet(privateKey, provider);
    } else {
      // For production, require signature and message
      if (!signature || !message) {
        return NextResponse.json(
          { error: "Signature and message are required for registration" },
          { status: 400 }
        );
      }

      try {
        // Verify the signature to get the signer's address
        const signerAddress = ethers.verifyMessage(message, signature);
        // Create a contract instance with the signer
        const privateKey = process.env.AGENT_PRIVATE_KEY;
        if (!privateKey) {
          return NextResponse.json(
            { error: "Agent private key not configured" },
            { status: 500 }
          );
        }
        wallet = new ethers.Wallet(privateKey, provider);
      } catch (error: any) {
        return NextResponse.json(
          { error: "Invalid signature", message: error.message },
          { status: 400 }
        );
      }
    }

    const bettingContract = new ethers.Contract(
      contractAddress,
      BettingABI,
      wallet
    );

    // Call the registerTwitterHandle function
    const tx = await bettingContract.registerTwitterHandle(twitterHandle);
    const receipt = await tx.wait();

    // Return success response with transaction details
    return NextResponse.json({
      success: true,
      message: "Twitter handle registered successfully",
      transactionHash: receipt.hash,
      redirectUrl: "/profile", // URL to the profile page
    });
  } catch (error: any) {
    console.error("Error registering Twitter handle:", error);

    return NextResponse.json(
      {
        error: "Failed to register Twitter handle",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
