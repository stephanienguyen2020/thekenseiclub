import { getClient } from "../src/utils/sui-utils";
import {
  BONDING_CURVE_MODULE_PACKAGE_ID,
  BondingCurveSDK,
  CoinSDK,
} from "../src";
import "dotenv/config";

const address =
  "0x89052a175017eb52f49d24e7de1f48b0c38c6b1d67f9fc4e471420524e4dc2d4";
const treasuryCap =
  "0xd5a8f35f3f4abc206e5d97a21b1bc6c5845464386f0abc4a8903173a66e2564f";
const client = getClient("devnet");
const coinCreationPackageId =
  "0xb99fae772e06a49ef626d4122b40c571c13a858033f1b1ade71a94149a3b9189";
const coinMetadata =
  "0x5469a27b060701f99f9d3c0ca68b6ebfd3c541176c3012d25dfaf286e85bf6c7";

// const coinSdk = new CoinSDK(treasuryCap, client, coinCreationPackageId, coinMetadata);
const coinType =
  "0xc65e94f58fcbfcb155e01899eae9df1eac50c530d5644e6f0780720dd50c51d9::taykeke::TAYKEKE";

const suiCoinId =
  "0x99a122a72ed9c1130b5f9583ee7357f4784c898b9e732ddac96f59283cf0fae4";
const suiCoinType = "0x2::coin::Coin<0x2::sui::SUI>";

const bondingCurvePackageId = process.env.PACKAGE_ID || "";
const bondingCurveObjectId =
  "0x85134877ccc37eadc28d852588350f116a981ef4ee6d842726d14bc4b0ec917e";

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
const bondingCurveSdk = new BondingCurveSDK(
  bondingCurveObjectId,
  client,
  bondingCurvePackageId
);
// bondingCurveSdk.buy({
//   amount: 1000000000,
//   minTokenRequired: 0,
//   type: coinType,
//   address: address,
// });

bondingCurveSdk.sell({
  amount: 24600191533825785n,
  minSuiRequired: 0n,
  type: coinType,
  address: address,
});

// bondingCurveSdk.migrateToFlowx(address);
