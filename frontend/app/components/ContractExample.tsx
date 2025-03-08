"use client";

import { useState } from "react";
import { useContract } from "../hooks/useContract";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWallet } from "../providers/WalletProvider";
import { ethers } from "ethers";

// Example ERC20 ABI (simplified)
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
];

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  balance: string;
}

export function ContractExample({ tokenAddress }: { tokenAddress?: string }) {
  const { isConnected, address } = useWallet();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customAddress, setCustomAddress] = useState(tokenAddress || "");

  // Use the contract hook
  const {
    contract: tokenContract,
    isLoading: isContractLoading,
    error: contractError,
  } = useContract<ethers.Contract>(customAddress || undefined, ERC20_ABI);

  const loadTokenInfo = async () => {
    if (!tokenContract || !address) return;

    try {
      setIsLoading(true);
      setError(null);

      const name = await tokenContract.name();
      const symbol = await tokenContract.symbol();
      const decimals = await tokenContract.decimals();
      const totalSupply = await tokenContract.totalSupply();
      const balance = await tokenContract.balanceOf(address);

      setTokenInfo({
        name,
        symbol,
        decimals,
        totalSupply: ethers.formatUnits(totalSupply, decimals),
        balance: ethers.formatUnits(balance, decimals),
      });
    } catch (err) {
      console.error("Error loading token info:", err);
      setError(
        "Failed to load token information. Make sure the address is correct."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Information</CardTitle>
          <CardDescription>
            Connect your wallet to view token information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You need to connect your wallet first to interact with contracts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Information</CardTitle>
        <CardDescription>
          View information about any ERC20 token
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              placeholder="Enter token contract address"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button
              onClick={loadTokenInfo}
              disabled={isLoading || isContractLoading || !customAddress}
            >
              {isLoading ? "Loading..." : "Load"}
            </Button>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-500/10 text-red-500 text-sm">
              {error}
            </div>
          )}

          {contractError && (
            <div className="p-3 rounded-md bg-red-500/10 text-red-500 text-sm">
              Contract error: {contractError.message}
            </div>
          )}

          {tokenInfo && (
            <div className="space-y-3 p-4 rounded-md border">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Name:
                </span>
                <span className="font-medium">{tokenInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Symbol:
                </span>
                <span className="font-medium">{tokenInfo.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Decimals:
                </span>
                <span className="font-medium">{tokenInfo.decimals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Supply:
                </span>
                <span className="font-medium">{tokenInfo.totalSupply}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Your Balance:
                </span>
                <span className="font-medium">{tokenInfo.balance}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Enter any ERC20 token contract address to view its information
      </CardFooter>
    </Card>
  );
}
