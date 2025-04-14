"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACTIVE_NETWORK = void 0;
const transactions_1 = require("@mysten/sui/transactions");
const sui_utils_1 = require("../sui-utils");
exports.ACTIVE_NETWORK = process.env.NETWORK || "testnet";
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
    static async deployNewCoin({ name, symbol, description, iconUrl, client, signer }) {
        name = name.toLowerCase();
        (0, sui_utils_1.generateToMoveFile)('src/template.txt', 'coin-create/sources/coin.move', { coin_module: name, coin_name: name.toUpperCase() });
        const publishResult = await (0, sui_utils_1.publishPackage)({
            packagePath: "coin-create",
            network: exports.ACTIVE_NETWORK,
            exportFileName: "coin",
        });
        const treasuryCap = publishResult.objectChanges?.find((change) => change.type === 'created' &&
            change.objectType.includes(`::coin::TreasuryCap`))?.objectId;
        const coinMetadata = publishResult.objectChanges?.find((change) => change.type === "created" &&
            change.objectType.includes(`::coin::CoinMetadata`))?.objectId;
        const packageId = publishResult.objectChanges?.find((change) => change.type === "published")?.packageId;
        const sdk = new CoinSDK(treasuryCap, client, packageId, coinMetadata);
        await sdk.updateCoinInfo({
            name,
            symbol,
            description: description || "",
            iconUrl: iconUrl || "",
            signer,
        });
        return sdk;
    }
    async updateCoinInfo({ name, symbol, description, iconUrl, signer }) {
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
        return await (0, sui_utils_1.signAndExecute)(tx, exports.ACTIVE_NETWORK);
    }
    async createCoinAndTransfer({ amount, recipient }) {
        const tx = new transactions_1.Transaction();
        const { moduleName } = await (0, sui_utils_1.getModuleName)(this.treasuryCap, exports.ACTIVE_NETWORK);
        tx.moveCall({
            target: `${this.packageId}::${moduleName}::create_and_transfer`,
            arguments: [
                tx.object(this.treasuryCap),
                tx.pure.address(recipient),
                tx.pure.u64(amount),
            ],
        });
        return await (0, sui_utils_1.signAndExecute)(tx, exports.ACTIVE_NETWORK);
    }
}
exports.default = CoinSDK;
