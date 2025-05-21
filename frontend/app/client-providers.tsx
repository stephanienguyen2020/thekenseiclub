"use client";

import {WalletProvider} from "@mysten/dapp-kit";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {SuiClientProvider} from "@mysten/dapp-kit";
import {useState} from "react";
import {SolanaProvider} from "./providers/SolanaProvider";

const networks = {
  mainnet: {url: "https://fullnode.mainnet.sui.io:443"},
  testnet: {url: "https://fullnode.testnet.sui.io:443"},
  devnet: {url: "https://fullnode.devnet.sui.io:443"},
};

export function ClientProviders({children}: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networks}
        defaultNetwork={(process.env.NEXT_PUBLIC_NETWORK || "devnet") as any}
      >
        <WalletProvider autoConnect={false}>{children}</WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
