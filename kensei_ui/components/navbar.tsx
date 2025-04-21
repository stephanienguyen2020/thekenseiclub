"use client"

import Link from "next/link"
import { useState } from "react"
import { Bell, ChevronDown, Search, User } from "lucide-react"

interface NavbarProps {
  isAuthenticated?: boolean
}

export default function Navbar({ isAuthenticated = false }: NavbarProps) {
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false)
  const [isDashboardOpen, setIsDashboardOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <nav className="flex items-center justify-between p-6">
      <div className="flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1">
          <div className="bg-[#c0ff00] text-black px-3 py-1 rounded-full text-sm font-bold">KENSEI</div>
        </Link>
      </div>

      {/* Center Nav Links - Only show when not authenticated */}
      {!isAuthenticated && (
        <div className="hidden md:flex items-center gap-6 mx-auto">
          <Link
            href="/about"
            className="bg-[#0046F4] text-white px-4 py-1.5 rounded-full text-sm hover:bg-opacity-90 transition-colors"
          >
            About Kensei
          </Link>
          <Link
            href="/marketplace"
            className="bg-[#0046F4] text-white px-4 py-1.5 rounded-full text-sm hover:bg-opacity-90 transition-colors"
          >
            Marketplace
          </Link>
          <Link
            href="/feed"
            className="bg-[#0046F4] text-white px-4 py-1.5 rounded-full text-sm hover:bg-opacity-90 transition-colors"
          >
            Community Feed
          </Link>
          <Link
            href="/docs"
            className="bg-[#0046F4] text-white px-4 py-1.5 rounded-full text-sm hover:bg-opacity-90 transition-colors"
          >
            Documentations
          </Link>
        </div>
      )}

      {/* Left Nav Links - Only show when authenticated */}
      {isAuthenticated && (
        <div className="flex items-center gap-6">
          {/* Marketplace Dropdown */}
          <div className="relative">
            <button
              className="bg-[#0046F4] text-white px-4 py-1.5 rounded-full text-sm hover:bg-opacity-90 transition-colors flex items-center gap-1"
              onClick={() => setIsMarketplaceOpen(!isMarketplaceOpen)}
            >
              Marketplace
              {/*<ChevronDown size={14} />*/}
            </button>
            {/* {isMarketplaceOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg p-2 z-50 min-w-[180px] border-2 border-black">
                <Link
                  href="/marketplace"
                  className="block px-4 py-2 text-sm hover:bg-[#0046F4] hover:text-white rounded-lg"
                  onClick={() => setIsMarketplaceOpen(false)}
                >
                  All Tokens
                </Link>
                <Link
                  href="/marketplace/trending"
                  className="block px-4 py-2 text-sm hover:bg-[#0046F4] hover:text-white rounded-lg"
                  onClick={() => setIsMarketplaceOpen(false)}
                >
                  Trending
                </Link>
                <Link
                  href="/marketplace/newest"
                  className="block px-4 py-2 text-sm hover:bg-[#0046F4] hover:text-white rounded-lg"
                  onClick={() => setIsMarketplaceOpen(false)}
                >
                  Newest
                </Link>
                <Link
                  href="/marketplace/leaderboard"
                  className="block px-4 py-2 text-sm hover:bg-[#0046F4] hover:text-white rounded-lg"
                  onClick={() => setIsMarketplaceOpen(false)}
                >
                  Leaderboard
                </Link>
              </div>
            )}*/}
          </div>

          {/* Feed */}
          <Link
            href="/feed"
            className="bg-[#0046F4] text-white px-4 py-1.5 rounded-full text-sm hover:bg-opacity-90 transition-colors"
          >
            Community Feed
          </Link>

          {/* My Dashboard Dropdown - Modified to link directly to dashboard */}
          <div className="relative">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="bg-[#0046F4] text-white px-4 py-1.5 rounded-full text-sm hover:bg-opacity-90 transition-colors"
              >
                My Dashboard
              </Link>
              <button
                className="bg-[#0046F4] text-white py-1.5 px-1 rounded-r-full -ml-1 hover:bg-opacity-90 transition-colors"
                onClick={() => setIsDashboardOpen(!isDashboardOpen)}
              >
                <ChevronDown size={14} />
              </button>
            </div>
            {isDashboardOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg p-2 z-50 min-w-[180px] border-2 border-black">
                <Link
                  href="/dashboard/wallet"
                  className="block px-4 py-2 text-sm hover:bg-[#0046F4] hover:text-white rounded-lg"
                  onClick={() => setIsDashboardOpen(false)}
                >
                  My Wallet
                </Link>
                <Link
                  href="/dashboard/proposals"
                  className="block px-4 py-2 text-sm hover:bg-[#0046F4] hover:text-white rounded-lg"
                  onClick={() => setIsDashboardOpen(false)}
                >
                  My Proposals
                </Link>
                <Link
                  href="/dashboard/tweets"
                  className="block px-4 py-2 text-sm hover:bg-[#0046F4] hover:text-white rounded-lg"
                  onClick={() => setIsDashboardOpen(false)}
                >
                  My Tweets
                </Link>
                <Link
                  href="/dashboard/chatbot"
                  className="block px-4 py-2 text-sm hover:bg-[#0046F4] hover:text-white rounded-lg"
                  onClick={() => setIsDashboardOpen(false)}
                >
                  Chat Bot
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Search Bar - Only show when authenticated */}
        {isAuthenticated && (
          <div className="relative hidden md:block w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tokens, users, proposals..."
              className="w-full bg-white text-black pl-10 pr-4 py-1.5 rounded-full text-sm border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#c0ff00]"
            />
          </div>
        )}

        {isAuthenticated ? (
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
                <User size={20} />
              </button>
              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg p-2 z-50 min-w-[180px] border-2 border-black">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="font-bold">0x1a2b...3c4d</p>
                    <p className="text-xs text-gray-500">Connected to Sui</p>
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm hover:bg-[#0046F4] hover:text-white rounded-lg"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-2 text-sm hover:bg-[#0046F4] hover:text-white rounded-lg"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500 hover:text-white rounded-lg"
                    onClick={() => {
                      // Handle disconnect
                      setIsProfileOpen(false)
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            href="/marketplace"
            className="bg-white text-[#0039C6] px-5 py-2 rounded-full font-medium hover:bg-opacity-90 transition-colors border border-white"
          >
            Connect wallet
          </Link>
        )}
      </div>
    </nav>
  )
}
