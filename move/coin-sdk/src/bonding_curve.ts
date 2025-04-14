import {SuiClient, SuiObjectChange, SuiTransactionBlockResponse} from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import {getCoinsByType, Network, signAndExecute} from "../sui-utils";
import {ACTIVE_NETWORK} from "../sui-utils";

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
            (change): change is Extract<SuiObjectChange, {type : "created"}> =>
                change.type === "created" &&
                change.objectType.includes("::bonding_curve::BondingCurve")
        )?.objectId as string;

        console.log("Bonding Curve ID:", bondingCurveId);

        return new BondingCurveSDK(bondingCurveId, client, packageId);
    }

    async buy(
        {
            amount,
            minTokenRequired,
            coinId,
            type,
            address
        } : {
            amount: number;
            minTokenRequired: number;
            coinId: string;
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
        } : {
            amount: number;
            minSuiRequired: number;
            coinId: string;
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
}

export default BondingCurveSDK;