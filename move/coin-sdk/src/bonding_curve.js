"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transactions_1 = require("@mysten/sui/transactions");
const sui_utils_1 = require("../sui-utils");
class BondingCurveSDK {
    bondingCurveId;
    client;
    packageId;
    constructor(bondingCurveId, client, packageId) {
        this.bondingCurveId = bondingCurveId;
        this.client = client;
        this.packageId = packageId;
    }
    static async createBondingCurve(treasuryCap, coinMetadata, migrationTarget, client, packageId, type, signer) {
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
        const response = await (0, sui_utils_1.signAndExecute)(tx, "localnet");
        console.log({ response });
        const bondingCurveId = response.objectChanges?.find((change) => change.type === "created" &&
            change.objectType.includes("::bonding_curve::BondingCurve"))?.objectId;
        return new BondingCurveSDK(bondingCurveId, client, packageId);
    }
    async buy(amount, minTokenRequired, coinId, signer) {
        const tx = new transactions_1.Transaction();
        tx.moveCall({
            target: `${this.packageId}::bonding_curve::buy`,
            arguments: [
                tx.object(this.bondingCurveId),
                tx.object(coinId),
                tx.pure.u64(amount),
                tx.pure.u64(minTokenRequired),
            ],
        });
        return await (0, sui_utils_1.signAndExecute)(tx, "localnet");
    }
    async sell(amount, minSuiRequired, coinId, signer) {
        const tx = new transactions_1.Transaction();
        tx.moveCall({
            target: `${this.packageId}::bonding_curve::sell`,
            arguments: [
                tx.object(this.bondingCurveId),
                tx.object(coinId),
                tx.pure.u64(amount),
                tx.pure.u64(minSuiRequired),
            ],
        });
        return await (0, sui_utils_1.signAndExecute)(tx, "localnet");
    }
}
exports.default = BondingCurveSDK;
