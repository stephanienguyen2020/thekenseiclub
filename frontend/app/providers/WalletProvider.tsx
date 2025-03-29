"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useWalletStore, WalletState } from "../store/walletStore";
import { ethers } from "ethers";
import { useAccount, useDisconnect } from "wagmi";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useSDK } from "@metamask/sdk-react";

// Create context with additional methods
interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  getContract: (address: string, abi: any) => Promise<ethers.Contract | null>;
  isMetaMaskInstalled: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  // Get wallet state and methods from the store
  const wallet = useWalletStore();
  const router = useRouter();

  // Use a ref to track if we've already processed this connection
  const processedAddressRef = useRef<string | null>(null);

  // Use wagmi hooks
  const { address, isConnected } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  // Use MetaMask SDK
  const { sdk, connected: sdkConnected } = useSDK();

  // Debugging logs
  useEffect(() => {
    console.log("WalletProvider connection state:", {
      wagmiConnected: isConnected,
      address,
      sdkConnected,
    });
  }, [isConnected, address, sdkConnected]);

  // Check if MetaMask is installed
  const isMetaMaskInstalled =
    typeof window !== "undefined" && (!!window.ethereum || sdkConnected);

  // Sync wagmi state with our wallet store
  useEffect(() => {
    // Skip if we've already processed this address or if nothing has changed
    if (
      (isConnected && address && processedAddressRef.current === address) ||
      (!isConnected && !wallet.isConnected)
    ) {
      return;
    }

    if (isConnected && address) {
      // Update our reference to prevent future unnecessary updates
      processedAddressRef.current = address;

      // Only update if the state actually changed
      if (!wallet.isConnected || wallet.address !== address) {
        console.log("Updating wallet state with connected wallet");

        // Update our wallet store with wagmi connection
        wallet.updateWallet({
          isConnected: true,
          address: address,
          isAuthenticated: true,
        });

        // Set authentication in localStorage and cookies
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userAddress", address);
        Cookies.set("isAuthenticated", "true", { path: "/" });

        // Only redirect if on homepage
        // Let the individual components handle their own redirects
        // This prevents multiple redirects from happening
      }
    } else if (!isConnected && wallet.isConnected) {
      // Reset our reference
      processedAddressRef.current = null;

      // Disconnect our wallet store if wagmi disconnects
      wallet.disconnect();
    }
  }, [isConnected, address, wallet, router]);

  // Listen for network changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleChainChanged = () => {
        // Reload the page on chain change as recommended by MetaMask
        window.location.reload();
      };

      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  // Override disconnect to also disconnect wagmi and clear all auth data
  const handleDisconnect = useCallback(() => {
    // Reset our reference
    processedAddressRef.current = null;

    // Clear all authentication data
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userAddress");
    Cookies.remove("isAuthenticated", { path: "/" });

    // Disconnect from wallet store
    wallet.disconnect();

    // Disconnect from wagmi
    wagmiDisconnect();

    // Force redirect to home page
    router.push("/");

    // Force a page reload to ensure all state is cleared
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, [wallet, wagmiDisconnect, router]);

  // Memoize the contract getter to prevent unnecessary re-renders
  const getContract = useCallback(
    async (address: string, abi: any) => {
      return wallet.getContract(address, abi);
    },
    [wallet]
  );

  // Memoize the connect function and use MetaMask SDK if available
  const connect = useCallback(async () => {
    console.log("Attempting to connect wallet...");

    // First try using the window.ethereum provider directly
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        console.log("Found window.ethereum, attempting direct connection");
        // Request accounts to trigger MetaMask popup
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log("Accounts received:", accounts);

        if (accounts && accounts.length > 0) {
          console.log("Successfully connected with account:", accounts[0]);
          // The wallet store will be updated via the useEffect that watches isConnected
          return;
        }
      } catch (error) {
        console.error("Error connecting directly with window.ethereum:", error);
      }
    }

    // If direct connection fails, try MetaMask SDK
    if (sdk) {
      try {
        console.log("Using MetaMask SDK to connect");
        await sdk.connect();
        return;
      } catch (error) {
        console.error("Error connecting with MetaMask SDK:", error);
      }
    }

    // As a last resort, use the wallet store's connect method
    console.log("Falling back to wallet store connect method");
    try {
      await wallet.connect();
    } catch (error) {
      console.error("All connection methods failed:", error);
      throw error;
    }
  }, [wallet, sdk]);

  // Combine wallet state and methods with additional context properties
  const contextValue = useMemo(
    () => ({
      ...wallet,
      isMetaMaskInstalled,
      disconnect: handleDisconnect,
      connect,
      getContract,
    }),
    [wallet, isMetaMaskInstalled, handleDisconnect, connect, getContract]
  );

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};
