// no need 

import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import LaunchpadAgentABI from "@/abi/LaunchpadAgent.json";
import { config } from "@/app/config/contract_addresses";

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

    // Connect to the provider
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545"
    );

    const privateKey = process.env.AGENT_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: "Agent private key not configured" },
        { status: 500 }
      );
    }

    let wallet;

    // In test mode, use the agent wallet instead of verifying signatures
    if (testMode) {
      console.log("Running in test mode - using agent wallet for registration");
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
        // Create a wallet instance with the signer's address
        wallet = new ethers.Wallet(privateKey, provider);
      } catch (error: any) {
        return NextResponse.json(
          { error: "Invalid signature", message: error.message },
          { status: 400 }
        );
      }
    }

    // Get contract address from config
    const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 31337;
    const contractAddress = config[chainId as keyof typeof config]?.LaunchpadAgent?.address;
    
    if (!contractAddress) {
      return NextResponse.json(
        { error: `LaunchpadAgent contract address not found for chain ID ${chainId}` },
        { status: 500 }
      );
    }

    const launchpadAgent = new ethers.Contract(
      contractAddress,
      LaunchpadAgentABI,
      wallet
    );

    // Call the registerTwitterHandle function
    const tx = await launchpadAgent.registerTwitterHandle(twitterHandle);
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

    // Check for specific errors
    if (error.message?.includes("Invalid twitter handle")) {
      return NextResponse.json(
        {
          error: "Invalid Twitter handle",
          message: "The provided Twitter handle is invalid.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to register Twitter handle",
        message: error.message
      },
      { status: 500 }
    );
  }
}
