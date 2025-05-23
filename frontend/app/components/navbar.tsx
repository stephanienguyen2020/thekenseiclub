"use client";

import {
  Bell,
  ChevronDown,
  Globe,
  Search,
  Settings,
  User,
  Wallet,
  Network,
  LogOut,
  Bot,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  useCurrentAccount,
  useDisconnectWallet,
  useConnectWallet,
  useWallets,
} from "@mysten/dapp-kit";
import { SuiWalletButton } from "./SuiWalletButton";
import { formatAddress } from "@mysten/sui/utils";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";
import { type } from "os";
import { size } from "viem";

interface NavbarProps {
  isAuthenticated?: boolean;
}

export default function Navbar({ isAuthenticated = false }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isNetworkOpen, setIsNetworkOpen] = useState(false);
  const currentAccount = useCurrentAccount();
  const { mutate: disconnectWallet } = useDisconnectWallet();
  const { mutate: connect } = useConnectWallet();
  const wallets = useWallets();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Only redirect to dashboard if we're on the home page
    if (currentAccount && pathname === "/") {
      router.push("/marketplace");
    }
  }, [currentAccount, router, pathname]);

  useEffect(() => {
    // Check if we have a stored wallet state
    const storedAddress = localStorage.getItem("walletAddress");
    const attemptReconnect = async () => {
      try {
        if (storedAddress && wallets[0] && !currentAccount) {
          await connect({ wallet: wallets[0] });
        }
      } catch (error) {
        console.error("Failed to reconnect wallet:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    attemptReconnect();
  }, [connect, currentAccount, wallets]);

  useEffect(() => {
    // Store wallet address when connected
    if (currentAccount?.address) {
      localStorage.setItem("walletAddress", currentAccount.address);
    }
  }, [currentAccount]);

  useEffect(() => {
    const checkAndCreateUser = async () => {
      try {
        if (!currentAccount) return;
        const response = await api.post("/users", {
          username: `${currentAccount?.address}`,
          suiAddress: currentAccount?.address,
          profilePictureUrl:
            "https://teal-characteristic-echidna-176.mypinata.cloud/ipfs/bafybeigyz5u6d4crnmfsxnlelhadkmausippqr3ezpw5gcwi4yldlofc2a",
        });
        console.log("User registration response:", response.data);
      } catch (apiError) {
        console.error("Failed to register user with backend:", apiError);
      }
    };

    checkAndCreateUser();
  }, [currentAccount]);

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

  const handleDisconnect = () => {
    disconnectWallet();
    localStorage.removeItem("walletAddress");
  };

  // Don't show anything while initializing to prevent flash
  if (isInitializing) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 flex items-center justify-between p-6 bg-[#0039C6] z-50">
      <div className="flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1">
          <div className="bg-[#c0ff00] text-black px-3 py-1 rounded-full text-sm font-bold">
            KENSEI
          </div>
        </Link>
      </div>

      {/* Center Nav Links */}
      <div className="hidden md:flex items-center gap-4">
        {!currentAccount && (
          <>
            <Link
              href="/about"
              className="bg-[#0046F4] text-white px-4 py-1.5 rounded-full text-base hover:bg-opacity-90 transition-colors"
            >
              About Kensei
            </Link>
            <Link
              href="/docs"
              className="bg-[#0046F4] text-white px-4 py-1.5 rounded-full text-base hover:bg-opacity-90 transition-colors"
            >
              Documentations
            </Link>
          </>
        )}
        <Link
          href="/marketplace"
          className="bg-[#0046F4] text-white px-4 py-1.5 rounded-full text-base hover:bg-opacity-90 transition-colors"
        >
          Marketplace
        </Link>
        <Link
          href="/feed"
          className="bg-[#0046F4] text-white px-4 py-1.5 rounded-full text-base hover:bg-opacity-90 transition-colors"
        >
          Community Feed
        </Link>
        <Link
          href="/swap"
          className="bg-[#0046F4] text-white px-4 py-1.5 rounded-full text-base hover:bg-opacity-90 transition-colors"
        >
          Token Swap
        </Link>
        {currentAccount && (
          <div className="relative group">
            <Link
              href="/dashboard"
              className="inline-block bg-[#0046F4] text-white px-4 py-1.5 rounded-full text-base hover:bg-opacity-90 transition-colors"
            >
              My Dashboard
            </Link>
            {/* Buffer div positioned absolutely to not affect button size */}
            <div className="absolute inset-x-0 h-2 bottom-0 translate-y-full" />
            <div className="hidden group-hover:block absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg p-2 z-50 min-w-[180px] border-2 border-black">
              <Link
                href="/dashboard/wallet"
                className="block px-4 py-2 text-base hover:bg-[#0046F4] hover:text-white rounded-lg"
              >
                My Wallet
              </Link>
              <Link
                href="/dashboard/proposals"
                className="block px-4 py-2 text-base hover:bg-[#0046F4] hover:text-white rounded-lg"
              >
                My Proposals
              </Link>
              <Link
                href="/dashboard/tweets"
                className="block px-4 py-2 text-base hover:bg-[#0046F4] hover:text-white rounded-lg"
              >
                My Tweets
              </Link>
              <Link
                href="/dashboard/chatbot"
                className="block px-4 py-2 text-base hover:bg-[#0046F4] hover:text-white rounded-lg"
              >
                Chat Bot
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Search Bar - Only show when authenticated */}
        {currentAccount && (
          <div className="relative hidden md:block w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tokens, users, proposals..."
              className="w-full bg-white text-black pl-10 pr-4 py-1.5 rounded-full text-base border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#c0ff00]"
            />
          </div>
        )}

        {currentAccount ? (
          <>
            {/* Launch Token Button */}
            <Link
              href="/launch"
              className="bg-[#c0ff00] text-black px-5 py-2 rounded-full font-medium hover:bg-opacity-90 transition-colors border-2 border-black"
            >
              Launch a Token
            </Link>

            {/* Notifications */}
            <button className="bg-[#0046F4] text-white p-2 rounded-full hover:bg-opacity-90 transition-colors relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-[#c0ff00] text-black text-xs w-5 h-5 flex items-center justify-center rounded-full border border-black">
                3
              </span>
            </button>

            {/* Avatar/Wallet Dropdown */}
            <div className="relative group">
              <Link
                href="/dashboard/settings"
                className="block w-10 h-10 rounded-full overflow-hidden border-2 border-black cursor-pointer hover:border-[#c0ff00] transition-colors"
              >
                <Image
                  src="/pixel-cool-cat.png"
                  alt="Profile avatar"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </Link>
              {/* Buffer div positioned absolutely to not affect button size */}
              <div className="absolute inset-x-0 h-2 bottom-0 translate-y-full" />
              <div className="hidden group-hover:block absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg p-2 z-50 min-w-[220px] border-2 border-black">
                {currentAccount ? (
                  <>
                    <div className="px-4 py-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Wallet size={16} className="text-gray-600" />
                          <span className="text-sm font-medium">Address</span>
                        </div>
                        <span className="text-xs text-gray-600">
                          {formatAddress(currentAccount.address)}
                        </span>
                      </div>
                    </div>
                    <div className="px-4 py-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Globe size={16} className="text-gray-600" />
                          <span className="text-sm font-medium">
                            SUI Network
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/dashboard/settings"
                      className="block px-4 py-2 text-sm text-black hover:bg-[#0046F4] hover:text-white rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Settings size={16} />
                        <span>Settings</span>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleDisconnect()}
                      className="w-full text-left px-4 py-2 text-sm text-black hover:bg-[#0046F4] hover:text-white rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut size={16} />
                        <span>Disconnect</span>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleConnect}
                      className="w-full text-left px-4 py-2 text-sm text-black hover:bg-[#0046F4] hover:text-white rounded-lg"
                    >
                      Connect Wallet
                    </button>
                    <Link
                      href="/dashboard/settings"
                      className="block px-4 py-2 text-sm text-black hover:bg-[#0046F4] hover:text-white rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Settings size={16} />
                        <span>Settings</span>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <SuiWalletButton />
        )}
      </div>
    </nav>
  );
}
