import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { getClient } from "@mysten/sui/dist/cjs/transactions/json-rpc-resolver";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import { Network } from "coin-sdk/dist/src";
import { getClient as getClientFromResolver } from "../utils";

export class BalanceService {
  private client: SuiClient;

  constructor() {
    // Initialize with testnet by default, can be changed based on environment
    this.client = new SuiClient({
      url: getFullnodeUrl((process.env.NETWORK as Network) || "testnet"),
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

  // Get all coin balances for a wallet address
  async getAllCoinBalances(walletAddress: string) {
    try {
      const allCoins = await getClientFromResolver().getAllCoins({
        owner: walletAddress,
      });

      // Process coin data
      const coinBalances = await Promise.all(
        allCoins.data.map(async (coin) => {
          const coinTypeArray = coin.coinType.split("::");
          const symbol =
            coinTypeArray.length > 2 ? coinTypeArray[2] : coin.coinType;
          const coinMetadata = await this.client.getCoinMetadata({
            coinType: coin.coinType,
          });

          return {
            id: coinMetadata?.id,
            coinType: coin.coinType,
            symbol: symbol,
            balance:
              Number(coin.balance) /
              (coin.coinType === "0x2::sui::SUI"
                ? Number(MIST_PER_SUI)
                : Math.pow(10, 9)),
            address: coin.coinObjectId,
            createdAt: new Date(), // We don't have this from the API, so use current date
          };
        })
      );

      return coinBalances;
    } catch (error) {
      console.error("Error fetching all coin balances:", error);
      throw new Error("Failed to fetch all coin balances");
    }
  }
}

export const balanceService = new BalanceService();
