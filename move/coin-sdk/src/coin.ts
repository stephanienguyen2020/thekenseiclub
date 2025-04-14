import {SuiClient, SuiObjectChange, SuiTransactionBlockResponse} from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import {generateToMoveFile, getClient, getModuleName, Network, publishPackage, signAndExecute} from "../sui-utils";
export const ACTIVE_NETWORK = (process.env.NETWORK as Network) || "testnet";

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
        signer
      } : {
        name: string;
        symbol: string;
        description?: string;
        iconUrl?: string;
        client: SuiClient;
        signer: any;
      }
  ): Promise<CoinSDK> {
    name = name.toLowerCase();
    generateToMoveFile('src/template.txt', 'coin-create/sources/coin.move', {coin_module: name, coin_name: name.toUpperCase()})
    const publishResult: SuiTransactionBlockResponse  = await publishPackage({
      packagePath: "coin-create",
      network: ACTIVE_NETWORK,
      exportFileName: "coin",
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

  async updateCoinInfo(
      {
        name,
        symbol,
        description,
        iconUrl,
        signer
      }: {
        name: string;
        symbol: string;
        description: string;
        iconUrl: string;
        signer: any;
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
    return await signAndExecute(tx, ACTIVE_NETWORK);
  }

  async createCoinAndTransfer(
      {
        amount,
        recipient
      }: {
        amount: number;
        recipient: string;
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

    return await signAndExecute(tx, ACTIVE_NETWORK);
  }
}

export default CoinSDK;
