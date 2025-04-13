import {SuiClient, SuiObjectChange, SuiTransactionBlockResponse} from "@mysten/sui/client";
import { Transaction, TransactionArgument } from "@mysten/sui/transactions";
import {publishPackage, signAndExecute} from "../sui-utils";

interface CoinMetadata {
  name: string;
  symbol: string;
  description: string;
  iconUrl: string;
}

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
    name: string,
    symbol: string,
    description: string,
    iconUrl: string,
    client: SuiClient,
    signer: any
  ): Promise<CoinSDK> {
    const publishResult: SuiTransactionBlockResponse  = await publishPackage({
      packagePath: "../../meme",
      network: "localnet",
      exportFileName: "coin",
    });

    const treasuryCap = publishResult.objectChanges?.find(
        (change): change is Extract<SuiObjectChange, { type: 'created' }> =>
            change.type === 'created' &&
            change.objectType.includes('::coin::TreasuryCap')
    )?.objectId as string;

    const coinMetadata = publishResult.objectChanges?.find(
      (change): change is Extract<SuiObjectChange, { type: 'created' }> =>
        change.type === "created" &&
        change.objectType.includes("::coin::CoinMetadata")
    )?.objectId as string;

    const packageId = publishResult.objectChanges?.find(
      (change): change is Extract<SuiObjectChange, { type: 'published' }> => change.type === "published"
    )?.packageId as string;

    const sdk = new CoinSDK(treasuryCap, client, packageId, coinMetadata);

    await sdk.updateCoinInfo(name, symbol, description, iconUrl, signer);

    return sdk;
  }

  async updateCoinInfo(
    name: string,
    symbol: string,
    description: string,
    iconUrl: string,
    signer: any
  ): Promise<SuiTransactionBlockResponse> {
    if (!this.coinMetadata) {
      throw new Error(
        "Coin metadata object ID is required to update coin info"
      );
    }

    const tx = new Transaction();

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
    return await signAndExecute(tx, 'localnet');
  }

  async createCoinAndTransfer(
    amount: number,
    recipient: string,
  ): Promise<SuiTransactionBlockResponse> {
    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::coin::create_and_transfer`,
      arguments: [
        tx.object(this.treasuryCap),
        tx.pure.address(recipient),
        tx.pure.u64(amount),
      ],
    });

    return await signAndExecute(tx, 'localnet');
  }
}

export default CoinSDK;
