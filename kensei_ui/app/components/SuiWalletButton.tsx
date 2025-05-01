"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCurrentAccount,
  useCurrentWallet,
  useDisconnectWallet,
  useSuiClientContext,
  useWallets,
  useConnectWallet,
} from "@mysten/dapp-kit";
import { formatAddress } from "@mysten/sui/utils";
import { Wallet, Globe, LogOut } from "lucide-react";
import { useState } from "react";

export function SuiWalletButton() {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { client } = useSuiClientContext();
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  const [isOpen, setIsOpen] = useState(false);

  const handleConnect = async () => {
    try {
      const availableWallet = wallets[0];
      if (availableWallet) {
        await connect({ wallet: availableWallet });
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  if (!currentAccount) {
    return (
      <div className="bg-[#c0ff00] text-black rounded-full font-medium hover:bg-opacity-90 transition-colors border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <button
          onClick={handleConnect}
          className="px-6 py-3 flex items-center gap-2"
        >
          <Wallet size={16} />
          <span>Connect Wallet</span>
        </button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-2 border-black flex items-center gap-2"
        >
          <Wallet size={16} />
          <span>{formatAddress(currentAccount.address)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <Wallet size={16} className="text-gray-600" />
            <span className="text-sm font-medium">Address</span>
          </div>
          <span className="text-xs text-muted-foreground pl-6">
            {formatAddress(currentAccount.address)}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-gray-600" />
            <span className="text-sm font-medium">Network</span>
          </div>
          <span className="text-xs text-muted-foreground pl-6">
            SUI Network
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => disconnect()}
          className="flex items-center gap-2"
        >
          <LogOut size={16} />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
