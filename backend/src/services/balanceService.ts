import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { MIST_PER_SUI } from "@mysten/sui/utils";

export class BalanceService {
  private client: SuiClient;

  constructor() {
    // Initialize with testnet by default, can be changed based on environment
    this.client = new SuiClient({
      url: getFullnodeUrl(
        process.env.NETWORK === "mainnet" ? "mainnet" : "testnet"
      ),
    });
  }

  // Get SUI balance for a wallet address
  async getSUIBalance(walletAddress: string): Promise<number> {
    try {
      const { totalBalance } = await this.client.getBalance({
        owner: walletAddress,
        coinType: "0x2::sui::SUI",
      });

      return Number(totalBalance) / Number(MIST_PER_SUI);
    } catch (error) {
      console.error("Error fetching SUI balance:", error);
      throw new Error("Failed to fetch SUI balance");
    }
  }
}

export const balanceService = new BalanceService();
