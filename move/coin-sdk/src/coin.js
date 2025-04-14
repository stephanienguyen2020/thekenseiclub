"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const transactions_1 = require("@mysten/sui/transactions");
const sui_utils_1 = require("../sui-utils");
const bonding_curve_1 = __importDefault(require("./bonding_curve"));
const constant_1 = require("./constant");
class CoinSDK {
    treasuryCap;
    client;
    packageId;
    coinMetadata;
    constructor(treasuryCap, client, packageId, coinMetadata) {
        this.treasuryCap = treasuryCap;
        this.client = client;
        this.packageId = packageId;
        this.coinMetadata = coinMetadata;
    }
    static async deployNewCoin({ name, symbol, description, iconUrl, client, address }) {
        name = name.toLowerCase();
        (0, sui_utils_1.generateToMoveFile)('src/template.txt', 'coin-create/sources/coin.move', {
            coin_module: name,
            coin_name: name.toUpperCase(),
            coin_symbol: symbol,
            coin_description: description,
            coin_icon_url: iconUrl
        });
        const publishResult = await (0, sui_utils_1.publishPackage)({
            packagePath: "coin-create",
            network: sui_utils_1.ACTIVE_NETWORK,
            exportFileName: "coin",
            address
        });
        const treasuryCap = publishResult.objectChanges?.find((change) => change.type === 'created' &&
            change.objectType.includes(`::coin::TreasuryCap`))?.objectId;
        const coinMetadata = publishResult.objectChanges?.find((change) => change.type === "created" &&
            change.objectType.includes(`::coin::CoinMetadata`))?.objectId;
        const packageId = publishResult.objectChanges?.find((change) => change.type === "published")?.packageId;
        console.log("packageId", packageId);
        console.log("coinMetadata", coinMetadata);
        console.log("treasuryCap", treasuryCap);
        console.log(`${packageId}::${name}::${name.toUpperCase()}`);
        await bonding_curve_1.default.createBondingCurve(treasuryCap, coinMetadata, 10000000000000000000, (0, sui_utils_1.getClient)(sui_utils_1.ACTIVE_NETWORK), constant_1.BONDING_CURVE_MODULE_PACKAGE_ID, `${packageId}::${name}::${name.toUpperCase()}`, address);
    }
    async updateCoinInfo({ name, symbol, description, iconUrl, address }) {
        if (!this.coinMetadata) {
            throw new Error("Coin metadata object ID is required to update coin info");
        }
        const tx = new transactions_1.Transaction();
        tx.moveCall({
            target: `${this.packageId}::${name}::update_coin_info`,
            arguments: [
                tx.pure.string(name),
                tx.pure.string(symbol),
                tx.pure.string(description),
                tx.pure.string(iconUrl),
                tx.object(this.treasuryCap),
                tx.object(this.coinMetadata),
            ],
        });
        return await (0, sui_utils_1.signAndExecute)(tx, sui_utils_1.ACTIVE_NETWORK, address);
    }
    async createCoinAndTransfer({ amount, recipient, address }) {
        const tx = new transactions_1.Transaction();
        const { moduleName } = await (0, sui_utils_1.getModuleName)(this.treasuryCap, sui_utils_1.ACTIVE_NETWORK);
        tx.moveCall({
            target: `${this.packageId}::${moduleName}::create_and_transfer`,
            arguments: [
                tx.object(this.treasuryCap),
                tx.pure.address(recipient),
                tx.pure.u64(amount),
            ],
        });
        return await (0, sui_utils_1.signAndExecute)(tx, sui_utils_1.ACTIVE_NETWORK, address);
    }
}
exports.default = CoinSDK;
