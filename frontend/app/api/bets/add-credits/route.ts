import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import BettingABI from "@/abi/Betting.json";

// Contract address from the BettingService
const contractAddress = "0xd1b6BEa5A3b3dd4836100f5C55877c59d4666569";

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { twitterHandle, credits } = body;

    // Validate required fields
    if (!twitterHandle || !credits) {
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

    // Get the wallet address associated with the Twitter handle
    const userAddress = await bettingContract.twitterToAddress(twitterHandle);

    // Check if the Twitter handle is registered
    if (userAddress === ethers.ZeroAddress) {
      return NextResponse.json(
        { error: "Twitter handle not registered" },
        { status: 400 }
      );
    }

    console.log(
      `Purchasing ${credits} ETH worth of bet credits for agent wallet (${wallet.address})`
    );

    // Call the buyBetCredits function - this will add credits to the agent's wallet
    const tx = await bettingContract.buyBetCredits({
      value: ethers.parseEther(credits.toString()),
    });
    const receipt = await tx.wait();

    // Return success response with transaction details
    return NextResponse.json({
      success: true,
      message: `Purchased ${credits} ETH worth of bet credits for the agent wallet. The agent will now use these credits to create bets on behalf of ${twitterHandle}`,
      transactionHash: receipt.hash,
      userAddress: userAddress,
      agentWallet: wallet.address,
    });
  } catch (error: any) {
    console.error("Error purchasing bet credits:", error);

    // Check for onlyOwner error
    if (
      error.message &&
      error.message.includes("Only owner can call this function")
    ) {
      return NextResponse.json(
        {
          error: "Owner authorization failed",
          message:
            "Only the contract owner can add bet credits. Please contact the contract owner to add credits.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to purchase bet credits",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
