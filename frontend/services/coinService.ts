import {getClient, Network} from "coin-sdk/dist/src/utils/sui-utils";
import BondingCurveSDK from "coin-sdk/dist/src/bonding_curve";
import {Coin, CoinList} from "@/app/marketplace/types";
import api from "@/lib/api";
import {SuiClient} from "@mysten/sui/client";
import type {WalletAccount} from "@mysten/wallet-standard";

export const getHoldingToken = async (currentAccount: WalletAccount | null) => {
  if (!currentAccount) return [];
  const response = await api.get(
    `/holding-coins/${currentAccount?.address}`
  );
  return response.data;
};

export const getCreatedToken = async (currentAccount: WalletAccount | null) => {
  const response = await api.get(`/coins`, {
    params: {
      userId: currentAccount?.address,
    },
  });
  return response.data;
}

async function retrieveBondingCurveData(client: SuiClient, tokenId: string, bondingCurveId: string) {
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
  return {coinType, packageId, bondingCurveSdk};
}

export const buildBuyTransaction = async (tokenName: string, buyAmount: string, currentAccount: any) => {
  const network = (process.env.NEXT_PUBLIC_NETWORK || "devnet") as Network;
  const client = getClient(network);

  const coin = await getCoinsByName(tokenName);
  const {id: tokenId, bondingCurveId} = coin;

  const {coinType, packageId, bondingCurveSdk} = await retrieveBondingCurveData(client, tokenId, bondingCurveId);
  // Convert to string first to avoid precision issues, then parse as float and multiply
  const parsedAmount = parseFloat(buyAmount) * 1000000000;
  const tx = bondingCurveSdk.buildBuyTransaction({
    amount: BigInt(parsedAmount),
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

export const buildSellTransaction = async (tokenName: string, sellAmount: string, currentAccount: any) => {
  const network = (process.env.NEXT_PUBLIC_NETWORK || "devnet") as Network;
  const client = getClient(network);

  const coin = await getCoinsByName(tokenName);
  const {id: tokenId, bondingCurveId} = coin;

  const {coinType, packageId, bondingCurveSdk} = await retrieveBondingCurveData(client, tokenId, bondingCurveId);
  const parsedAmount = BigInt(sellAmount) * BigInt(1000000000);
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
}

export const getTotalValue = (holdings: Coin[] | undefined) => {
  return holdings
    ? holdings
      .reduce((sum, coin: any) => {
        // Use any type to bypass TypeScript's strict checking
        return sum + (coin.balance || 0) * (coin.price || 0);
      }, 0)
      .toFixed(2)
    : "0.00";
}

export const getChanges24h = (holdings: Coin[] | undefined) => {
  return holdings
    ? holdings.length > 0
      ? holdings
        .reduce((sum, coin: any) => {
          // Use any type to bypass TypeScript's strict checking
          const coinValue = (coin.balance || 0) * (coin.price || 0);
          const coinChange = coinValue * ((coin.change24h || 0) / 100);
          return sum + coinChange;
        }, 0)
        .toFixed(2)
      : "0.00"
    : "0.00";
}