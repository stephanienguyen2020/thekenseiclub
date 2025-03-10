import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "../providers/WalletProvider";

/**
 * Hook to get a contract instance
 * @param address The contract address
 * @param abi The contract ABI
 * @returns The contract instance and loading/error states
 */
export function useContract<T extends ethers.Contract>(
  address: string | undefined,
  abi: any
): {
  contract: T | null;
  isLoading: boolean;
  error: Error | null;
} {
  const { signer, isConnected } = useWallet();
  const [contract, setContract] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initContract = async () => {
      if (!address || !abi || !signer || !isConnected) {
        setContract(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const contractInstance = new ethers.Contract(address, abi, signer) as T;

        setContract(contractInstance);
      } catch (err) {
        console.error("Failed to initialize contract:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setContract(null);
      } finally {
        setIsLoading(false);
      }
    };

    initContract();
  }, [address, abi, signer, isConnected]);

  return { contract, isLoading, error };
}

/**
 * Hook to get a read-only contract instance (no signer required)
 * @param address The contract address
 * @param abi The contract ABI
 * @returns The contract instance and loading/error states
 */
export function useReadOnlyContract<T extends ethers.Contract>(
  address: string | undefined,
  abi: any
): {
  contract: T | null;
  isLoading: boolean;
  error: Error | null;
} {
  const { provider } = useWallet();
  const [contract, setContract] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initContract = async () => {
      if (!address || !abi || !provider) {
        setContract(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const contractInstance = new ethers.Contract(
          address,
          abi,
          provider
        ) as T;

        setContract(contractInstance);
      } catch (err) {
        console.error("Failed to initialize read-only contract:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setContract(null);
      } finally {
        setIsLoading(false);
      }
    };

    initContract();
  }, [address, abi, provider]);

  return { contract, isLoading, error };
}
