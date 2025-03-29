"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useBalance, useChainId } from "wagmi";
import { Wallet, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define chain constants
const CHAIN_INFO = {
  // Sonic Blaze Testnet
  57054: {
    name: "Sonic Blaze Testnet",
    testnet: true,
  },
  // Sonic Blaze Mainnet
  146: {
    name: "Sonic Blaze Mainnet",
    testnet: false,
  },
  // Hardhat
  31337: {
    name: "Hardhat",
    testnet: true,
  },
};

export const MetaMaskConnectButton = ({
  className = "",
}: {
  className?: string;
}) => {
  const router = useRouter();
  const [buttonHovered, setButtonHovered] = useState(false);

  // To prevent hydration errors, start with a disconnected UI
  // and update it after hydration
  const [isClientReady, setIsClientReady] = useState(false);

  // Run once after component mounts on client
  useEffect(() => {
    setIsClientReady(true);
  }, []);

  // Basic Wagmi hooks
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { data: balanceData } = useBalance({
    address: address,
  });

  // Redirect to dashboard when connection state changes to connected
  useEffect(() => {
    // Only redirect if we're on the homepage and connected
    if (isClientReady && isConnected && window.location.pathname === "/") {
      // Redirect once
      window.location.href = "/dashboard";
    }
  }, [isConnected, isClientReady]);

  // Find the MetaMask connector
  const metaMaskConnector = connectors.find((c) => c.id === "metaMask");

  const handleConnectClick = async () => {
    if (!isConnected && metaMaskConnector) {
      console.log("Connecting with MetaMask connector...", metaMaskConnector);
      try {
        // Just connect - the useEffect will handle the redirect
        await connect({ connector: metaMaskConnector });
      } catch (error) {
        console.error("Error connecting with MetaMask:", error);
      }
    } else if (isConnected) {
      window.location.href = "/dashboard";
    }
  };

  const handleDisconnectClick = () => {
    disconnect();
  };

  // Get the network name to display
  const getNetworkDisplay = () => {
    if (!chainId) return "Unknown Network";

    // Get chain info from our mapping
    const chain = CHAIN_INFO[chainId as keyof typeof CHAIN_INFO];
    if (chain) {
      return chain.name;
    }

    // Default fallback
    return `Chain ID: ${chainId}`;
  };

  // Always render the connect button for server-side rendering
  // Only switch to connected view on client after hydration
  if (!isClientReady || !isConnected) {
    return (
      <button
        onClick={handleConnectClick}
        onMouseEnter={() => setButtonHovered(true)}
        onMouseLeave={() => setButtonHovered(false)}
        disabled={isPending}
        className={`px-4 py-2 rounded-md text-sm font-bold transition-all duration-300 ${
          buttonHovered
            ? "bg-sky-400 text-black shadow-[0_0_10px_rgba(56,189,248,0.7)]"
            : "bg-transparent border border-sky-400 text-sky-400"
        } ${className} ${isPending ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center">
          <Wallet className="mr-2 h-4 w-4" />
          <span>{isPending ? "CONNECTING..." : "CONNECT"}</span>
        </div>
      </button>
    );
  }

  // Connected view (only rendered on client)
  return (
    <div className="flex items-center gap-2">
      <div className="text-sm text-sky-400 font-medium px-3 py-2 rounded-md border border-sky-400 bg-black min-w-[180px] text-center">
        {getNetworkDisplay()}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onMouseEnter={() => setButtonHovered(true)}
            onMouseLeave={() => setButtonHovered(false)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center min-w-[180px] justify-center ${
              buttonHovered
                ? "bg-sky-400 text-black shadow-[0_0_10px_rgba(56,189,248,0.7)]"
                : "bg-black border border-sky-400 text-sky-400"
            } ${className}`}
          >
            <div className="flex items-center">
              <Wallet className="mr-2 h-4 w-4" />
              <div className="flex items-center space-x-1">
                <span className="truncate max-w-24">
                  {address
                    ? `${address.slice(0, 4)}...${address.slice(-4)}`
                    : "CONNECTED"}
                </span>
                {balanceData && (
                  <span className="text-sm font-normal">
                    ({parseFloat(balanceData.formatted).toFixed(1)}{" "}
                    {balanceData.symbol})
                  </span>
                )}
              </div>
              <ChevronDown className="ml-2 h-4 w-4" />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 bg-black border border-sky-400/20"
        >
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-xs text-gray-400">Connected with MetaMask</p>
            <p className="font-medium">
              {address
                ? `${address.slice(0, 6)}...${address.slice(-4)}`
                : "Connected"}
            </p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => (window.location.href = "/dashboard")}
            className="cursor-pointer"
          >
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDisconnectClick}
            className="text-red-500 cursor-pointer"
          >
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
