import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import FactoryABI from "@/abi/Factory.json";
import { getContractConfig, createContractInstance } from '@/app/lib/contract_load';
import { useTokenGeneratingService } from "@/services/TokenGeneratingService";
import { pinFileToIPFS, pinJSONToIPFS, unPinFromIPFS } from "@/app/lib/pinata";
interface FactoryContract extends ethers.BaseContract {
    fee(): Promise<bigint>;
}

export async function POST(req: NextRequest) {

    const body = await req.json();
    const { input, creator } = body;

    if (!input || !creator) {
        return NextResponse.json(
            { error: 'Token input and creator are required' },
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

    // Separate the creation of the token from the pinning of the image and metadata later
    
    try {
        // Get contract configuration
        const { provider, chainConfig } = await getContractConfig();

        const factoryAddress = chainConfig.factory.address;
        const factoryInterface = new ethers.Interface(FactoryABI);

        // Create contract instance to get the fee
        const factoryContract = createContractInstance<FactoryContract>(
            factoryAddress,
            FactoryABI,
            provider
        );

        // Get the required fee
        const fee = await factoryContract.fee();

        // Encode the function data for the create function
        const data = factoryInterface.encodeFunctionData('create', [
            tokenDetails.name,
            tokenDetails.symbol,
            metadataURI,
            creator 
        ]);

        // Prepare the transaction data
        const txData = {
            to: factoryAddress,
            data: data,
            value: fee.toString(), // Required fee for token creation
            tokenDetails: {
                name: tokenDetails.name,
                symbol: tokenDetails.symbol,
                description: tokenDetails.description,
                imageURI: imageURI,
                metadataURI: metadataURI
            }
        };

        return NextResponse.json({
            success: true,
            transaction: [txData]
        });

    } catch (error) {
        console.log("Unpinning image and metadata from IPFS", imageURI, metadataURI);
        unPinFromIPFS(imageURI, metadataURI);
        console.error('Error preparing create transaction:', error);
        return NextResponse.json(
            { error: 'Failed to prepare create transaction' },
            { status: 500 }
        );
    }
}