import React, { useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Marketcap", href: "/marketcap" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Bets", href: "/bets" },
    { name: "Launch Tokens", href: "/launch" },
    { name: "Create Bets", href: "/create-bets" },
    { name: "Quick Swap", href: "/swap" },
  ];

  return (
    <nav className="bg-black/90 fixed w-full z-50 top-0 left-0 border-b border-gray-800">
      <div className="max-w-screen-xl mx-auto px-2 sm:px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-[#00A8E8] text-xl sm:text-2xl font-bold">
                HYPERSONIC
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-[#00A8E8] px-3 py-2 text-sm font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Connect Button */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <div className="text-[#00A8E8] px-3 py-1 rounded-lg border border-[#00A8E8] text-sm">
              Sonic Blaze Testnet
            </div>
            <ConnectButton />
          </div>

          {/* Mobile Navigation Button */}
          <div className="flex lg:hidden items-center space-x-2">
            <div className="text-[#00A8E8] px-2 py-1 rounded-lg border border-[#00A8E8] text-xs">
              Sonic Blaze
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="px-3 py-3">
                <ConnectButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
