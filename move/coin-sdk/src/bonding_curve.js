"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transactions_1 = require("@mysten/sui/transactions");
const sui_utils_1 = require("../sui-utils");
const sui_utils_2 = require("../sui-utils");
const sdk_1 = require("@flowx-finance/sdk");
const constant_1 = require("./constant");
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
    async migrateToFlowx(address) {
        try {
            const bondingCurveObj = await this.client.getObject({
                id: this.bondingCurveId,
                options: {
                    showType: true,
                    showContent: true
                }
            });
            if (!bondingCurveObj.data || !bondingCurveObj.data.content) {
                throw new Error("Failed to get bonding curve data");
            }
            const content = bondingCurveObj.data.content;
            console.log("content", content);
            const objectType = bondingCurveObj.data.type;
            const tokenTypeMatch = objectType.match(/<(.+)>/);
            const tokenType = tokenTypeMatch ? tokenTypeMatch[1] : null;
            if (!tokenType) {
                throw new Error("Could not determine token type from bonding curve");
            }
            const x = content.fields.token_balance;
            const y = content.fields.sui_balance;
            const tx = new transactions_1.Transaction();
            tx.moveCall({
                target: `${this.packageId}::bonding_curve::withdraw_for_migration`,
                typeArguments: [tokenType],
                arguments: [
                    tx.object(this.bondingCurveId),
                    tx.pure.address(address)
                ]
            });
            // Execute withdraw transaction and wait for completion
            const withdrawTxResponse = await (0, sui_utils_1.signAndExecute)(tx, sui_utils_2.ACTIVE_NETWORK, address);
            console.log("Withdraw transaction submitted, digest:", withdrawTxResponse.digest);
            // Wait for the transaction to be confirmed
            await this.client.waitForTransaction({
                digest: withdrawTxResponse.digest,
                timeout: 60 * 1000, // 60 seconds timeout
            });
            console.log("Withdraw transaction confirmed, proceeding with adding liquidity");
            // @ts-ignore
            const addLiquidityV2 = new sdk_1.AddLiquidityV2(sui_utils_2.ACTIVE_NETWORK, this.client);
            const liquidityTx = await addLiquidityV2.buildTransaction({
                x: tokenType,
                y: constant_1.SUI_COIN_TYPE,
            }, {
                x, y
            }, address, 0.01);
            // Execute the transaction
            return await (0, sui_utils_1.signAndExecute)(liquidityTx, sui_utils_2.ACTIVE_NETWORK, address);
        }
        catch (error) {
            console.error("Error migrating to FlowX:", error);
            throw error;
        }
    }
}
exports.default = BondingCurveSDK;
