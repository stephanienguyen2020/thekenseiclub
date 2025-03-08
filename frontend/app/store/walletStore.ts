import { create } from "zustand";
import { ethers } from "ethers";
import { persist } from "zustand/middleware";

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  networkName: string | null;
  balance: string | null;
  isAuthenticated: boolean;
  depositHistory: {
    amount: number;
    timestamp: number;
    txHash?: string;
  }[];
  addFunds: (amount: number, txHash?: string) => void;
  withdrawFunds: (amount: number) => boolean;
  getBalance: () => number;
}

interface WalletStore extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  updateWallet: (wallet: Partial<WalletState>) => void;
  getContract: (address: string, abi: any) => Promise<ethers.Contract | null>;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: false,
      address: null,
      provider: null,
      signer: null,
      chainId: null,
      networkName: null,
      balance: null,
      isAuthenticated: false,
      depositHistory: [],

      // Connect wallet
      connect: async () => {
        try {
          if (typeof window === "undefined" || !window.ethereum) {
            throw new Error("MetaMask not installed");
          }

          // Request accounts
          await window.ethereum.request({ method: "eth_requestAccounts" });

          // Create provider and signer
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();

          // Get network information
          const network = await provider.getNetwork();
          const chainId = Number(network.chainId);

          // Get network name
          let networkName = "Unknown";
          switch (chainId) {
            case 1:
              networkName = "Ethereum Mainnet";
              break;
            case 5:
              networkName = "Goerli Testnet";
              break;
            case 11155111:
              networkName = "Sepolia Testnet";
              break;
            case 137:
              networkName = "Polygon Mainnet";
              break;
            case 80001:
              networkName = "Mumbai Testnet";
              break;
            case 56:
              networkName = "BNB Smart Chain";
              break;
            case 97:
              networkName = "BSC Testnet";
              break;
            default:
              networkName = `Chain ID: ${chainId}`;
          }

          // Get balance
          const balanceWei = await provider.getBalance(address);
          const balance = ethers.formatEther(balanceWei);

          // Sign message for authentication
          const message = "Sign this message to verify your identity";
          const signature = await signer.signMessage(message);
          console.log("Signature:", signature);

          // Update state
          set({
            isConnected: true,
            address,
            provider,
            signer,
            chainId,
            networkName,
            balance,
            isAuthenticated: true,
          });

          // Save to localStorage for persistence
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("userAddress", address);

          // Setup event listeners for account and chain changes
          window.ethereum.on("accountsChanged", (accounts: string[]) => {
            if (accounts.length === 0) {
              // User disconnected their wallet
              get().disconnect();
            } else {
              // User switched accounts, reconnect
              get().connect();
            }
          });

          window.ethereum.on("chainChanged", () => {
            // Chain changed, reconnect to get new chain info
            get().connect();
          });
        } catch (error) {
          console.error("Error connecting wallet:", error);
          get().disconnect();
          throw error;
        }
      },

      // Disconnect wallet
      disconnect: () => {
        // Remove event listeners
        if (window.ethereum) {
          window.ethereum.removeAllListeners("accountsChanged");
          window.ethereum.removeAllListeners("chainChanged");
        }

        // Clear localStorage
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userAddress");

        // Reset state
        set({
          isConnected: false,
          address: null,
          provider: null,
          signer: null,
          chainId: null,
          networkName: null,
          balance: null,
          isAuthenticated: false,
          depositHistory: [],
        });
      },

      // Update wallet state
      updateWallet: (wallet) => {
        set((state) => ({ ...state, ...wallet }));
      },

      // Get contract instance
      getContract: async (address, abi) => {
        const { signer } = get();
        if (!signer) return null;

        try {
          return new ethers.Contract(address, abi, signer);
        } catch (error) {
          console.error("Error getting contract:", error);
          return null;
        }
      },

      addFunds: (amount: number, txHash?: string) => {
        set((state) => {
          const currentBalance = state.balance ? parseFloat(state.balance) : 0;
          const newBalance = (currentBalance + amount).toString();

          return {
            ...state,
            balance: newBalance,
            depositHistory: [
              ...state.depositHistory,
              {
                amount,
                timestamp: Date.now(),
                txHash,
              },
            ],
          };
        });
      },

      withdrawFunds: (amount: number) => {
        const currentBalance = get().balance
          ? parseFloat(get().balance as string)
          : 0;
        if (amount > currentBalance) {
          return false;
        }

        set((state) => {
          // Use nullish coalescing to ensure we always have a string
          const newBalance = (
            parseFloat(state.balance ?? "0") - amount
          ).toString();
          return {
            ...state,
            balance: newBalance,
          };
        });

        return true;
      },

      getBalance: () => {
        const balance = get().balance;
        return balance ? parseFloat(balance) : 0;
      },
    }),
    {
      name: "wallet-storage", // name of the item in localStorage
      partialize: (state) => ({
        // Only persist these fields
        isConnected: state.isConnected,
        address: state.address,
        chainId: state.chainId,
        networkName: state.networkName,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
