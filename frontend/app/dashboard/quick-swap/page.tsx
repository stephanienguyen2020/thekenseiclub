"use client";

import { useState, useEffect } from "react";
import CoinSwap from "@/app/coins/components/CoinSwap";
import { AppLayout } from "@/app/components/app-layout";
import { getTokens } from "@/services/memecoin-launchpad";
import { useTestTokenService } from "@/services/TestTokenService";

// Define the Token interface to match what's returned by getTokens
interface Token {
  token: string;
  name: string;
  creator: string;
  sold: any;
  raised: any;
  isOpen: boolean;
  image: string;
  description: string;
}

export default function QuickSwapPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [marketplaceTokens, setMarketplaceTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const testTokenService = useTestTokenService();

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const savedAuth = localStorage.getItem("isAuthenticated");
      const walletConnected =
        window.ethereum && window.ethereum.selectedAddress;

      // Only consider authenticated if both localStorage flag is set AND wallet is connected
      setIsAuthenticated(savedAuth === "true" && !!walletConnected);

      // Log authentication status for debugging
      console.log("Authentication status:", {
        savedAuth,
        walletConnected,
        isAuthenticated: savedAuth === "true" && !!walletConnected,
      });
    };

    // Check initially
    checkAuth();

    // Set up event listeners for wallet connection changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", checkAuth);
      window.ethereum.on("connect", checkAuth);
      window.ethereum.on("disconnect", checkAuth);
    }

    // Clean up event listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", checkAuth);
        window.ethereum.removeListener("connect", checkAuth);
        window.ethereum.removeListener("disconnect", checkAuth);
      }
    };
  }, []);

  // Fetch marketplace tokens
  useEffect(() => {
    const fetchMarketplaceTokens = async () => {
      try {
        setIsLoading(true);
        // Get tokens that are graduated (isOpen = false)
        const tokens = await testTokenService.testGetTokens({ isOpen: false });
        setMarketplaceTokens(tokens);
      } catch (error) {
        console.error("Error fetching marketplace tokens:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketplaceTokens();
  }, [testTokenService.testGetTokens]);

  const handleTradeAction = () => {
    // This function would handle trade actions
    console.log("Trade action triggered");
  };

  return (
    <AppLayout>
      <div className="container py-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-center">
            Quick <span className="text-blue-400">Swap</span>
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <CoinSwap
            symbol="ETH"
            isAuthenticated={isAuthenticated}
            handleTradeAction={handleTradeAction}
            marketplaceTokens={marketplaceTokens}
          />
        )}
      </div>
    </AppLayout>
  );
}
