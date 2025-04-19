import CoinSDK from "./coin";
import {getClient} from "../sui-utils";
import {BONDING_CURVE_MODULE_PACKAGE_ID} from "./constant";
import BondingCurveSDK from "./bonding_curve";


const address = "0x89052a175017eb52f49d24e7de1f48b0c38c6b1d67f9fc4e471420524e4dc2d4"
const treasuryCap = "0xd5a8f35f3f4abc206e5d97a21b1bc6c5845464386f0abc4a8903173a66e2564f"
const client = getClient("testnet");
const coinCreationPackageId = "0xb99fae772e06a49ef626d4122b40c571c13a858033f1b1ade71a94149a3b9189"
const coinMetadata = "0x336864ff9f4a86311489da15082f3092c2c1cb2c8412cd19e924ee147e63f71e"

const coinSdk = new CoinSDK(treasuryCap, client, coinCreationPackageId, coinMetadata);
const coinType = "0x911a8131ea73f03d51af3188205db9bfd8934e054376b6a0b5e0063284517726::taykiki::TAYKIKI";

const suiCoinId = "0x99a122a72ed9c1130b5f9583ee7357f4784c898b9e732ddac96f59283cf0fae4"
const suiCoinType = "0x2::coin::Coin<0x2::sui::SUI>";

const bondingCurvePackageId = BONDING_CURVE_MODULE_PACKAGE_ID;
const bondingCurveObjectId = "0xc286e78c52b2817ce11e21c97cfdb2c57229f15807b67076e202c35a3467826a"

//Publish new coin
// CoinSDK.deployNewCoin({
//     name: "TAYKIKI",
//     symbol: "TAYKIKI",
//     description: "TAYKIKI",
//     iconUrl: "https://avatars.githubusercontent.com/u/42907738?v=4",
//     client,
//     address
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
const bondingCurveSdk = new BondingCurveSDK(bondingCurveObjectId, client, bondingCurvePackageId);
bondingCurveSdk.buy({
    amount: 10000000,
    minTokenRequired: 0,
    type: coinType,
    address: address
})

// bondingCurveSdk.sell({
//     amount: 164972779491383,
//     minSuiRequired: 0,
//     type: coinType,
//     address: address
// })

// bondingCurveSdk.migrateToFlowx(address);
export {CoinSDK};
