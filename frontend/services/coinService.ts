import {getClient, Network} from "coin-sdk/dist/src/utils/sui-utils";
import BondingCurveSDK from "coin-sdk/dist/src/bonding_curve";
import { Coin } from "@/app/marketplace/types";
import api from "@/lib/api";
import {SuiClient} from "@mysten/sui/client";

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

export const builtBuyTransaction = async (tokenName: string, buyAmount: string, currentAccount: any ) => {
  const network = (process.env.NEXT_PUBLIC_NETWORK || "devnet") as Network;
  const client = getClient(
    (process.env.NEXT_PUBLIC_NETWORK || "devnet") as Network
  );

  const coins = await getCoinsByName(tokenName);
  const {id: tokenId, bondingCurveId} = coins[0];

  const {coinType, packageId, bondingCurveSdk} = await retrieveBondingCurveData(client, tokenId, bondingCurveId);
  // Convert to string first to avoid precision issues, then parse as float and multiply
  const parsedAmount = BigInt(buyAmount) * BigInt(1000000000);
  const tx = bondingCurveSdk.buildBuyTransaction({
    amount: parsedAmount,
    minTokenRequired: BigInt(0),
    type: coinType,
    address: currentAccount?.address || "",
  });

  return tx;

  // signAndExecuteTransaction(
  //   {
  //     transaction: tx,
  //     chain: `sui:${network}`,
  //   },
  //   {
  //     onSuccess: (result: any) => {
  //       api.get<{message: string}>(`/migrate`, {
  //         params: {
  //           bondingCurveId,
  //           packageId,
  //         },
  //       }).then((result) => {
  //         console.log("migration status", result.data.message);
  //       });
  //       console.log("Buy successfully", result);
  //     },
  //     onError: (error: any) => {
  //       console.log("error", error);
  //     }
  //   }
  // );
};

const getCoinsByName = async (coinName: string) => {
  const coins = await api.get<Coin[]>(`/coin/name/${coinName}`);
  return coins.data;
}