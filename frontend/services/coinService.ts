import { Coin } from "@/app/marketplace/types";
import api from "@/lib/api";
import { SuiClient } from "@mysten/sui/client";
import type { WalletAccount } from "@mysten/wallet-standard";
import BigNumber from "bignumber.js";
import BondingCurveSDK from "coin-sdk/dist/src/bonding_curve";
import { getClient, Network } from "coin-sdk/dist/src/utils/sui-utils";
import { safeMultiply, toBlockchainAmount } from "../lib/priceUtils";

export const getHoldingToken = async (
  currentAccount: WalletAccount | null
): Promise<Coin[]> => {
  if (!currentAccount) return [];
  try {
    const response = await api.get(`/holding-coins/${currentAccount.address}`);
    const data = response.data.data;

    // Calculate value for each coin
    return data.map((coin: Coin) => ({
      ...coin,
      value: safeMultiply(coin.price, coin.holdings || 0),
    }));
  } catch (error) {
    console.error("Error fetching holdings:", error);
    return [];
  }
};

export const getCreatedToken = async (currentAccount: WalletAccount | null) => {
  const response = await api.get(`/coins`, {
    params: {
      userId: currentAccount?.address,
    },
  });
  return response.data;
};

async function retrieveBondingCurveData(
  client: SuiClient,
  tokenId: string,
  bondingCurveId: string
) {
  const coinMetadata = await client.getObject({
    id: tokenId,
    options: {
      showType: true,
      showContent: true,
    },
  });
  const coinMetadataType = coinMetadata.data?.type || "";
  const match = coinMetadataType.match(/CoinMetadata<(.+)>/);
  const coinType = match ? match[1] : "";
  const packageId =
    process.env.NEXT_PUBLIC_PACKAGE_ID ||
    "0x8193d051bd13fb4336ad595bbb78dac06fa64ff1c3c3c184483ced397c9d2116";
  const bondingCurveSdk = new BondingCurveSDK(
    bondingCurveId,
    client,
    packageId
  );
  return { coinType, packageId, bondingCurveSdk };
}

export const buildBuyTransaction = async (
  tokenName: string,
  buyAmount: string,
  currentAccount: any
) => {
  const network = (process.env.NEXT_PUBLIC_NETWORK || "devnet") as Network;
  const client = getClient(network);

  const coin = await getCoinsByName(tokenName);
  const { id: tokenId, bondingCurveId } = coin;

  const { coinType, packageId, bondingCurveSdk } =
    await retrieveBondingCurveData(client, tokenId, bondingCurveId);
  const parsedAmount = toBlockchainAmount(buyAmount);
  const tx = bondingCurveSdk.buildBuyTransaction({
    amount: parsedAmount,
    minTokenRequired: BigInt(0),
    type: coinType,
    address: currentAccount?.address || "",
  });

  return {
    buyTransaction: tx,
    bondingCurveId,
    packageId,
  };
};

export const buildSellTransaction = async (
  tokenName: string,
  sellAmount: string,
  currentAccount: any
) => {
  const network = (process.env.NEXT_PUBLIC_NETWORK || "devnet") as Network;
  const client = getClient(network);

  const coin = await getCoinsByName(tokenName);
  const { id: tokenId, bondingCurveId } = coin;

  const { coinType, packageId, bondingCurveSdk } =
    await retrieveBondingCurveData(client, tokenId, bondingCurveId);
  console.log("sellAmount", sellAmount);
  const parsedAmount = toBlockchainAmount(sellAmount);

  const tx = await bondingCurveSdk.buildSellTransaction({
    amount: parsedAmount,
    minSuiRequired: BigInt(0),
    type: coinType,
    address: currentAccount?.address || "",
    network: (process.env.NEXT_PUBLIC_NETWORK || "devnet") as Network,
  });
  return {
    sellTransaction: tx,
    bondingCurveId,
    packageId,
  };
};

const getCoinsByName = async (coinName: string) => {
  const coins = await api.get<Coin>(`/coin/name/${coinName}`);
  return coins.data;
};

export const getTotalValue = (holdings: Coin[] | undefined) => {
  if (!holdings) return "0.00";
  console.log("holdings", holdings);

  return holdings
    .reduce((sum, coin) => {
      const bnBalance = new BigNumber(coin.balance || 0);
      const bnPrice = new BigNumber(coin.price || 0);
      const value = bnBalance.times(bnPrice);
      return sum.plus(value);
    }, new BigNumber(0))
    .toFixed(2);
};

export const getChanges24h = (holdings: Coin[] | undefined) => {
  if (!holdings || holdings.length === 0) return "0.00";

  return holdings
    .reduce((sum, coin) => {
      const bnBalance = new BigNumber(coin.balance || 0);
      const bnPrice = new BigNumber(coin.price || 0);
      const bnChange = new BigNumber(coin.change24h || 0);

      const coinValue = bnBalance.times(bnPrice);
      const coinChange = coinValue.times(bnChange.dividedBy(100));

      return sum.plus(coinChange);
    }, new BigNumber(0))
    .toFixed(2);
};
