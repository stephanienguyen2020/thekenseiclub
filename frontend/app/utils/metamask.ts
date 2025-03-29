import { ethers } from "ethers";

/**
 * Get an Ethereum provider from MetaMask
 * Compatible with both browser extension and mobile
 */
export async function getMetaMaskProvider(): Promise<ethers.BrowserProvider | null> {
  try {
    // Check if ethereum object is available (browser extension)
    if (typeof window !== "undefined" && window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }

    // If not available, return null
    return null;
  } catch (error) {
    console.error("Error getting MetaMask provider:", error);
    return null;
  }
}

/**
 * Add a custom chain to MetaMask
 */
export async function addChainToMetaMask(
  chainId: number,
  chainName: string,
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  },
  rpcUrls: string[],
  blockExplorerUrls?: string[]
): Promise<boolean> {
  try {
    if (typeof window === "undefined" || !window.ethereum) {
      console.error("MetaMask not installed");
      return false;
    }

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${chainId.toString(16)}`,
          chainName,
          nativeCurrency,
          rpcUrls,
          blockExplorerUrls,
        },
      ],
    });

    return true;
  } catch (error) {
    console.error("Error adding chain to MetaMask:", error);
    return false;
  }
}

/**
 * Switch to a specific chain in MetaMask
 */
export async function switchChainInMetaMask(chainId: number): Promise<boolean> {
  try {
    if (typeof window === "undefined" || !window.ethereum) {
      console.error("MetaMask not installed");
      return false;
    }

    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });

    return true;
  } catch (error: any) {
    // Error code 4902 means the chain hasn't been added yet
    if (error.code === 4902) {
      console.error("Chain not added to MetaMask");
      return false;
    }

    console.error("Error switching chain in MetaMask:", error);
    return false;
  }
}
