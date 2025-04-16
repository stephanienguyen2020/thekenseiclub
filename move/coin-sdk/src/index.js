"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinSDK = void 0;
const coin_1 = __importDefault(require("./coin"));
exports.CoinSDK = coin_1.default;
const sui_utils_1 = require("../sui-utils");
const bonding_curve_1 = __importDefault(require("./bonding_curve"));
const constant_1 = require("./constant");
const address = "0x89052a175017eb52f49d24e7de1f48b0c38c6b1d67f9fc4e471420524e4dc2d4";
const treasuryCap = "0xd5a8f35f3f4abc206e5d97a21b1bc6c5845464386f0abc4a8903173a66e2564f";
const client = (0, sui_utils_1.getClient)("testnet");
const coinCreationPackageId = "0xb99fae772e06a49ef626d4122b40c571c13a858033f1b1ade71a94149a3b9189";
const coinMetadata = "0x336864ff9f4a86311489da15082f3092c2c1cb2c8412cd19e924ee147e63f71e";
const coinSdk = new coin_1.default(treasuryCap, client, coinCreationPackageId, coinMetadata);
const coinType = "0x9c494550d6941d8b3aeb37caa6190d9d6d74c0699026a48da578e6acac03670a::hehehe::HEHEHE";
const suiCoinId = "0x99a122a72ed9c1130b5f9583ee7357f4784c898b9e732ddac96f59283cf0fae4";
const suiCoinType = "0x2::coin::Coin<0x2::sui::SUI>";
const bondingCurvePackageId = constant_1.BONDING_CURVE_MODULE_PACKAGE_ID;
const bondingCurveObjectId = "0x9b98d39ca4771b39ab117225cf6ae9ff3c4b96e5ef991a6df1f54b7ec48227bc";
//Publish new coin
// CoinSDK.deployNewCoin({
//     name: "HEHEHE",
//     symbol: "HEHEHE",
//     description: "HEHEHE",
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
const bondingCurveSdk = new bonding_curve_1.default(bondingCurveObjectId, client, bondingCurvePackageId);
// bondingCurveSdk.buy({
//     amount: 10000000,
//     minTokenRequired: 0,
//     type: coinType,
//     address: address
// })
// bondingCurveSdk.sell({
//     amount: 164972779491383,
//     minSuiRequired: 0,
//     type: coinType,
//     address: address
// })
bondingCurveSdk.migrateToFlowx(address);
