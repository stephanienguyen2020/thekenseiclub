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
const treasuryCap = "0x50035953004f7fc2cadbed6e0eba215630ae29b6796078de913c508cf1e35029";
const client = (0, sui_utils_1.getClient)("localnet");
const packageId = "0xd082437cd54ac3be2ffee0c315e48c88975fd2d8ce3a445ee5c01cb2094faa61";
const coinMetadata = "0x58d6fa0d893bea5af8c52be2ee83f68d075b2912ecb8036d1352b4b425296b0f";
// const coinSdk = new CoinSDK(treasuryCap, client, packageId, coinMetadata);
// CoinSDK.deployNewCoin("TAO", "TAO", "TAO Coin", "https://example.com/icon.png", {} as any, {} as any);
// coinSdk.createCoinAndTransfer(10000000000000000000, "0x89052a175017eb52f49d24e7de1f48b0c38c6b1d67f9fc4e471420524e4dc2d4");
//
const type = "0x2::coin::Coin<0xd082437cd54ac3be2ffee0c315e48c88975fd2d8ce3a445ee5c01cb2094faa61::coin::COIN>";
bonding_curve_1.default.createBondingCurve(treasuryCap, coinMetadata, 10000000000000000000, client, packageId, type, {});
