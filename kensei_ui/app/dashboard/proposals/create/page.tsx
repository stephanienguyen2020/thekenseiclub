"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Search, X } from "lucide-react"

export default function CreateProposalSelectToken() {
  const router = useRouter()
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data for available tokens - expanded with more tokens
  const availableTokens = [
    {
      id: "pepe",
      name: "Pepe",
      symbol: "PEPE",
      logo: "/happy-frog-on-a-lilypad.png",
      balance: 1250000,
      minRequired: 10000,
    },
    {
      id: "doge",
      name: "Doge",
      symbol: "DOGE",
      logo: "/alert-shiba.png",
      balance: 5000000,
      minRequired: 50000,
    },
    {
      id: "shib",
      name: "Shiba Inu",
      symbol: "SHIB",
      logo: "/stylized-shiba-inu.png",
      balance: 75000000,
      minRequired: 100000,
    },
    {
      id: "cat",
      name: "Cat",
      symbol: "CAT",
      logo: "/playful-calico.png",
      balance: 500000,
      minRequired: 5000,
    },
    {
      id: "moon",
      name: "Moon",
      symbol: "MOON",
      logo: "/crescent-moon-silhouette.png",
      balance: 2500000,
      minRequired: 25000,
    },
    {
      id: "bull",
      name: "Bulldog",
      symbol: "BULL",
      logo: "/blockchain-bulldog.png",
      balance: 100000,
      minRequired: 1000,
    },
    {
      id: "pup",
      name: "Puppy",
      symbol: "PUP",
      logo: "/pixel-pup.png",
      balance: 3000000,
      minRequired: 30000,
    },
    {
      id: "cool",
      name: "Cool Cat",
      symbol: "COOL",
      logo: "/pixel-cool-cat.png",
      balance: 800000,
      minRequired: 8000,
    },
  ]

  // Filter tokens based on search query
  const filteredTokens = availableTokens.filter((token) => {
    const query = searchQuery.toLowerCase()
    return token.name.toLowerCase().includes(query) || token.symbol.toLowerCase().includes(query)
  })

  const handleContinue = () => {
    if (selectedToken) {
      router.push(`/marketplace/${selectedToken}/create-proposal`)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-8">
        <Link href="/dashboard/proposals" className="flex items-center gap-2">
          <div className="bg-[#c0ff00] p-2 rounded-full border-4 border-black">
            <ArrowLeft className="text-black" size={24} />
          </div>
          <div className="bg-white text-black px-4 py-2 rounded-xl text-sm font-bold border-4 border-black">
            Back to Proposals
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-8 border-4 border-black mb-8">
        <div className="bg-[#c0ff00] p-4 rounded-xl border-4 border-black mb-8">
          <h1 className="text-3xl font-black">Create New Proposal</h1>
          <p className="text-black font-bold">
            Select the token community where you want to create a governance proposal
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search tokens by name or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 rounded-xl border-4 border-black focus:outline-none focus:border-[#c0ff00] text-lg"
            />
            {searchQuery && (
              <button onClick={clearSearch} className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <div className="bg-gray-200 p-1 rounded-full hover:bg-gray-300">
                  <X className="h-5 w-5 text-gray-700" />
                </div>
              </button>
            )}
          </div>
        </div>

        {filteredTokens.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {filteredTokens.map((token) => (
              <div
                key={token.id}
                className={`p-6 rounded-xl border-4 cursor-pointer transition-all ${
                  selectedToken === token.id
                    ? "border-[#c0ff00] bg-[#c0ff00]/10 transform -translate-y-1"
                    : "border-black hover:border-[#c0ff00] hover:bg-gray-50"
                }`}
                onClick={() => setSelectedToken(token.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-black">
                    <Image
                      src={token.logo || "/placeholder.svg"}
                      width={64}
                      height={64}
                      alt={token.name}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{token.name}</h2>
                    <p className="text-gray-500">{token.symbol}</p>
                  </div>
                  <div
                    className={`ml-auto w-6 h-6 rounded-full border-2 border-black flex items-center justify-center ${
                      selectedToken === token.id ? "bg-[#c0ff00]" : "bg-white"
                    }`}
                  >
                    {selectedToken === token.id && <div className="w-3 h-3 rounded-full bg-black"></div>}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-300">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Your Balance:</span>
                    <span className="font-bold">
                      {token.balance.toLocaleString()} {token.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Min Required:</span>
                    <span className="font-bold">
                      {token.minRequired.toLocaleString()} {token.symbol}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-100 p-8 rounded-xl border-4 border-black mb-8 text-center">
            <h3 className="text-xl font-bold mb-2">No tokens found</h3>
            <p className="text-gray-700">
              No tokens match your search query "{searchQuery}". Try a different search term or clear the search.
            </p>
            <button
              onClick={clearSearch}
              className="mt-4 bg-[#c0ff00] text-black px-6 py-2 rounded-xl font-bold border-4 border-black hover:bg-yellow-300 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            disabled={!selectedToken}
            className="bg-[#c0ff00] text-black px-8 py-4 rounded-xl font-black text-xl border-4 border-black hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus size={24} />
            Continue to Create Proposal
          </button>
        </div>
      </div>

      <div className="bg-yellow-100 p-6 rounded-xl border-4 border-black">
        <h3 className="text-xl font-bold mb-4">About Creating Proposals</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <div className="bg-[#c0ff00] p-1 rounded-full border-2 border-black mt-1">
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
            <span>You need to hold the minimum required amount of tokens to create a proposal for that community.</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-[#c0ff00] p-1 rounded-full border-2 border-black mt-1">
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
            <span>Proposals can be for governance changes, treasury allocations, or community initiatives.</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="bg-[#c0ff00] p-1 rounded-full border-2 border-black mt-1">
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
            <span>
              Once created, your proposal will be visible to all token holders who can vote based on their holdings.
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
