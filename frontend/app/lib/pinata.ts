import { PinataSDK } from "pinata-web3";

export const pinataImageUrl = "https://gateway.pinata.cloud/ipfs"

// Check if required environment variables are present
if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
    console.error("Missing NEXT_PUBLIC_PINATA_JWT environment variable");
}

if (!process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL) {
    console.error("Missing NEXT_PUBLIC_PINATA_GATEWAY_URL environment variable");
}

export const pinata = new PinataSDK({
    pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT ,
    pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL
});

export const pinFileToIPFS = async (file: File) => {
    try {
        const uploadData = await pinata.upload.file(file);
        if (!uploadData?.IpfsHash) {
            throw new Error("Failed to get IPFS hash from upload");
        }
        return `${pinataImageUrl}/${uploadData.IpfsHash}`;
    } catch (error) {
        console.error("Error uploading to IPFS:", error);
        throw error;
    }
};

export const pinJSONToIPFS = async (json: Record<string, any>) => {
    if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
        throw new Error("Pinata JWT not configured. Please check your environment variables.");
    }

    try {
        const uploadData = await pinata.upload.json(json);
        if (!uploadData?.IpfsHash) {
            throw new Error("Failed to get IPFS hash from upload");
        }
        return `${pinataImageUrl}/${uploadData.IpfsHash}`;
    } catch (error) {
        console.error("Error pinning JSON to IPFS:", error);
        throw error;
    }
};

export const unPinFromIPFS = async (hash: string) => {
    if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
        throw new Error("Pinata JWT not configured. Please check your environment variables.");
    }

    try {
        await pinata.unpin([hash]);
        return true;
    } catch (error) {
        console.error("Error unpinning file:", error);
        return false;
    }
};

