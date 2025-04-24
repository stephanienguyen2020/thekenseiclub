"use client"

import Navbar from "@/components/navbar"
import ProposalCard from "@/components/proposal-card"
import TokenFeed from "@/components/token-feed"
import TradingView from "@/components/trading-view"
import { ArrowLeft, Building, LineChart, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

type ProposalStatus = "active" | "closed" | "upcoming"

interface Proposal {
  id: string
  title: string
  description: string
  status: ProposalStatus
  endDate: string
  options: Array<{
    label: string
    votes: number
    percentage: number
    isSelected?: boolean
  }>
}

export default function TokenDetailPageClient({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useState("governance")
  const [governanceFilter, setGovernanceFilter] = useState<"all" | ProposalStatus>("all")
  const [coin, setCoin] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Mock data for the coin
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setCoin({
        id: id,
        name:
          id === "pepe"
            ? "Pepe"
            : id === "doge"
              ? "Doge"
              : id.charAt(0).toUpperCase() + id.slice(1),
        symbol: id.toUpperCase(),
        logo:
          id === "pepe"
            ? "/happy-frog-on-a-lilypad.png"
            : id === "doge"
              ? "/alert-shiba.png"
              : id === "shib"
                ? "/stylized-shiba-inu.png"
                : id === "wojak"
                  ? "/Distressed-Figure.png"
                  : id === "moon"
                    ? "/crescent-moon-silhouette.png"
                    : id === "cat"
                      ? "/playful-calico.png"
                      : `/placeholder.svg?height=64&width=64&query=${id} logo`,
        price: 0.00000123,
        change24h: 12.5,
        marketCap: 12500000,
        holders: 5432,
        description: "A community-driven meme coin on the SUI blockchain with governance features.",
        website: "https://example.com",
        twitter: "https://twitter.com/example",
        telegram: "https://t.me/example",
      })
      setLoading(false)
    }, 500)
  }, [id])

  // Mock proposals data
  const proposals: Proposal[] = [
    {
      id: "prop-1",
      title: `${id.toUpperCase()}01: Increase Marketing Budget for Community Growth`,
      description:
        "The community should allocate 10% of treasury for marketing initiatives to increase visibility and attract new holders. This proposal aims to establish a dedicated marketing fund that will be used for social media campaigns, influencer partnerships, and community events.",
      status: "active" as const,
      endDate: "2025-05-01 05:00 GMT-4",
      options: [
        { label: "Yes, pass this Proposal", votes: 1250000, percentage: 78.5, isSelected: true },
        { label: "No, do not pass this Proposal", votes: 342000, percentage: 21.5 },
      ],
    },
    {
      id: "prop-2",
      title: `${id.toUpperCase()}02: Revisiting The ${id.toUpperCase()} Staking Mechanism`,
      description:
        "After the first set of staking contracts expire, we need to decide on the future staking model. This proposal presents multiple options for the community to vote on, ranging from keeping the current system to implementing new hybrid solutions.",
      status: "closed" as const,
      endDate: "2025-04-01 05:00 GMT-4",
      options: [
        {
          label: "Option 1: Keep Staking as is (No Changes)",
          votes: 7378000,
          percentage: 6.43,
        },
        {
          label: "Option 2: Solution #1 - Tiered Staking with Early Redemption Penalties",
          votes: 2450000,
          percentage: 2.14,
        },
        {
          label: "Option 3: Solution #2 - One Liquid Staking option without Early Redemptions",
          votes: 6130000,
          percentage: 5.34,
        },
        {
          label: "Option 4: Solution #3 Hybrid - Two contracts: Liquid Staking and Tiered Staking",
          votes: 98650000,
          percentage: 86.07,
          isSelected: true,
        },
      ],
    },
    {
      id: "prop-3",
      title: `${id.toUpperCase()}03: Community Treasury Allocation Framework`,
      description:
        "Create a community-managed treasury for future development with clear guidelines on how funds can be allocated. This proposal establishes a governance framework for treasury management and ensures transparency in fund allocation.",
      status: "upcoming" as const,
      endDate: "2025-05-15 05:00 GMT-4",
      options: [
        { label: "Yes, pass this Proposal", votes: 0, percentage: 0 },
        { label: "No, do not pass this Proposal", votes: 0, percentage: 0 },
      ],
    },
    {
      id: "prop-4",
      title: `${id.toUpperCase()}04: ${id.toUpperCase()} Token Utility Expansion`,
      description:
        "This proposal aims to expand the utility of our token by introducing new use cases and integrations. We present multiple options for the community to decide which direction to prioritize.",
      status: "active" as const,
      endDate: "2025-05-10 05:00 GMT-4",
      options: [
        {
          label: "Option 1: Focus on DeFi integrations",
          votes: 450000,
          percentage: 22.5,
        },
        {
          label: "Option 2: Develop NFT marketplace utilities",
          votes: 320000,
          percentage: 16.0,
        },
        {
          label: "Option 3: Create a DAO-managed grants program",
          votes: 980000,
          percentage: 49.0,
          isSelected: true,
        },
        {
          label: "Option 4: Build cross-chain bridges",
          votes: 250000,
          percentage: 12.5,
        },
      ],
    },
    {
      id: "prop-5",
      title: `${id.toUpperCase()}05: Partner with Gaming Platform`,
      description:
        "Form strategic partnership with GameFi platform to increase token utility and adoption. This partnership would allow token holders to use their tokens within popular games and potentially attract gamers to our ecosystem.",
      status: "closed" as const,
      endDate: "2025-03-15 05:00 GMT-4",
      options: [
        { label: "Yes, pass this Proposal", votes: 687000, percentage: 45.8 },
        { label: "No, do not pass this Proposal", votes: 813000, percentage: 54.2, isSelected: true },
      ],
    },
    {
      id: "prop-6",
      title: `${id.toUpperCase()}06: Tokenomics Adjustment Proposal`,
      description:
        "This proposal suggests adjustments to our tokenomics to improve long-term sustainability and value accrual. Several options are presented for the community to decide on.",
      status: "upcoming" as const,
      endDate: "2025-06-01 05:00 GMT-4",
      options: [
        {
          label: "Option 1: Implement a 1% burn on all transactions",
          votes: 0,
          percentage: 0,
        },
        {
          label: "Option 2: Increase staking rewards by reducing team allocation",
          votes: 0,
          percentage: 0,
        },
        {
          label: "Option 3: Create a buy-back and burn mechanism from treasury",
          votes: 0,
          percentage: 0,
        },
        {
          label: "Option 4: Keep current tokenomics unchanged",
          votes: 0,
          percentage: 0,
        },
        {
          label: "Option 5: Implement dynamic fee structure based on market conditions",
          votes: 0,
          percentage: 0,
        },
      ],
    },
  ]

  // Filter proposals based on selected filter
  const filteredProposals = proposals.filter(
    (proposal) => governanceFilter === "all" || proposal.status === governanceFilter,
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0039C6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-lg">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-[#c0ff00] border-r-[#c0ff00] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg font-medium">Loading token details...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0039C6]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <Navbar isAuthenticated={true} />

        <div className="flex items-center mb-8 mt-4">
          <Link href="/marketplace" className="flex items-center gap-2">
            <ArrowLeft className="text-white" />
            <div className="bg-white text-black px-3 py-1 rounded-full text-sm font-bold">SUI</div>
            <div className="bg-[#c0ff00] text-black px-3 py-1 rounded-full text-sm font-bold">KENSEI</div>
          </Link>
        </div>

        {/* Coin Info Card */}
        <div className="bg-white rounded-3xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Image
              src={coin.logo || "/placeholder.svg"}
              width={80}
              height={80}
              alt={coin.name}
              className="rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{coin.name}</h1>
                <span className="bg-gray-100 px-2 py-1 rounded-full text-sm">{coin.symbol}</span>
              </div>
              <p className="text-gray-600 mb-4">{coin.description}</p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2">
                  <LineChart size={16} />
                  <span>${coin.price.toFixed(8)}</span>
                  <span className={coin.change24h >= 0 ? "text-green-500" : "text-red-500"}>
                    {coin.change24h >= 0 ? "+" : ""}
                    {coin.change24h}%
                  </span>
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2">
                  <Building size={16} />
                  <span>Market Cap: ${(coin.marketCap / 1000000).toFixed(1)}M</span>
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2">
                  <Users size={16} />
                  <span>{coin.holders.toLocaleString()} holders</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-[#c0ff00] text-black px-4 py-2 rounded-full text-sm font-bold border-2 border-black">
                Follow
              </button>
              {coin.website && (
                <a
                  href={coin.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-100 p-2 rounded-full"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.44 4 16.08 4 12C4 11.38 4.08 10.79 4.21 10.21L9 15V16C9 17.1 9.9 18 11 18V19.93ZM17.9 17.39C17.64 16.58 16.9 16 16 16H15V13C15 12.45 14.55 12 14 12H8V10H10C10.55 10 11 9.55 11 9V7H13C14.1 7 15 6.1 15 5V4.59C17.93 5.78 20 8.65 20 12C20 14.08 19.2 15.97 17.9 17.39Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              )}
              {coin.twitter && (
                <a
                  href={coin.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-100 p-2 rounded-full"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              )}
              {coin.telegram && (
                <a
                  href={coin.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-100 p-2 rounded-full"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.22 15.51 15.99C15.37 16.74 15.09 16.99 14.83 17.02C14.25 17.07 13.81 16.64 13.25 16.27C12.37 15.69 11.87 15.33 11.02 14.77C10.03 14.12 10.67 13.76 11.24 13.18C11.39 13.03 13.95 10.7 14 10.49C14.0069 10.4582 14.006 10.4252 13.9973 10.3938C13.9886 10.3624 13.9724 10.3337 13.95 10.31C13.89 10.26 13.81 10.28 13.74 10.29C13.65 10.31 12.25 11.24 9.52 13.08C9.12 13.35 8.76 13.49 8.44 13.48C8.08 13.47 7.4 13.28 6.89 13.11C6.26 12.91 5.77 12.8 5.81 12.45C5.83 12.27 6.08 12.09 6.55 11.9C9.47 10.63 11.41 9.79 12.38 9.39C15.16 8.23 15.73 8.03 16.11 8.03C16.19 8.03 16.38 8.05 16.5 8.15C16.6 8.23 16.63 8.34 16.64 8.42C16.63 8.48 16.65 8.66 16.64 8.8Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-3xl p-4 flex gap-4 border-b">
          <button
            className={`px-4 py-2 rounded-full ${
              activeTab === "governance" ? "bg-[#0039C6] text-white" : "bg-gray-100"
            }`}
            onClick={() => setActiveTab("governance")}
          >
            Governance
          </button>
          <button
            className={`px-4 py-2 rounded-full ${activeTab === "feed" ? "bg-[#0039C6] text-white" : "bg-gray-100"}`}
            onClick={() => setActiveTab("feed")}
          >
            Token Feed
          </button>
          <button
            className={`px-4 py-2 rounded-full ${activeTab === "trading" ? "bg-[#0039C6] text-white" : "bg-gray-100"}`}
            onClick={() => setActiveTab("trading")}
          >
            Trade
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-b-3xl p-6">
          {activeTab === "governance" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Building size={20} className="text-[#0039C6]" />
                  Proposals
                </h2>
                <Link
                  href={`/marketplace/${id}/create-proposal`}
                  className="bg-[#c0ff00] text-black px-4 py-2 rounded-full font-bold border-2 border-black"
                >
                  Create Proposal
                </Link>
              </div>

              <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                <button
                  className={`px-4 py-2 rounded-full ${
                    governanceFilter === "all" ? "bg-[#0039C6] text-white" : "bg-gray-100"
                  }`}
                  onClick={() => setGovernanceFilter("all")}
                >
                  All
                </button>
                <button
                  className={`px-4 py-2 rounded-full ${
                    governanceFilter === "active" ? "bg-[#0039C6] text-white" : "bg-gray-100"
                  }`}
                  onClick={() => setGovernanceFilter("active")}
                >
                  Active
                </button>
                <button
                  className={`px-4 py-2 rounded-full ${
                    governanceFilter === "closed" ? "bg-[#0039C6] text-white" : "bg-gray-100"
                  }`}
                  onClick={() => setGovernanceFilter("closed")}
                >
                  Closed
                </button>
                <button
                  className={`px-4 py-2 rounded-full ${
                    governanceFilter === "upcoming" ? "bg-[#0039C6] text-white" : "bg-gray-100"
                  }`}
                  onClick={() => setGovernanceFilter("upcoming")}
                >
                  Upcoming
                </button>
              </div>

              {filteredProposals.length > 0 ? (
                <div className="space-y-4">
                  {filteredProposals.map((proposal) => (
                    <ProposalCard
                      key={proposal.id}
                      id={proposal.id}
                      title={proposal.title}
                      description={proposal.description}
                      status={proposal.status}
                      endDate={proposal.endDate}
                      tokenSymbol={coin.symbol}
                      tokenLogo={coin.logo}
                      options={proposal.options}
                      tokenId={id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="text-gray-400 mb-4">
                    <Building size={48} className="mx-auto opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No {governanceFilter} proposals found</h3>
                  <p className="text-gray-500 mb-6">
                    {governanceFilter === "active"
                      ? "There are no active proposals at the moment."
                      : governanceFilter === "closed"
                        ? "No proposals have been closed yet."
                        : governanceFilter === "upcoming"
                          ? "There are no upcoming proposals scheduled."
                          : "No proposals have been created yet."}
                  </p>
                  <Link
                    href={`/marketplace/${id}/create-proposal`}
                    className="bg-[#c0ff00] text-black px-6 py-2 rounded-full font-bold border-2 border-black"
                  >
                    Create the first proposal
                  </Link>
                </div>
              )}
            </div>
          )}
          {activeTab === "feed" && (
            <TokenFeed tokenId={id} tokenName={coin.name} tokenSymbol={coin.symbol} tokenLogo={coin.logo} />
          )}
          {activeTab === "trading" && (
            <TradingView
              tokenSymbol={coin.symbol}
              tokenName={coin.name}
              tokenLogo={coin.logo}
              currentPrice={coin.price}
              change24h={coin.change24h}
            />
          )}
        </div>
      </div>
    </div>
  )
} 