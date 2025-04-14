import CoinSDK from "./coin";
import {getClient} from "../sui-utils";
import BondingCurveSDK from "./bonding_curve";

const address = "0x89052a175017eb52f49d24e7de1f48b0c38c6b1d67f9fc4e471420524e4dc2d4"
const treasuryCap = "0xd5a8f35f3f4abc206e5d97a21b1bc6c5845464386f0abc4a8903173a66e2564f"
const client = getClient("localnet");
const coinCreationPackageId = "0xb99fae772e06a49ef626d4122b40c571c13a858033f1b1ade71a94149a3b9189"
const coinMetadata = "0x336864ff9f4a86311489da15082f3092c2c1cb2c8412cd19e924ee147e63f71e"

const coinSdk = new CoinSDK(treasuryCap, client, coinCreationPackageId, coinMetadata);
const coinType = "0x7c34f54654ac019ba91a7f898c87350d9232229f359dbb723cc071b846122e75::senachill::SENACHILL";

const suiCoinId = "0x99a122a72ed9c1130b5f9583ee7357f4784c898b9e732ddac96f59283cf0fae4"
const suiCoinType = "0x2::coin::Coin<0x2::sui::SUI>";

const bondingCurvePackageId = "0x81d7ca09e6d2cc04a27be4508355690cab345665440538fe7bac0b583cb79db0";
const bondingCurveObjectId = "0x6b3509e6d517a2d1ff2319dd1a7705d341d3e38189e626f6fbc58014deb5f8f5"

//Publish new coin
CoinSDK.deployNewCoin({
    name: "HEHEHE",
    symbol: "HEHEHE",
    description: "HEHEHE",
    iconUrl: "https://ichef.bbci.co.uk/ace/standard/976/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg",
    client,
    address
});

//Mint and transfer coin
// coinSdk.createCoinAndTransfer({
//     amount: 10000000000,
//     recipient: address,
//     address
// });

//Create bonding curve
// BondingCurveSDK.createBondingCurve(treasuryCap, coinMetadata, 10000000000000000000, client, bondingCurvePackageId, coinType, address);

// Buy, sell bonding curve
// const bondingCurveSdk = new BondingCurveSDK(bondingCurveObjectId, client, bondingCurvePackageId);
// bondingCurveSdk.buy({
//     amount: 5000000000,
//     minTokenRequired: 0,
//     coinId: suiCoinId,
//     type: coinType,
//     address: address
// })

// bondingCurveSdk.sell({
//     amount: 100000000000000000,
//     minSuiRequired: 0,
//     coinId: suiCoinId,
//     type: coinType,
//     address: address
// })

export {CoinSDK};
