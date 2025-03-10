"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletProvider } from "./providers/WalletProvider";
import { AuthGuard } from "./providers/AuthGuard";
import { WagmiProvider, createConfig, http } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

// Configure custom Sonic Blaze Testnet
const sonicBlazeTestnet = {
  id: 57054,
  name: "Sonic Blaze Testnet",
  network: "sonic-blaze-testnet",
  nativeCurrency: {
    decimals: 18,
    name: "S",
    symbol: "S",
  },
  rpcUrls: {
    public: { http: ["https://rpc.blaze.soniclabs.com"] },
    default: { http: ["https://rpc.blaze.soniclabs.com"] },
  },
  blockExplorers: {
    default: {
      name: "Sonic Blaze Explorer",
      url: "https://testnet.sonicscan.org", // Placeholder, update if needed
    },
  },
  testnet: true,
};

const sonicMainnet = {
  id: 146,
  name: "Sonic Blaze Mainnet",
  network: "sonic-blaze-mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "S",
    symbol: "S",
  },
  rpcUrls: {
    public: { http: ["https://rpc.soniclabs.com"] },
    default: { http: ["https://rpc.soniclabs.com"] },
  },
  blockExplorers: {
    default: {
      name: "Sonic Blaze Explorer",
      url: "https://sonicscan.org", // Placeholder, update if needed
    },
  },
  testnet: false,
};

// Configure custom Hardhat testnet
const hardhatTestnet = {
  id: 31337,
  name: "Hardhat",
  network: "hardhat",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["http://127.0.0.1:8545"] },
    default: { http: ["http://127.0.0.1:8545"] },
  },
  blockExplorers: {
    default: {
      name: "Block Explorer",
      url: "http://localhost:8545", // Local explorer if you have one
    },
  },
  testnet: true,
};

// Create wagmi config
const config = createConfig({
  chains: [sonicBlazeTestnet, sonicMainnet, hardhatTestnet],
  transports: {
    [sonicBlazeTestnet.id]: http(),
    [sonicMainnet.id]: http(),
    [hardhatTestnet.id]: http(),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <NextThemesProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <WalletProvider>
              <AuthGuard>{children}</AuthGuard>
            </WalletProvider>
          </NextThemesProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
