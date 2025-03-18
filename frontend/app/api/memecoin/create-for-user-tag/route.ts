import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import LaunchpadAgentABI from "@/abi/LaunchpadAgent.json";
import FactoryABI from "@/abi/Factory.json";
import { config } from "@/app/config/contract_addresses";
import { useTokenGeneratingService } from "@/services/TokenGeneratingService";
import { pinFileToIPFS, pinJSONToIPFS } from "@/app/lib/pinata";

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const {
      input,
      isTwitter,
      twitterHandle,
      userWalletAddress,
    } = body;

    // Validate required fields
    if (!input) {
      return NextResponse.json(
        { error: "Missing input text for token generation" },
        { status: 400 }
      );
    }

    if ((isTwitter === true && !twitterHandle) || (isTwitter === false && !userWalletAddress)) {
      return NextResponse.json(
        { error: "Missing required twitter handle or wallet address" },
        { status: 400 }
      );
    }

    // Connect to the provider
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545"
    );

    // Use agent private key from environment variables
    const privateKey = process.env.AGENT_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: "Agent private key not configured" },
        { status: 500 }
      );
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 31337;
    const chainConfig = config[chainId as keyof typeof config];

    if (!chainConfig) {
      return NextResponse.json(
        { error: `LaunchpadAgent contract address not found for chain ID ${chainId}` },
        { status: 500 }
      );
    }

    const launchpadContractAddress = chainConfig.LaunchpadAgent.address;
    const factoryContractAddress = chainConfig.factory.address;

    const launchpadAgent = new ethers.Contract(
      launchpadContractAddress,
      LaunchpadAgentABI,
      wallet
    );
    const FactoryContract = new ethers.Contract(
      factoryContractAddress,
      FactoryABI,
      wallet
    );

    let userAddress;
    if (isTwitter) {
      userAddress = await launchpadAgent.twitterToAddress(twitterHandle);
      if (userAddress === ethers.ZeroAddress) {
        const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        return NextResponse.json(
          {
            error: "Twitter handle not linked",
            message: `The Twitter handle is not linked to any wallet address. Please register the Twitter handle first at ${baseURL}/settings`,
          },
          { status: 400 }
        );
      }
    } else {
      userAddress = userWalletAddress;
    }

    // Check user's token credits
    const userCredits = await launchpadAgent.userTokenCredits(userAddress);
    const baseFee = await FactoryContract.fee();
    const agentFeePercentage = await launchpadAgent.agentFeePercentage();
    const agentFee = (baseFee * BigInt(agentFeePercentage)) / BigInt(100);
    const totalCost = baseFee + agentFee;

    if (userCredits < totalCost) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          message: "User does not have enough token credits. Please buy more credits.",
          required: totalCost.toString(),
          available: userCredits.toString(),
        },
        { status: 400 }
      );
    }

    // Generate token details using AI
    const tokenGeneratingService = useTokenGeneratingService();
    let tokenDetails;
    try {
      tokenDetails = await tokenGeneratingService.generateTokenWithAI(input);
    } catch (error) {
      console.error("Error generating token details:", error);
      return NextResponse.json(
        { error: "Failed to generate token details" },
        { status: 500 }
      );
    }

    // Convert base64 to buffer for IPFS
    const imageBuffer = Buffer.from(tokenDetails.imageBase64!, 'base64');
    const imageFile = new File([imageBuffer], "ai-generated-image.png", { type: "image/png" });

    // Upload image to IPFS
    console.log("Uploading image to IPFS");
    const imageURI = await pinFileToIPFS(imageFile);

    // Upload metadata to IPFS
    console.log("Uploading metadata to IPFS");
    const metadataURI = await pinJSONToIPFS({
      name: tokenDetails.name,
      symbol: tokenDetails.symbol,
      description: tokenDetails.description,
      imageURI: imageURI,
    });
    
    let tx;
    if (isTwitter) {
      tx = await launchpadAgent.createTokenForUserViaTwitter(
        twitterHandle,
        tokenDetails.name,
        tokenDetails.symbol,
        metadataURI
      );
    } else {
      tx = await launchpadAgent.createTokenForUserViaAddress(
        userWalletAddress,
        tokenDetails.name,
        tokenDetails.symbol,
        metadataURI
      );
    }

    const receipt = await tx.wait();
    
    // Get the Factory contract's Created event from the transaction receipt
    const factoryInterface = new ethers.Interface(FactoryABI);
    const createdEvent = receipt.logs
      .map((log: any) => {
        try {
          return factoryInterface.parseLog({ topics: log.topics, data: log.data });
        } catch (e) {
          return null;
        }
      })
      .find((log: any) => log?.name === "Created");

    if (!createdEvent) {
      return NextResponse.json(
        {
          error: "Token creation failed",
          message: "Could not find token creation event in transaction logs",
        },
        { status: 500 }
      );
    }

    const tokenAddress = createdEvent.args[0];

    // Construct the redirect URL
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const redirectUrl = `${baseURL}/token/${tokenAddress}`;

    // Return success response with transaction details
    return NextResponse.json({
      success: true,
      message: "Token created successfully",
      transactionHash: receipt.hash,
      tokenAddress: tokenAddress,
      redirectUrl: redirectUrl,
      tokenDetails: {
        name: tokenDetails.name,
        symbol: tokenDetails.symbol,
        description: tokenDetails.description,
        imageUrl: imageURI,
        metadataURI: metadataURI,
      },
    });

  } catch (error: any) {
    console.error("Error creating token:", error);

    // Check for specific errors
    if (error.message?.includes("Only agent can call this function")) {
      return NextResponse.json(
        {
          error: "Agent authorization failed",
          message: "The wallet address is not authorized as an agent in the smart contract.",
          walletAddress: new ethers.Wallet(process.env.AGENT_PRIVATE_KEY || "").address,
        },
        { status: 403 }
      );
    }

    if (error.message?.includes("Twitter handle not registered")) {
      return NextResponse.json(
        {
          error: "Twitter handle not registered",
          message: "The Twitter handle provided is not registered in the smart contract.",
        },
        { status: 400 }
      );
    }

    if (error.message?.includes("Insufficient token credits")) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          message: "User does not have enough token credits to create the token.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create token",
        message: error.message,
        details: JSON.stringify(error, Object.getOwnPropertyNames(error))
      },
      { status: 500 }
    );
  }
}
