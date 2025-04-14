"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transactions_1 = require("@mysten/sui/transactions");
const sui_utils_1 = require("../sui-utils");
const sui_utils_2 = require("../sui-utils");
class BondingCurveSDK {
    bondingCurveId;
    client;
    packageId;
    constructor(bondingCurveId, client, packageId) {
        this.bondingCurveId = bondingCurveId;
        this.client = client;
        this.packageId = packageId;
    }
    static async createBondingCurve(treasuryCap, coinMetadata, migrationTarget, client, packageId, type, address) {
        const tx = new transactions_1.Transaction();
        tx.moveCall({
            target: `${packageId}::bonding_curve::create_bonding_curve`,
            typeArguments: [type],
            arguments: [
                tx.object(treasuryCap),
                tx.object(coinMetadata),
                tx.pure.u64(migrationTarget),
            ],
        });
        const response = await (0, sui_utils_1.signAndExecute)(tx, sui_utils_2.ACTIVE_NETWORK, address);
        const bondingCurveId = response.objectChanges?.find((change) => change.type === "created" &&
            change.objectType.includes("::bonding_curve::BondingCurve"))?.objectId;
        console.log("Bonding Curve ID:", bondingCurveId);
        return new BondingCurveSDK(bondingCurveId, client, packageId);
    }
    async buy({ amount, minTokenRequired, coinId, type, address }) {
        const tx = new transactions_1.Transaction();
        const [suiCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);
        tx.moveCall({
            target: `${this.packageId}::bonding_curve::buy`,
            typeArguments: [type],
            arguments: [
                tx.object(this.bondingCurveId),
                suiCoin,
                tx.pure.u64(amount),
                tx.pure.u64(minTokenRequired),
            ],
        });
        return await (0, sui_utils_1.signAndExecute)(tx, sui_utils_2.ACTIVE_NETWORK, address);
    }
    async sell({ amount, minSuiRequired, coinId, type, address }) {
        const tx = new transactions_1.Transaction();
        const coins = await (0, sui_utils_1.getCoinsByType)(address, type);
        if (coins.length === 0) {
            throw new Error(`No coin of type ${type} found in wallet`);
        }
        const [splitCoin] = tx.splitCoins(tx.object(coins[0].coinObjectId), [tx.pure.u64(amount)]);
        tx.moveCall({
            target: `${this.packageId}::bonding_curve::sell`,
            typeArguments: [type],
            arguments: [
                tx.object(this.bondingCurveId),
                splitCoin,
                tx.pure.u64(amount),
                tx.pure.u64(minSuiRequired),
            ],
        });
        return await (0, sui_utils_1.signAndExecute)(tx, sui_utils_2.ACTIVE_NETWORK, address);
    }
}
exports.default = BondingCurveSDK;
