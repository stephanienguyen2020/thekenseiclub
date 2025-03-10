// no need for this
import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import LaunchpadAgentABI from "@/abi/LaunchpadAgent.json";
import { config } from "@/app/config/contract_addresses";

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { twitterHandle, credits, signature, message, testMode } = body;

    // Validate required fields
    if (!twitterHandle || !credits) {
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

    const wallet = new ethers.Wallet(privateKey, provider);

    // Get contract address from config
    const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 31337;
    const contractAddress =
      config[chainId as keyof typeof config]?.LaunchpadAgent?.address;
    if (!contractAddress) {
      return NextResponse.json(
        {
          error: `LaunchpadAgent contract address not found for chain ID ${chainId}`,
        },
        { status: 500 }
      );
    }

    const launchpadAgent = new ethers.Contract(
      contractAddress,
      LaunchpadAgentABI,
      wallet
    );
    console.log("launchPadAgent", launchpadAgent);

    // First verify if the Twitter handle is registered
    const userAddress = await launchpadAgent.twitterToAddress(twitterHandle);
    if (userAddress === ethers.ZeroAddress) {
      return NextResponse.json(
        { error: "Twitter handle not registered" },
        { status: 400 }
      );
    }

    console.log(
      `Adding ${credits} S worth of token credits for user ${twitterHandle}`
    );
    // Call the buyTokenCredits function with the specified amount
    const tx = await launchpadAgent.buyTokenCredits({
      value: ethers.parseEther(credits.toString()),
    });
    const receipt = await tx.wait();

    // Return success response with transaction details
    return NextResponse.json({
      success: true,
      message: `Added ${credits} S worth of token credits for ${twitterHandle}`,
      transactionHash: receipt.hash,
      userAddress: userAddress,
      amount: credits,
    });
  } catch (error: any) {
    console.error("Error adding token credits:", error);

    return NextResponse.json(
      {
        error: "Failed to add token credits",
        message: error.message,
        details: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      },
      { status: 500 }
    );
  }
}
