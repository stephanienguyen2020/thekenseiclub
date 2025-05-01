"use client";

import { Bell, ChevronDown, Globe, Search, Settings, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { SuiWalletButton } from "./SuiWalletButton";

interface NavbarProps {
  isAuthenticated?: boolean;
}

export default function Navbar({ isAuthenticated = false }: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNetworkOpen, setIsNetworkOpen] = useState(false);
  const currentAccount = useCurrentAccount();

  return (
    <nav className="flex items-center justify-between p-6">
      <div className="flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1">
          <div className="bg-[#c0ff00] text-black px-3 py-1 rounded-full text-sm font-bold">
            KENSEI
          </div>
        </Link>
      </div>

      {/* Center Nav Links - Show these only when not authenticated */}
      {!currentAccount && (
        <div className="hidden md:flex items-center gap-6 mx-auto">
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
        </div>
      )}

      {/* Center Nav Links - Always show these */}
      <div className="hidden md:flex items-center gap-6 mx-auto">
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
        {currentAccount && (
          <Link
            href="/dashboard"
            className="bg-[#0046F4] text-white px-4 py-1.5 rounded-full text-base hover:bg-opacity-90 transition-colors"
          >
            My Dashboard
          </Link>
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
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-10 h-10 rounded-full bg-[#c0ff00] flex items-center justify-center border-2 border-black"
              >
                <User size={20} className="text-black" />
              </button>
              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg p-2 z-50 min-w-[220px] border-2 border-black">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="font-bold text-black">
                      {currentAccount.address.slice(0, 6)}...
                      {currentAccount.address.slice(-4)}
                    </p>
                  </div>

                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-2 text-sm text-black hover:bg-[#0046F4] hover:text-white rounded-lg"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <Settings size={16} />
                      <span>Settings</span>
                    </div>
                  </Link>

                  <SuiWalletButton />
                </div>
              )}
            </div>
          </>
        ) : (
          <SuiWalletButton />
        )}
      </div>
    </nav>
  );
}
