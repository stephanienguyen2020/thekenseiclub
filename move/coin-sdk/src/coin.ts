import {SuiClient, SuiObjectChange, SuiTransactionBlockResponse} from "@mysten/sui/client";
import {Transaction} from "@mysten/sui/transactions";
import {
    ACTIVE_NETWORK,
    deleteFile,
    generateToMoveFile,
    getClient,
    getModuleName,
    publishPackage,
    signAndExecute
} from "./utils/sui-utils";
import BondingCurveSDK from "./bonding_curve";
import {BONDING_CURVE_MODULE_PACKAGE_ID} from "./constant";

class CoinSDK {
    private treasuryCap: string;
    private client: SuiClient;
    private packageId: string;
    private coinMetadata?: string;

    constructor(
        treasuryCap: string,
        client: SuiClient,
        packageId: string,
        coinMetadata?: string
    ) {
        this.treasuryCap = treasuryCap;
        this.client = client;
        this.packageId = packageId;
        this.coinMetadata = coinMetadata;
    }

    static async deployNewCoin(
        {
            name,
            symbol,
            description,
            iconUrl,
            client,
            address
        }: {
            name: string;
            symbol: string;
            description: string;
            iconUrl: string;
            client: SuiClient;
            address: any;
        }
    ): Promise<CoinSDK> {
        name = name.toLowerCase();
        generateToMoveFile('src/template.txt', `coin-create/sources/${name}.move`, {
            coin_module: name,
            coin_name: name.toUpperCase(),
            coin_symbol: symbol,
            coin_description: description,
            coin_icon_url: iconUrl
        });
        const publishResult: SuiTransactionBlockResponse = await publishPackage({
            packagePath: "coin-create",
            network: ACTIVE_NETWORK,
            exportFileName: "coin",
            address
        });
        const treasuryCap = publishResult.objectChanges?.find(
            (change): change is Extract<SuiObjectChange, { type: 'created' }> =>
                change.type === 'created' &&
                change.objectType.includes(`::coin::TreasuryCap`)
        )?.objectId as string;

        const coinMetadata = publishResult.objectChanges?.find(
            (change): change is Extract<SuiObjectChange, { type: 'created' }> =>
                change.type === "created" &&
                change.objectType.includes(`::coin::CoinMetadata`)
        )?.objectId as string;

        const packageId = publishResult.objectChanges?.find(
            (change): change is Extract<SuiObjectChange, { type: 'published' }> => change.type === "published"
        )?.packageId as string;

        console.log("packageId", packageId);
        console.log("coinMetadata", coinMetadata);
        console.log("treasuryCap", treasuryCap);
        console.log(`${packageId}::${name}::${name.toUpperCase()}`)

        await BondingCurveSDK.createBondingCurve(treasuryCap, coinMetadata, 10000000000000000000, getClient(ACTIVE_NETWORK), BONDING_CURVE_MODULE_PACKAGE_ID, `${packageId}::${name}::${name.toUpperCase()}`, address);
        deleteFile(`coin-create/sources/${name}.move`);
        return new CoinSDK(treasuryCap, client, packageId, coinMetadata);
    }

    async updateCoinInfo(
        {
            name,
            symbol,
            description,
            iconUrl,
            address
        }: {
            name: string;
            symbol: string;
            description: string;
            iconUrl: string;
            address: any;
        }
    ): Promise<SuiTransactionBlockResponse> {
        if (!this.coinMetadata) {
            throw new Error(
                "Coin metadata object ID is required to update coin info"
            );
        }

        const tx = new Transaction();

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
        return await signAndExecute(tx, ACTIVE_NETWORK, address);
    }

    async createCoinAndTransfer(
        {
            amount,
            recipient,
            address
        }: {
            amount: number;
            recipient: string;
            address: string;
        },
    ): Promise<SuiTransactionBlockResponse> {
        const tx = new Transaction();
        const {moduleName} = await getModuleName(this.treasuryCap, ACTIVE_NETWORK);
        tx.moveCall({
            target: `${this.packageId}::${moduleName}::create_and_transfer`,
            arguments: [
                tx.object(this.treasuryCap),
                tx.pure.address(recipient),
                tx.pure.u64(amount),
            ],
        });

        return await signAndExecute(tx, ACTIVE_NETWORK, address);
    }
}

export default CoinSDK;