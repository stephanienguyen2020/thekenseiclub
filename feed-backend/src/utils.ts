import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

export type Network = "mainnet" | "testnet" | "devnet" | "localnet";

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
export const getClient = (network: Network): SuiClient => {
  return new SuiClient({ url: getFullnodeUrl(network) });
};
