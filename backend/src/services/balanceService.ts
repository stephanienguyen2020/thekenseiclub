import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { getClient } from "@mysten/sui/dist/cjs/transactions/json-rpc-resolver";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import { Network } from "coin-sdk/dist/src";
import { getClient as getClientFromResolver } from "../utils";
import BigNumber from 'bignumber.js';

// Configure BigNumber
const DECIMALS = 9;
const DECIMAL_MULTIPLIER = new BigNumber(10).pow(DECIMALS);

BigNumber.config({
  DECIMAL_PLACES: DECIMALS,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  EXPONENTIAL_AT: [-DECIMALS, DECIMALS]
});

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

      return new BigNumber(totalBalance)
        .dividedBy(new BigNumber(MIST_PER_SUI))
        .toNumber();
    } catch (error) {
      console.error("Error fetching SUI balance:", error);
      throw new Error("Failed to fetch SUI balance");
    }
  }

  // Get all coin balances for a wallet address
  async getAllCoinBalances(walletAddress: string) {
    try {
      let cursor : string | null | undefined = '0x'
      const allCoins = []
      while (cursor !== null) {
        const data = await getClientFromResolver().getAllCoins({
          owner: walletAddress,
          cursor: cursor === '0x' ? null : cursor,
        });
        allCoins.push(...data.data)
        cursor = data.nextCursor
      }

      // Group coins by coin type
      const coinsByType = new Map();

      // First pass: group coins by type and accumulate balances
      allCoins.forEach((coin) => {
        if (coinsByType.has(coin.coinType)) {
          // Add to existing balance
          const existingCoin = coinsByType.get(coin.coinType);
          existingCoin.balance = new BigNumber(existingCoin.balance)
            .plus(new BigNumber(coin.balance))
            .toString();
        } else {
          // First time seeing this coin type
          coinsByType.set(coin.coinType, {
            ...coin,
            balance: coin.balance,
          });
        }
      });

      // Process distinct coin data
      const coinBalances = await Promise.all(
        Array.from(coinsByType.values()).map(async (coin) => {
          const coinTypeArray = coin.coinType.split("::");
          const symbol =
            coinTypeArray.length > 2 ? coinTypeArray[2] : coin.coinType;
          const coinMetadata = await this.client.getCoinMetadata({
            coinType: coin.coinType,
          });

          const divisor = coin.coinType === "0x2::sui::SUI" 
            ? new BigNumber(MIST_PER_SUI)
            : new BigNumber(10).pow(9);

          return {
            id: coinMetadata?.id,
            coinType: coin.coinType,
            symbol: symbol,
            balance: new BigNumber(coin.balance)
              .dividedBy(divisor)
              .toNumber(),
            address: coin.coinObjectId,
            createdAt: new Date(),
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
