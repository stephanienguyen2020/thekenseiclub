import {SuiClient, SuiObjectChange, SuiTransactionBlockResponse} from "@mysten/sui/client";
import {Transaction} from "@mysten/sui/transactions";
import {ACTIVE_NETWORK, getCoinsByType, signAndExecute} from "./utils/sui-utils";
import {AddLiquidityV2} from "@flowx-finance/sdk"
import {SUI_COIN_TYPE} from "./constant";


class BondingCurveSDK {
    private bondingCurveId: string;
    private client: SuiClient;
    private packageId: string;

    constructor(bondingCurveId: string, client: SuiClient, packageId: string) {
        this.bondingCurveId = bondingCurveId;
        this.client = client;
        this.packageId = packageId;
    }

    static async createBondingCurve<T>(
        treasuryCap: string,
        coinMetadata: string,
        migrationTarget: number,
        client: SuiClient,
        packageId: string,
        type: string,
        address: string
    ): Promise<BondingCurveSDK> {
        const tx = new Transaction();

        tx.moveCall({
            target: `${packageId}::bonding_curve::create_bonding_curve`,
            typeArguments: [type],
            arguments: [
                tx.object(treasuryCap),
                tx.object(coinMetadata),
                tx.pure.u64(migrationTarget),
            ],
        });

        const response: SuiTransactionBlockResponse = await signAndExecute(tx, ACTIVE_NETWORK, address);

        const bondingCurveId = response.objectChanges?.find(
            (change): change is Extract<SuiObjectChange, { type: "created" }> =>
                change.type === "created" &&
                change.objectType.includes("::bonding_curve::BondingCurve")
        )?.objectId as string;

        return new BondingCurveSDK(bondingCurveId, client, packageId);
    }

    async buy(
        {
            amount,
            minTokenRequired,
            coinId,
            type,
            address
        }: {
            amount: number;
            minTokenRequired: number;
            coinId?: string;
            type: string;
            address: string;
        }
    ): Promise<SuiTransactionBlockResponse> {
        const tx = new Transaction();

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

        return await signAndExecute(tx, ACTIVE_NETWORK, address);
    }

    async sell(
        {
            amount,
            minSuiRequired,
            coinId,
            type,
            address
        }: {
            amount: number;
            minSuiRequired: number;
            coinId?: string;
            type: string;
            address: string;
        }
    ): Promise<SuiTransactionBlockResponse> {
        const tx = new Transaction();

        const coins = await getCoinsByType(address, type);
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

        return await signAndExecute(tx, ACTIVE_NETWORK, address);
    }

    async migrateToFlowx(address: string) {
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

            const content = bondingCurveObj.data.content as unknown as { fields: { token_balance: string; sui_balance: string } };
            const objectType = bondingCurveObj.data.type as string;

            const tokenTypeMatch = objectType.match(/<(.+)>/);
            const tokenType = tokenTypeMatch ? tokenTypeMatch[1] : null;
            if (!tokenType) {
                throw new Error("Could not determine token type from bonding curve");
            }
            const x = content.fields.token_balance;
            const y = content.fields.sui_balance;
            const tx = new Transaction();
            tx.moveCall({
                target: `${this.packageId}::bonding_curve::withdraw_for_migration`,
                typeArguments: [tokenType],
                arguments: [
                    tx.object(this.bondingCurveId),
                    tx.pure.address(address)
                ]
            });

            // Execute withdraw transaction and wait for completion
            const withdrawTxResponse = await signAndExecute(tx, ACTIVE_NETWORK, address);

            // Wait for the transaction to be confirmed
            await this.client.waitForTransaction({
                digest: withdrawTxResponse.digest,
                timeout: 60 * 1000, // 60 seconds timeout
            });

            // @ts-ignore
            const addLiquidityV2 = new AddLiquidityV2(ACTIVE_NETWORK, this.client)
            const liquidityTx = await addLiquidityV2.buildTransaction(
                {
                    x: tokenType,
                    y: SUI_COIN_TYPE,
                },
                {
                    x, y
                },
                address,
                0.01
            );

            // Execute the transaction
            return await signAndExecute(liquidityTx as unknown as Transaction, ACTIVE_NETWORK, address);
        } catch (error) {
            console.error("Error migrating to FlowX:", error);
            throw error;
        }
    }
}

export default BondingCurveSDK;
