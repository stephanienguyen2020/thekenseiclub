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
  ConnectButton,
} from "@mysten/dapp-kit";
import { formatAddress } from "@mysten/sui/utils";

export function SuiWalletButton() {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { client } = useSuiClientContext();

  if (!currentAccount) {
    return (
      <div className="bg-[#c0ff00] text-black rounded-full font-medium hover:bg-opacity-90 transition-colors border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <ConnectButton className="px-6 py-3" />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-2 border-black">
          {formatAddress(currentAccount.address)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="flex flex-col items-start gap-1">
          <span className="text-sm font-medium">Address</span>
          <span className="text-xs text-muted-foreground">
            {formatAddress(currentAccount.address)}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex flex-col items-start gap-1">
          <span className="text-sm font-medium">Network</span>
          <span className="text-xs text-muted-foreground">SUI Network</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => disconnect()}>
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
