import {
  SuiClient,
  SuiObjectChange,
  SuiTransactionBlockResponse,
} from "@mysten/sui/client";
import {Transaction} from "@mysten/sui/transactions";
import {
  ACTIVE_NETWORK,
  getCoinsByType,
  signAndExecute,
} from "./utils/sui-utils";
import {AddLiquidityV2} from "@flowx-finance/sdk";
import {SUI_COIN_TYPE} from "./constant";
import {Network} from "../sui-utils";
import BigNumber from 'bignumber.js';
import {toBlockchainAmount, fromBlockchainAmount, safeDivide, safeMultiply} from './utils/number-utils';

interface BondingCurveFields {
  virtual_sui_amt: string;
  sui_balance: string;
  token_balance: string;
}

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

    const response: SuiTransactionBlockResponse = await signAndExecute(
      tx,
      ACTIVE_NETWORK,
      address
    );

    const bondingCurveId = response.objectChanges?.find(
      (change): change is Extract<SuiObjectChange, { type: "created" }> =>
        change.type === "created" &&
        change.objectType.includes("::bonding_curve::BondingCurve")
    )?.objectId as string;

    return new BondingCurveSDK(bondingCurveId, client, packageId);
  }

  buildBuyTransaction({
                        amount,
                        minTokenRequired,
                        type,
                        address,
                        transaction
                      }: {
    amount: bigint;
    minTokenRequired: bigint;
    type: string;
    address: string;
    transaction?: Transaction;
  }): Transaction {
    console.log("Brfore transaction:", transaction)
    const tx = transaction ? transaction : new Transaction();
    console.log("After transaction:", tx)
    const [suiCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);
    console.log("After split:", tx)
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

    return tx;
  }

  async getCurrentPrice(): Promise<number> {
    try {
      const bondingCurveObj = await this.client.getObject({
        id: this.bondingCurveId,
        options: {
          showType: true,
          showContent: true,
        },
      });

      if (!bondingCurveObj.data?.content) {
        throw new Error("Failed to retrieve bonding curve data");
      }

      const fields = (bondingCurveObj.data.content as any).fields as BondingCurveFields;
      const virtualSuiAmt = new BigNumber(fields.virtual_sui_amt);
      const suiBalance = new BigNumber(fields.sui_balance);
      const tokenBalance = new BigNumber(fields.token_balance);

      if (tokenBalance.isZero()) {
        throw new Error("Token balance is zero");
      }

      return virtualSuiAmt
        .plus(suiBalance)
        .dividedBy(tokenBalance)
        .toNumber();
    } catch (error) {
      console.error("Error getting current price:", error);
      throw error;
    }
  }

  async calculateTokenAmount(suiAmount: string | number): Promise<number> {
    const price = await this.getCurrentPrice();
    return safeDivide(suiAmount, price);
  }

  async calculateSuiAmount(tokenAmount: string | number): Promise<number> {
    const price = await this.getCurrentPrice();
    return safeMultiply(tokenAmount, price);
  }

  async buy({
              amount,
              minTokenRequired,
              type,
              address,
            }: {
    amount: bigint;
    minTokenRequired: bigint;
    type: string;
    address: string;
  }): Promise<SuiTransactionBlockResponse> {
    const tx = this.buildBuyTransaction({
      amount,
      minTokenRequired,
      type,
      address,
    });

    return await signAndExecute(tx, ACTIVE_NETWORK, address);
  }

  async buildSellTransaction({
                               amount,
                               minSuiRequired,
                               type,
                               address,
                               network,
                               transaction
                             }: {
    amount: bigint;
    minSuiRequired: bigint;
    type: string;
    address: string;
    network: Network;
    transaction?: Transaction;
  }): Promise<Transaction> {

    const coins = await getCoinsByType(address, type, network);
    if (coins.length === 0) {
      throw new Error(`No coin of type ${type} found in wallet`);
    }
    const tx = transaction ? transaction : new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(0)]);
    tx.transferObjects([coin], tx.pure.address(address));

    // Create a transaction input for the first coin
    const destinationCoin = tx.object(coins[0].coinObjectId);

    // If there are multiple coins, merge them
    if (coins.length > 1) {
      const sourceCoins = coins.slice(1).map((coin) => tx.object(coin.coinObjectId));
      tx.mergeCoins(destinationCoin, sourceCoins);
    }

    // Split the coin to get the amount to sell
    const [splitCoin] = tx.splitCoins(destinationCoin, [
      tx.pure.u64(amount),
    ]);

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

    return tx;
  }

  async sell({
               amount,
               minSuiRequired,
               type,
               address,
             }: {
    amount: bigint;
    minSuiRequired: bigint;
    type: string;
    address: string;
  }): Promise<SuiTransactionBlockResponse> {
    const tx = await this.buildSellTransaction({
      amount,
      minSuiRequired,
      type,
      address,
      network: ACTIVE_NETWORK,
    });

    return await signAndExecute(tx, ACTIVE_NETWORK, address);
  }

  async buildWithdrawTransaction(address: string): Promise<Transaction> {
    const bondingCurveObj = await this.client.getObject({
      id: this.bondingCurveId,
      options: {
        showType: true,
        showContent: true,
      },
    });

    if (!bondingCurveObj.data || !bondingCurveObj.data.content) {
      throw new Error("Failed to get bonding curve data");
    }

    const content = bondingCurveObj.data.content as unknown as {
      fields: { token_balance: string; sui_balance: string };
    };
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
      arguments: [tx.object(this.bondingCurveId), tx.pure.address(address)],
    });
    return tx;
  }

  async buildMigrateToFlowxTransaction(address: string): Promise<Transaction> {
    const bondingCurveObj = await this.client.getObject({
      id: this.bondingCurveId,
      options: {
        showType: true,
        showContent: true,
      },
    });

    if (!bondingCurveObj.data || !bondingCurveObj.data.content) {
      throw new Error("Failed to get bonding curve data");
    }

    const content = bondingCurveObj.data.content as unknown as {
      fields: { token_balance: string; sui_balance: string };
    };
    const objectType = bondingCurveObj.data.type as string;

    const tokenTypeMatch = objectType.match(/<(.+)>/);
    const tokenType = tokenTypeMatch ? tokenTypeMatch[1] : null;
    if (!tokenType) {
      throw new Error("Could not determine token type from bonding curve");
    }
    const x = content.fields.token_balance;
    const y = content.fields.sui_balance;
    // @ts-ignore
    const addLiquidityV2 = new AddLiquidityV2(ACTIVE_NETWORK, this.client);
    const liquidityTx = await addLiquidityV2.buildTransaction(
      {
        x: tokenType,
        y: SUI_COIN_TYPE,
      },
      {
        x,
        y,
      },
      address,
      0.01
    );
    return liquidityTx as unknown as Transaction;
  }

  async migrateToFlowx(address: string) {
    try {
      const bondingCurveObj = await this.client.getObject({
        id: this.bondingCurveId,
        options: {
          showType: true,
          showContent: true,
        },
      });

      if (!bondingCurveObj.data || !bondingCurveObj.data.content) {
        throw new Error("Failed to get bonding curve data");
      }

      const content = bondingCurveObj.data.content as unknown as {
        fields: { token_balance: string; sui_balance: string };
      };
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
        arguments: [tx.object(this.bondingCurveId), tx.pure.address(address)],
      });

      // Execute withdraw transaction and wait for completion
      const withdrawTxResponse = await signAndExecute(
        tx,
        ACTIVE_NETWORK,
        address
      );

      // Wait for the transaction to be confirmed
      await this.client.waitForTransaction({
        digest: withdrawTxResponse.digest,
        timeout: 60 * 1000, // 60 seconds timeout
      });

      // @ts-ignore
      const addLiquidityV2 = new AddLiquidityV2(ACTIVE_NETWORK, this.client);
      const liquidityTx = await addLiquidityV2.buildTransaction(
        {
          x: tokenType,
          y: SUI_COIN_TYPE,
        },
        {
          x,
          y,
        },
        address,
        0.01
      );

      // Execute the transaction
      return await signAndExecute(
        liquidityTx as unknown as Transaction,
        ACTIVE_NETWORK,
        address
      );
    } catch (error) {
      console.error("Error migrating to FlowX:", error);
      throw error;
    }
  }

  /**
   * Calculate the expected slippage for a buy (SUI -> Token) trade.
   * @param suiAmount Amount of SUI to spend (in human-readable units, e.g., 1 SUI = 1)
   * @returns Slippage percentage (e.g., 0.5 for 0.5%)
   */
  async getExpectedBuySlippage(suiAmount: number | string): Promise<number> {
    const bondingCurveObj = await this.client.getObject({
      id: this.bondingCurveId,
      options: {showType: true, showContent: true},
    });
    if (!bondingCurveObj.data?.content) throw new Error("Failed to retrieve bonding curve data");
    const fields = (bondingCurveObj.data.content as any).fields as BondingCurveFields;
    const virtualSuiAmt = new BigNumber(fields.virtual_sui_amt);
    const suiBalance = new BigNumber(fields.sui_balance);
    const tokenBalance = new BigNumber(fields.token_balance);
    const input = new BigNumber(suiAmount).times(1e9); // convert to on-chain units
    // Marginal price before trade
    const priceBefore = virtualSuiAmt.plus(suiBalance).div(tokenBalance);
    // Simulate buy: get tokens out
    const tokensOut = input.times(tokenBalance).div(virtualSuiAmt.plus(suiBalance).plus(input));
    // Marginal price after trade
    const priceAfter = virtualSuiAmt.plus(suiBalance).plus(input).div(tokenBalance.minus(tokensOut));
    // Average execution price
    const avgPrice = input.div(tokensOut);
    // Slippage = (avgPrice - priceBefore) / priceBefore
    return avgPrice.minus(priceBefore).div(priceBefore).times(100).toNumber();
  }

  /**
   * Calculate the expected slippage for a sell (Token -> SUI) trade.
   * @param tokenAmount Amount of tokens to sell (in human-readable units)
   * @returns Slippage percentage (e.g., 0.5 for 0.5%)
   */
  async getExpectedSellSlippage(tokenAmount: number | string): Promise<number> {
    const bondingCurveObj = await this.client.getObject({
      id: this.bondingCurveId,
      options: {showType: true, showContent: true},
    });
    if (!bondingCurveObj.data?.content) throw new Error("Failed to retrieve bonding curve data");
    const fields = (bondingCurveObj.data.content as any).fields as BondingCurveFields;
    const virtualSuiAmt = new BigNumber(fields.virtual_sui_amt);
    const suiBalance = new BigNumber(fields.sui_balance);
    const tokenBalance = new BigNumber(fields.token_balance);
    const input = new BigNumber(tokenAmount).times(1e9); // convert to on-chain units
    // Marginal price before trade
    const priceBefore = virtualSuiAmt.plus(suiBalance).div(tokenBalance);
    // Simulate sell: get SUI out
    const suiOut = input.times(virtualSuiAmt.plus(suiBalance)).div(tokenBalance.plus(input));
    // Marginal price after trade
    const priceAfter = virtualSuiAmt.plus(suiBalance).minus(suiOut).div(tokenBalance.plus(input).minus(input));
    // Average execution price
    const avgPrice = suiOut.div(input);
    // Slippage = (priceBefore - avgPrice) / priceBefore
    return priceBefore.minus(avgPrice).div(priceBefore).times(100).toNumber();
  }

  /**
   * Calculate the price impact for a buy (SUI -> Token) trade.
   * @param suiAmount Amount of SUI to spend (in human-readable units)
   * @returns Price impact percentage
   */
  async getExpectedBuyPriceImpact(suiAmount: number | string): Promise<number> {
    const bondingCurveObj = await this.client.getObject({
      id: this.bondingCurveId,
      options: {showType: true, showContent: true},
    });
    if (!bondingCurveObj.data?.content) throw new Error("Failed to retrieve bonding curve data");
    const fields = (bondingCurveObj.data.content as any).fields as BondingCurveFields;
    const virtualSuiAmt = new BigNumber(fields.virtual_sui_amt);
    const suiBalance = new BigNumber(fields.sui_balance);
    const tokenBalance = new BigNumber(fields.token_balance);
    const input = new BigNumber(suiAmount).times(1e9); // convert to on-chain units
    // Marginal price before trade
    const priceBefore = virtualSuiAmt.plus(suiBalance).div(tokenBalance);
    // Marginal price after trade
    const priceAfter = virtualSuiAmt.plus(suiBalance).plus(input).div(tokenBalance);
    // Price impact = (priceAfter - priceBefore) / priceBefore
    return priceAfter.minus(priceBefore).div(priceBefore).times(100).toNumber();
  }

  /**
   * Calculate the price impact for a sell (Token -> SUI) trade.
   * @param tokenAmount Amount of tokens to sell (in human-readable units)
   * @returns Price impact percentage
   */
  async getExpectedSellPriceImpact(tokenAmount: number | string): Promise<number> {
    const bondingCurveObj = await this.client.getObject({
      id: this.bondingCurveId,
      options: {showType: true, showContent: true},
    });
    if (!bondingCurveObj.data?.content) throw new Error("Failed to retrieve bonding curve data");
    const fields = (bondingCurveObj.data.content as any).fields as BondingCurveFields;
    const virtualSuiAmt = new BigNumber(fields.virtual_sui_amt);
    const suiBalance = new BigNumber(fields.sui_balance);
    const tokenBalance = new BigNumber(fields.token_balance);
    const input = new BigNumber(tokenAmount).times(1e9); // convert to on-chain units
    // Marginal price before trade
    const priceBefore = virtualSuiAmt.plus(suiBalance).div(tokenBalance);
    // Marginal price after trade
    const priceAfter = virtualSuiAmt.plus(suiBalance).div(tokenBalance.plus(input));
    // Price impact = (priceBefore - priceAfter) / priceBefore
    return priceBefore.minus(priceAfter).div(priceBefore).times(100).toNumber();
  }
}

export default BondingCurveSDK;
