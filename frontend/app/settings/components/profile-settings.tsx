"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ImageIcon,
  Wallet,
  Check,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/app/providers/WalletProvider";

export function ProfileSettings() {
  const [displayName, setDisplayName] = useState("Crypto Ninja");
  const [username, setUsername] = useState("@cryptoninja");
  const [email, setEmail] = useState("crypto@ninja.com");
  const [avatarUrl, setAvatarUrl] = useState("/placeholder.svg");
  const [walletAddress, setWalletAddress] = useState("0x1234...5678");
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the wallet provider
  const { connect, disconnect, isConnected, address } = useWallet();

  // Load user data from localStorage on component mount
  useEffect(() => {
    // Load saved display name
    const savedDisplayName = localStorage.getItem("displayName");
    if (savedDisplayName) {
      setDisplayName(savedDisplayName);
    }

    // Load saved avatar URL
    const savedAvatarUrl = localStorage.getItem("avatarUrl");
    if (savedAvatarUrl) {
      setAvatarUrl(savedAvatarUrl);
    }

    // Load wallet address from localStorage or from wallet provider
    const savedAddress = localStorage.getItem("userAddress");
    if (savedAddress) {
      const shortenedAddress = `${savedAddress.substring(
        0,
        6
      )}...${savedAddress.substring(savedAddress.length - 4)}`;
      setWalletAddress(shortenedAddress);
    } else if (address) {
      const shortenedAddress = `${address.substring(
        0,
        6
      )}...${address.substring(address.length - 4)}`;
      setWalletAddress(shortenedAddress);
    }
  }, [address]);

  // Function to handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarUrl(result);

        // Save to localStorage for persistence
        localStorage.setItem("avatarUrl", result);

        // Trigger storage event for cross-tab synchronization
        const storageEvent = new StorageEvent("storage", {
          key: "avatarUrl",
          newValue: result,
          url: window.location.href,
        });
        window.dispatchEvent(storageEvent);

        saveSettings();
        toast.success("Profile picture updated successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to trigger file input click
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Function to save settings
  const saveSettings = () => {
    // Save to localStorage for persistence
    localStorage.setItem("displayName", displayName);
    localStorage.setItem("avatarUrl", avatarUrl);

    // Trigger storage event for cross-tab synchronization
    window.dispatchEvent(new Event("storage"));

    // Show saved message
    setShowSavedMessage(true);
    setTimeout(() => {
      setShowSavedMessage(false);
    }, 3000);
  };

  // Auto-save when fields change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (displayName || username || email) {
        saveSettings();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [displayName, username, email]);

  // Connect to MetaMask using the wallet provider
  const connectMetaMask = async () => {
    if (isConnected) {
      // If already connected, disconnect
      disconnect();
      setWalletAddress("0x1234...5678");
      toast.success("Wallet disconnected successfully");
    } else {
      try {
        // Connect using the wallet provider
        await connect();

        // The wallet address will be updated in the useEffect hook
        toast.success("Wallet connected successfully");
      } catch (error) {
        toast.error("Failed to connect wallet");
        console.error(error);
      }
    }
  };

  // Connect a new wallet (prompts MetaMask to switch accounts)
  const connectNewWallet = async () => {
    try {
      // First disconnect current wallet
      disconnect();
      setWalletAddress("0x1234...5678");

      // Then connect again to prompt for a new account
      await connect();

      toast.success("New wallet connected successfully");
    } catch (error) {
      toast.error("Failed to connect new wallet");
      console.error(error);
    }
  };

  return (
    <div className="grid gap-6">
      {/* Hidden file input for avatar upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Auto-save notification */}
      {showSavedMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500/90 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 z-50">
          <CheckCircle2 className="h-4 w-4" />
          Settings saved automatically
        </div>
      )}

      {/* Basic Info */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Manage your account details and wallet connections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar
                className="h-24 w-24 cursor-pointer"
                onClick={handleAvatarClick}
              >
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>
                  {displayName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="outline"
                className="absolute -bottom-2 -right-2"
                onClick={handleAvatarClick}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input
                    placeholder="Enter your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Connections */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Connected Wallets</CardTitle>
          <CardDescription>Manage your Web3 wallet connections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* MetaMask */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-black/40 border border-green-500/20">
              <div className="flex items-center gap-4">
                <Wallet className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">MetaMask</p>
                  <p className="text-sm text-muted-foreground">
                    {walletAddress}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-500 border-green-500/20"
                >
                  <Check className="mr-1 h-3 w-3" />
                  Primary
                </Badge>
              </div>
              <Button variant="outline" onClick={connectMetaMask}>
                {walletAddress === "0x1234...5678" ? "Connect" : "Disconnect"}
              </Button>
            </div>

            {/* Add New Wallet */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-dashed border-white/20">
              <div className="flex items-center gap-4">
                <Wallet className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Connect New Wallet</p>
                  <p className="text-sm text-muted-foreground">
                    Add another wallet to your account
                  </p>
                </div>
              </div>
              <Button onClick={connectNewWallet}>Connect</Button>
            </div>
          </div>

          <div className="flex items-center gap-2 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <p className="text-sm text-yellow-500">
              For enhanced security, enable 2FA in the Security tab when
              connecting multiple wallets.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
