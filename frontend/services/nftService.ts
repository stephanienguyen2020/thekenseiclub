import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Network } from "coin-sdk/dist/sui-utils";

export interface NFTMintData {
  name: string;
  description: string;
  url: string;
}

export class NFTService {
  private client: SuiClient;
  private packageId: string;

  constructor() {
    const network = (process.env.NEXT_PUBLIC_NETWORK || "devnet") as Network;
    this.client = new SuiClient({
      url: getFullnodeUrl(network),
    });
    this.packageId = process.env.NEXT_PUBLIC_NFT_PACKAGE_ID || "";

    if (!this.packageId) {
      console.warn("NFT_PACKAGE_ID environment variable not set");
    }
  }

  /**
   * Build a transaction to mint an NFT to the sender
   */
  buildMintTransaction({
    tokenName,
    tokenSymbol,
    proposalTitle,
    tokenImageUrl,
    userAddress,
  }: {
    tokenName: string;
    tokenSymbol: string;
    proposalTitle: string;
    tokenImageUrl: string;
    userAddress: string;
  }): Transaction {
    if (!this.packageId) {
      throw new Error("NFT package ID not configured");
    }
    const { name, description, url }: NFTMintData = {
      name: `${tokenSymbol} Governance Vote`,
      description: `Voted on proposal "${proposalTitle}" for ${tokenName} (${tokenSymbol}) token governance.`,
      url: tokenImageUrl,
    };
    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::soulbound_nft::mint_to_sender`,
      arguments: [
        tx.pure.string(name),
        tx.pure.string(description),
        tx.pure.string(url),
      ],
    });

    return tx;
  }

  /**
   * Get NFT details by object ID with retry mechanism
   */
  async getNFTDetails(objectId: string, maxRetries: number = 5) {
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        console.log(
          `Getting NFT details for ${objectId}, attempt ${
            attempt + 1
          }/${maxRetries}`
        );

        const response = await this.client.getObject({
          id: objectId,
          options: {
            showContent: true,
            showDisplay: true,
          },
        });

        console.log("NFT response:", response);

        if (response.data?.content?.dataType === "moveObject") {
          const fields = response.data.content.fields as any;
          const nftDetails = {
            id: objectId,
            name: fields.name,
            description: fields.description,
            url: fields.url,
          };
          console.log("NFT details found:", nftDetails);
          return nftDetails;
        }

        // If no data found but no error, it might be a timing issue
        if (!response.data && attempt < maxRetries - 1) {
          console.log(
            `NFT not found yet, retrying in 1 second... (attempt ${
              attempt + 1
            }/${maxRetries})`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
          attempt++;
          continue;
        }

        return null;
      } catch (error) {
        console.error(
          `Error fetching NFT details (attempt ${attempt + 1}/${maxRetries}):`,
          error
        );

        // If this is the last attempt, throw the error
        if (attempt === maxRetries - 1) {
          console.error("All retry attempts failed for NFT details");
          return null;
        }

        // Wait 1 second before retrying
        console.log(
          `Retrying in 1 second... (attempt ${attempt + 1}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempt++;
      }
    }

    return null;
  }
}

export const nftService = new NFTService();
