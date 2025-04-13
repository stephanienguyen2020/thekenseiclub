"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinSDK = void 0;
const coin_1 = __importDefault(require("./coin"));
exports.CoinSDK = coin_1.default;
coin_1.default.deployNewCoin("TAO", "TAO", "TAO Coin", "https://example.com/icon.png", {}, {});
