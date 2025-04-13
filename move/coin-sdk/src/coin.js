"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transactions_1 = require("@mysten/sui/transactions");
const sui_utils_1 = require("../sui-utils");
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
    static async deployNewCoin(name, symbol, description, iconUrl, client, signer) {
        const publishResult = await (0, sui_utils_1.publishPackage)({
            packagePath: "../../meme",
            network: "localnet",
            exportFileName: "coin",
        });
        const treasuryCap = publishResult.objectChanges?.find((change) => change.type === 'created' &&
            change.objectType.includes('::coin::TreasuryCap'))?.objectId;
        const coinMetadata = publishResult.objectChanges?.find((change) => change.type === "created" &&
            change.objectType.includes("::coin::CoinMetadata"))?.objectId;
        const packageId = publishResult.objectChanges?.find((change) => change.type === "published")?.packageId;
        const sdk = new CoinSDK(treasuryCap, client, packageId, coinMetadata);
        await sdk.updateCoinInfo(name, symbol, description, iconUrl, signer);
        return sdk;
    }
    async updateCoinInfo(name, symbol, description, iconUrl, signer) {
        if (!this.coinMetadata) {
            throw new Error("Coin metadata object ID is required to update coin info");
        }
        const tx = new transactions_1.Transaction();
        tx.moveCall({
            target: `${this.packageId}::coin::update_coin_info`,
            arguments: [
                tx.pure.string(name),
                tx.pure.string(symbol),
                tx.pure.string(description),
                tx.pure.string(iconUrl),
                tx.object(this.treasuryCap),
                tx.object(this.coinMetadata),
            ],
        });
        return await (0, sui_utils_1.signAndExecute)(tx, 'localnet');
    }
    async createCoinAndTransfer(amount, recipient) {
        const tx = new transactions_1.Transaction();
        tx.moveCall({
            target: `${this.packageId}::coin::create_and_transfer`,
            arguments: [
                tx.object(this.treasuryCap),
                tx.pure.address(recipient),
                tx.pure.u64(amount),
            ],
        });
        return await (0, sui_utils_1.signAndExecute)(tx, 'localnet');
    }
}
exports.default = CoinSDK;
