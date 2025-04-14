import {SuiClient, SuiObjectChange, SuiTransactionBlockResponse} from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { signAndExecute } from "../sui-utils";

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
        signer: any
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

        const response: SuiTransactionBlockResponse = await signAndExecute(tx, "localnet");

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
            signer
        } : {
            amount: number;
            minTokenRequired: number;
            coinId: string;
            type: string;
            signer: any;
        }
    ): Promise<SuiTransactionBlockResponse> {
        const tx = new Transaction();

        tx.moveCall({
            target: `${this.packageId}::bonding_curve::buy`,
            typeArguments: [type],
            arguments: [
                tx.object(this.bondingCurveId),
                tx.object(coinId),
                tx.pure.u64(amount),
                tx.pure.u64(minTokenRequired),
            ],
        });

        return await signAndExecute(tx, "localnet");
    }

    async sell(
        {
            amount,
            minSuiRequired,
            coinId,
            type,
            signer
        } : {
            amount: number;
            minSuiRequired: number;
            coinId: string;
            type: string;
            signer: any;
        }
    ): Promise<SuiTransactionBlockResponse> {
        const tx = new Transaction();

        tx.moveCall({
            target: `${this.packageId}::bonding_curve::sell`,
            typeArguments: [type],
            arguments: [
                tx.object(this.bondingCurveId),
                tx.object(coinId),
                tx.pure.u64(amount),
                tx.pure.u64(minSuiRequired),
            ],
        });

        return await signAndExecute(tx, "localnet");
    }
}

export default BondingCurveSDK;