"use client";

import {
  useWallets,
  useSuiClient,
  useConnectWallet,
  useDisconnectWallet,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { type Transaction } from "@mysten/sui/transactions";
import { useCallback } from "react";

export function useSuiWallet() {
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();
  const currentAccount = useCurrentAccount();
  const client = useSuiClient();
  const wallets = useWallets();

  const signAndExecuteTransaction = useCallback(
    async (
      transactionBlock: Transaction,
      options: {
        showEffects?: boolean;
        showEvents?: boolean;
        showObjectChanges?: boolean;
        showBalanceChanges?: boolean;
        showInput?: boolean;
        showRawInput?: boolean;
      } = {}
    ) => {
      if (!currentAccount) {
        throw new Error("No account connected");
      }

      // TODO: Implement transaction signing and execution using dapp-kit hooks
      throw new Error("Not implemented");
    },
    [currentAccount]
  );

  return {
    account: currentAccount,
    connect,
    disconnect,
    signAndExecuteTransaction,
    isConnected: !!currentAccount,
    client,
  };
}
