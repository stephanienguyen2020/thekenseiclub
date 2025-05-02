"use client";

import { WalletProvider } from "@mysten/dapp-kit";
import { SuiClientProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { type ReactNode } from "react";

const networks = {
  mainnet: { url: getFullnodeUrl("mainnet") },
  testnet: { url: getFullnodeUrl("testnet") },
  devnet: { url: getFullnodeUrl("devnet") },
  localnet: { url: getFullnodeUrl("localnet") },
};

export function SuiWalletProvider({ children }: { children: ReactNode }) {
  return (
    <SuiClientProvider networks={networks} defaultNetwork="devnet">
      <WalletProvider autoConnect preferredWallets={["Sui Wallet"]}>
        {children}
      </WalletProvider>
    </SuiClientProvider>
  );
}
