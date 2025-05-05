import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import {WalrusClient} from "@mysten/walrus";

export type Network = "mainnet" | "testnet" | "devnet" | "localnet";
export type WalrusNetwork = "mainnet" | "testnet";

// Validate network value from environment variable
function isValidNetwork(network: string | undefined): network is Network {
  return (
    network === "mainnet" ||
    network === "testnet" ||
    network === "devnet" ||
    network === "localnet"
  );
}

// Get network from environment variable with validation
export const ACTIVE_NETWORK: Network = (() => {
  const networkEnv = process.env.NETWORK;
  if (isValidNetwork(networkEnv)) {
    return networkEnv;
  }
  return "testnet"; // Default fallback
})();

/**
 * Get a Sui client for the specified network
 * @param network The network to connect to
 * @returns A configured SuiClient instance
 */
export const getClient = (network?: Network): SuiClient => {
  return new SuiClient({ url: getFullnodeUrl(network ?? ACTIVE_NETWORK) });
};

export const getWalrusClient = (network?: Network, suiClient?: SuiClient) => {
  if (!network || network === 'devnet' || network === 'localnet') {
    console.log('Walrus is only supported on mainnet or testnet');
    return
  }
  return new WalrusClient({network: network as WalrusNetwork, suiClient: suiClient ?? getClient(network) as any});

};
