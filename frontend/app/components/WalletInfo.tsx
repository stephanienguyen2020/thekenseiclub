"use client";

import { useWallet } from "../providers/WalletProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function WalletInfo() {
  const {
    isConnected,
    address,
    chainId,
    networkName,
    balance,
    isMetaMaskInstalled,
    connect,
    disconnect,
  } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (!isMetaMaskInstalled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet Not Available</CardTitle>
          <CardDescription>
            MetaMask is not installed in your browser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please install MetaMask to use this feature
          </p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() =>
              window.open("https://metamask.io/download/", "_blank")
            }
          >
            Install MetaMask
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Information</CardTitle>
        <CardDescription>
          {isConnected
            ? "Your wallet is connected"
            : "Connect your wallet to continue"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected && address ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Address
                </p>
                <p className="text-sm font-mono break-all">{address}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Network
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{networkName}</Badge>
                  <span className="text-xs text-muted-foreground">
                    Chain ID: {chainId}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Balance
              </p>
              <p className="text-lg font-semibold">
                {balance
                  ? `${parseFloat(balance).toFixed(4)} ETH`
                  : "Loading..."}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No wallet connected. Connect your wallet to see your information.
          </p>
        )}
      </CardContent>
      <CardFooter>
        {isConnected ? (
          <Button variant="destructive" onClick={handleDisconnect}>
            Disconnect Wallet
          </Button>
        ) : (
          <Button onClick={handleConnect}>Connect Wallet</Button>
        )}
      </CardFooter>
    </Card>
  );
}
