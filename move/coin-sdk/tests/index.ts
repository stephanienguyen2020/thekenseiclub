import "dotenv/config";
import { BondingCurveSDK } from "../src";
import { SUI_COIN_TYPE } from "../src/constant";
import { buildSwapTransaction } from "../src/flowx";
import { getClient, signAndExecute } from "../src/utils/sui-utils";

const address =
  "0x89052a175017eb52f49d24e7de1f48b0c38c6b1d67f9fc4e471420524e4dc2d4";
const treasuryCap =
  "0xd5a8f35f3f4abc206e5d97a21b1bc6c5845464386f0abc4a8903173a66e2564f";
const client = getClient("testnet");
const coinCreationPackageId =
  "0xb99fae772e06a49ef626d4122b40c571c13a858033f1b1ade71a94149a3b9189";
const coinMetadata =
  "0x5469a27b060701f99f9d3c0ca68b6ebfd3c541176c3012d25dfaf286e85bf6c7";

// const coinSdk = new CoinSDK(treasuryCap, client, coinCreationPackageId, coinMetadata);
const coinType =
  "0x804697462d12bbeddf43a5d7de21a782a72ec1f700df3e4b7fb8f0d3e05e1a84::sneezingpandacoin::SNEEZINGPANDACOIN";

const suiCoinId =
  "0x99a122a72ed9c1130b5f9583ee7357f4784c898b9e732ddac96f59283cf0fae4";
const suiCoinType = "0x2::coin::Coin<0x2::sui::SUI>";

const bondingCurvePackageId =
  "0x8a0e842265d44e3063405bd575cc9e22f10c86fa707858dbf00bdfa506d93aed";
const bondingCurveObjectId =
  "0xda55eeff15dfaf51daf548424dbdd605e603ccabc869b1da88e9000800f21a40";

//Publish new coin
//
// CoinSDK.deployNewCoin({
//   name: "TAYKEKE",
//   symbol: "TAYKEKE",
//   description: "TAYKEKE",
//   iconUrl: "https://avatars.githubusercontent.com/u/42907738?v=4",
//   client,
//   address,
// });

//Mint and transfer coin
// coinSdk.createCoinAndTransfer({
//     amount: 10000000000,
//     recipient: address,
//     address
// });

//Create bonding curve
// BondingCurveSDK.createBondingCurve(treasuryCap, coinMetadata, 10000000000000000000, client, bondingCurvePackageId, coinType, address);

// Buy, sell bonding curve
// const bondingCurveSdk = new BondingCurveSDK(
//   bondingCurveObjectId,
//   client,
//   bondingCurvePackageId
// );

// bondingCurveSdk.buy({
//   amount: 100000000n,
//   minTokenRequired: 0n,
//   type: coinType,
//   address: address,
// });

// bondingCurveSdk.sell({
//   amount: 412469n,
//   minSuiRequired: 0n,
//   type: coinType,
//   address: address,
// });

// bondingCurveSdk.migrateToFlowx(address);

// async function migrateToFlowx(address: string) {
//   try {
//     const tx = new Transaction();
//     // @ts-ignore
//     const addLiquidityV2 = new AddLiquidityV2("testnet", client);
//     const liquidityTx = await addLiquidityV2.buildTransaction(
//       {
//         x: "0xbc03aaab4c11eb84df8bf39fdc714fa5d5b65b16eb7d155e22c74a68c8d4e17f::coin::COIN",
//         y: SUI_COIN_TYPE,
//       },
//       {
//         x: "100000000",
//         y: "100000000",
//       },
//       address,
//       0.01
//     );

//     // Execute the transaction
//     // @ts-ignore
//     return await signAndExecute(liquidityTx, "testnet", address);
//   } catch (error) {
//     console.error("Error migrating to FlowX:", error);
//     throw error;
//   }
// }
// migrateToFlowx(address);

// async function getRoutesTest(address: string) {
//   const routes = await getRoutes(
//     "0xbc03aaab4c11eb84df8bf39fdc714fa5d5b65b16eb7d155e22c74a68c8d4e17f::coin::COIN",
//     SUI_COIN_TYPE,
//     "10000000"
//   );
//   console.log(routes);
// }

// getRoutesTest(address);

// async function swap(address: string) {
//   const swapTx = await buildSwapTransaction(
//     "0xbc03aaab4c11eb84df8bf39fdc714fa5d5b65b16eb7d155e22c74a68c8d4e17f::coin::COIN",
//     SUI_COIN_TYPE,
//     "10000000",
//     address,
//     "testnet"
//   );

//   await signAndExecute(swapTx, "testnet", address);
//   console.log(swapTx);
// }

// swap(address);

async function swapAndBuy(address: string) {
  const swapTx = await buildSwapTransaction(
    "0xbc03aaab4c11eb84df8bf39fdc714fa5d5b65b16eb7d155e22c74a68c8d4e17f::coin::COIN",
    SUI_COIN_TYPE,
    "10000000",
    address,
    "testnet"
  );

  const bondingCurveSdk = new BondingCurveSDK(
    bondingCurveObjectId,
    client,
    bondingCurvePackageId
  );

  const buyTx = bondingCurveSdk.buildBuyTransaction({
    amount: 100000000n,
    minTokenRequired: 0n,
    type: coinType,
    address: address,
    transaction: swapTx as any,
  });

  await signAndExecute(buyTx, "testnet", address);
  console.log(buyTx);
}

swapAndBuy(address);
