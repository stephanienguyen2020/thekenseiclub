"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Star, ChevronUp, ChevronDown, Search, Trash2 } from "lucide-react"

export default function WatchlistPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for all available coins
  const allCoins = [
    {
      id: "pepe",
      name: "Pepe",
      symbol: "PEPE",
      logo: "/happy-frog-on-a-lilypad.png",
      price: 0.00000123,
      change24h: 12.5,
      marketCap: 12500000,
      holders: 5432,
    },
    {
      id: "doge",
      name: "Doge",
      symbol: "DOGE",
      logo: "/alert-shiba.png",
      price: 0.00045678,
      change24h: -3.2,
      marketCap: 98700000,
      holders: 12345,
    },
    {
      id: "shib",
      name: "Shiba Inu",
      symbol: "SHIB",
      logo: "/stylized-shiba-inu.png",
      price: 0.00000987,
      change24h: 5.7,
      marketCap: 45600000,
      holders: 9876,
    },
    {
      id: "wojak",
      name: "Wojak",
      symbol: "WOJ",
      logo: "/Distressed-Figure.png",
      price: 0.00000045,
      change24h: 32.1,
      marketCap: 3400000,
      holders: 2345,
    },
    {
      id: "moon",
      name: "Moon",
      symbol: "MOON",
      logo: "/crescent-moon-silhouette.png",
      price: 0.00000789,
      change24h: -8.4,
      marketCap: 7800000,
      holders: 4567,
    },
    {
      id: "cat",
      name: "Cat Coin",
      symbol: "CAT",
      logo: "/playful-calico.png",
      price: 0.00000321,
      change24h: 15.3,
      marketCap: 5600000,
      holders: 3456,
    },
  ]

  // Load watchlist from localStorage
  useEffect(() => {
    const loadWatchlist = () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("watchlist")
        setWatchlist(saved ? JSON.parse(saved) : [])
      }
      setIsLoading(false)
    }

    loadWatchlist()
  }, [])

  // Save watchlist to localStorage when it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("watchlist", JSON.stringify(watchlist))
    }
  }, [watchlist, isLoading])

  const removeFromWatchlist = (coinId: string) => {
    setWatchlist((prev) => prev.filter((id) => id !== coinId))
  }

  // Filter watchlisted coins
  const watchlistedCoins = allCoins.filter((coin) => watchlist.includes(coin.id))

  // Apply search filter
  const filteredCoins = watchlistedCoins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-4xl font-black text-white mb-8">Watchlist</h1>
        <div className="bg-white rounded-3xl p-6 border-4 border-black">
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-t-[#c0ff00] border-r-[#c0ff00] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-4xl font-black text-white mb-8">Watchlist</h1>

      <div className="bg-white rounded-3xl p-6 border-4 border-black">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search your watchlist..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border-4 border-black focus:outline-none focus:ring-2 focus:ring-[#c0ff00]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredCoins.length > 0 ? (
          <div className="space-y-4">
            {filteredCoins.map((coin) => (
              <div
                key={coin.id}
                className="bg-white rounded-xl border-4 border-black p-4 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-black">
                      <Image
                        src={coin.logo || "/placeholder.svg"}
                        width={48}
                        height={48}
                        alt={coin.name}
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{coin.name}</h3>
                        <span className="text-gray-500">{coin.symbol}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">${coin.price.toFixed(8)}</span>
                        <span
                          className={`flex items-center ${coin.change24h >= 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          {coin.change24h >= 0 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          {Math.abs(coin.change24h)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Market Cap</div>
                      <div className="font-bold">${(coin.marketCap / 1000000).toFixed(1)}M</div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/marketplace/${coin.id}`}
                        className="bg-[#0039C6] text-white px-4 py-2 rounded-xl text-sm font-bold border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                      >
                        View
                      </Link>

                      <button
                        onClick={() => removeFromWatchlist(coin.id)}
                        className="bg-red-500 text-white p-2 rounded-xl border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                        aria-label="Remove from watchlist"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="bg-[#c0ff00] p-4 rounded-full border-4 border-black mb-4">
              <Star size={32} className="text-black" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your watchlist is empty</h2>
            <p className="text-gray-500 mb-6 max-w-md">
              {searchQuery
                ? `No tokens matching "${searchQuery}" found in your watchlist.`
                : "Add tokens to your watchlist by clicking the star icon in the marketplace."}
            </p>
            <Link
              href="/marketplace"
              className="bg-[#c0ff00] text-black px-6 py-3 rounded-xl font-bold border-4 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              Explore Marketplace
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
