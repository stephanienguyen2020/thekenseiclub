"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { FileText, Check, ChevronDown, ExternalLink, Info, Send } from "lucide-react"
import Navbar from "@/components/navbar"

export default function ProposalDetailPage({
  params,
}: {
  params: { id: string; proposalId: string }
}) {
  const [loading, setLoading] = useState(true)
  const [proposal, setProposal] = useState<any>(null)
  const [coin, setCoin] = useState<any>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [showAllOptions, setShowAllOptions] = useState(true)
  const [showAllVotes, setShowAllVotes] = useState(false)
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState<any[]>([])

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setCoin({
        id: params.id,
        name:
          params.id === "pepe"
            ? "Pepe"
            : params.id === "doge"
              ? "Doge"
              : params.id.charAt(0).toUpperCase() + params.id.slice(1),
        symbol: params.id.toUpperCase(),
        logo:
          params.id === "pepe"
            ? "/happy-frog-on-a-lilypad.png"
            : params.id === "doge"
              ? "/alert-shiba.png"
              : params.id === "shib"
                ? "/stylized-shiba-inu.png"
                : params.id === "wojak"
                  ? "/Distressed-Figure.png"
                  : params.id === "moon"
                    ? "/crescent-moon-silhouette.png"
                    : params.id === "cat"
                      ? "/playful-calico.png"
                      : `/placeholder.svg?height=64&width=64&query=${params.id} logo`,
        treasury: 5000000,
        holders: 5432,
      })

      // Find the proposal by ID
      const proposalId = params.proposalId
      const mockProposals = [
        {
          id: "prop-1",
          title: `${params.id.toUpperCase()}01: Incorporation of ${params.id.toUpperCase()} DAO LLC as a Non-Profit DAO LLC`,
          description: `The ${params.id.toUpperCase()} community should implement this proposal to provide a robust governance and legal structure that aligns with the decentralized ethos of the DAO, ensures compliance with a fit-for-purpose jurisdiction, protects members, and fosters ecosystem growth.`,
          fullDescription: `
Background
Our token has shown strong growth in the past months, and we need to establish a proper legal structure to ensure compliance and protect our community members.

## Scope of Change:

- Incorporation of ${params.id.toUpperCase()} DAO LLC: Establish ${params.id.toUpperCase()} DAO LLC as a non-profit decentralized autonomous organization limited liability company (DAO LLC) under the laws of the Republic of the Marshall Islands.

- Adoption of the Operating Agreement: Formally adopt the ${params.id.toUpperCase()} DAO LLC Operating Agreement to define the DAO structure, rights, and responsibilities of the DAO members.

- Appointment of Registered Agent and Funding Allocation: Designate MIDAO as the registered agent to facilitate incorporation and ongoing compliance. Allocate an initial funding amount of $9,500 as a one-time incorporation fee and an annual budget of $5,000 for maintenance and operational costs.

- Adoption of Updated Governance Process: Implement the updated Governance Process, which defines the rules and procedures by which members of the ${params.id.toUpperCase()} DAO, may propose, vote on, implement ${params.id.toUpperCase()} Improvement Proposals ("MIPs") and exercise their right to participate in the governance of ${params.id.toUpperCase()} DAO LLC.

- Appointment of ${params.id.toUpperCase()} Labs as Initial Managing Member.

- Transfer of DAO Assets to the DAO LLC: Upon formation of the ${params.id.toUpperCase()} DAO LLC, transfer DAO assets to the entity as initial contributions. This includes the DAO treasury and other resources.

## Implementation Timeline
If approved, implementation will begin immediately with the incorporation process starting within 1 week.
          `,
          status: "active",
          endDate: "2025-05-01 05:00 GMT-4",
          startDate: "2025-04-15 05:00 GMT-4",
          proposer: "0x1a2b3c4d5e6f7g8h9i0j",
          options: [
            { label: "Yes, pass this Proposal", votes: 147602000, percentage: 98.67, isSelected: true },
            { label: "No, do not pass this Proposal", votes: 1985000, percentage: 1.33 },
          ],
          quorum: 112496000,
          totalVotes: 149587000,
          votingSystem: "Single choice",
          snapshot: "2025-04-15 05:00 GMT-4",
          commentCount: 24,
          votes: [
            { address: "0x1a2b...3c4d", vote: "Yes, pass this Proposal", power: 14705000 },
            { address: "0x4e5f...6g7h", vote: "Yes, pass this Proposal", power: 2251000 },
            { address: "0x8i9j...0k1l", vote: "Yes, pass this Proposal", power: 83471000 },
            { address: "0x2m3n...4o5p", vote: "Yes, pass this Proposal", power: 670625000 },
            { address: "0x6q7r...8s9t", vote: "Yes, pass this Proposal", power: 50018000 },
            { address: "0x0u1v...2w3x", vote: "Yes, pass this Proposal", power: 29259000 },
            { address: "0x4y5z...6a7b", vote: "Yes, pass this Proposal", power: 25500000 },
            { address: "0x8c9d...0e1f", vote: "Yes, pass this Proposal", power: 33321000 },
            { address: "0x2g3h...4i5j", vote: "Yes, pass this Proposal", power: 1425000 },
            { address: "0x6k7l...8m9n", vote: "Yes, pass this Proposal", power: 1237000 },
            { address: "0x0o1p...2q3r", vote: "No, do not pass this Proposal", power: 1985000 },
          ],
        },
        {
          id: "prop-2",
          title: `${params.id.toUpperCase()}02: Revisiting The ${params.id.toUpperCase()} Staking Mechanism`,
          description:
            "After the first set of staking contracts expire, we need to decide on the future staking model. This proposal presents multiple options for the community to vote on, ranging from keeping the current system to implementing new hybrid solutions.",
          fullDescription: `
Background
On June 28th the ${params.id.toUpperCase()} staking program saw its first set of 9-month staking contracts expire. A few weeks later, ${params.id.toUpperCase()} V2 started rolling out and there is a high expectancy for higher rewards to stakers thanks to the newly implemented features. Looking back at how the staking model has performed we have identified areas for improvement.

## Proposal
This proposal presents four different options for the community to vote on:

### Option 1: Keep ${params.id.toUpperCase()} Staking as is (No Changes)
Continue with the current staking model without any modifications.

### Option 2: Solution #1 - Tiered Staking with Early Redemption Penalties
Implement a tiered staking system with different reward levels based on lock-up periods. Early withdrawals would incur penalties.

### Option 3: Solution #2 - One Liquid Staking option without Early Redemptions
Create a liquid staking solution where users receive a liquid token representing their staked assets, but without the ability to redeem early.

### Option 4: Solution #3 Hybrid - Two contracts
Implement two separate staking contracts:
- A Liquid Staking option with bound APR
- A 9-month Tiered Staking option with Early Redemption Penalties

## Implementation Timeline
The winning option will be implemented within 30 days of the proposal passing.
          `,
          status: "closed",
          endDate: "2025-04-01 05:00 GMT-4",
          startDate: "2025-03-15 05:00 GMT-4",
          proposer: "0x2b3c4d5e6f7g8h9i0j1a",
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
          quorum: 100000000,
          totalVotes: 114608000,
          votingSystem: "Single choice",
          snapshot: "2025-03-15 05:00 GMT-4",
          commentCount: 18,
          votes: [
            { address: "0x1a2b...3c4d", vote: "Option 4", power: 14705000 },
            { address: "0x4e5f...6g7h", vote: "Option 4", power: 2251000 },
            { address: "0x8i9j...0k1l", vote: "Option 4", power: 83471000 },
            { address: "0x2m3n...4o5p", vote: "Option 1", power: 7378000 },
            { address: "0x6q7r...8s9t", vote: "Option 3", power: 6130000 },
            { address: "0x0u1v...2w3x", vote: "Option 2", power: 2450000 },
          ],
        },
      ]

      const foundProposal = mockProposals.find((p) => p.id === proposalId) || mockProposals[0]
      setProposal(foundProposal)

      // Set the selected option based on the proposal data
      const selectedIndex = foundProposal.options.findIndex((option) => option.isSelected)
      setSelectedOption(selectedIndex !== -1 ? selectedIndex : null)

      // Mock comments
      setComments([
        {
          id: "comment-1",
          user: {
            name: "TokenWhale",
            handle: "whale.sui",
            avatar: "/pixel-cool-cat.png",
          },
          content:
            "I strongly support this proposal. The legal structure will help us reach new audiences and grow our community.",
          timestamp: "2 days ago",
          votes: 24,
        },
        {
          id: "comment-2",
          user: {
            name: "CryptoSage",
            handle: "sage.sui",
            avatar: "/stylized-shiba-inu.png",
          },
          content:
            "While I agree with the intent, I think we should clarify the governance process more. How will voting power be calculated?",
          timestamp: "1 day ago",
          votes: 18,
        },
        {
          id: "comment-3",
          user: {
            name: "MemeGuru",
            handle: "guru.sui",
            avatar: "/happy-frog-on-a-lilypad.png",
          },
          content:
            "Has anyone considered the tax implications? I think we should get a legal opinion on this before proceeding.",
          timestamp: "12 hours ago",
          votes: 9,
        },
      ])

      setLoading(false)
    }, 800)
  }, [params.id, params.proposalId])

  const handleVote = () => {
    if (selectedOption === null) return

    setIsVoting(true)

    // Simulate voting
    setTimeout(() => {
      // Update the proposal with the new vote
      const updatedOptions = [...proposal.options]
      updatedOptions[selectedOption].votes += 10000

      // Recalculate percentages
      const totalVotes = updatedOptions.reduce((sum, option) => sum + option.votes, 0)
      updatedOptions.forEach((option) => {
        option.percentage = (option.votes / totalVotes) * 100
      })

      setProposal({
        ...proposal,
        options: updatedOptions,
      })

      setIsVoting(false)
    }, 1500)
  }

  const handleSubmitComment = () => {
    if (!comment.trim()) return

    const newComment = {
      id: `comment-${comments.length + 1}`,
      user: {
        name: "You",
        handle: "you.sui",
        avatar: "/pixel-cool-cat.png",
      },
      content: comment,
      timestamp: "Just now",
      votes: 0,
    }

    setComments([...comments, newComment])
    setComment("")
  }

  // Sort options by percentage (highest first)
  const sortedOptions = proposal?.options ? [...proposal.options].sort((a, b) => b.percentage - a.percentage) : []

  // Determine if we should show the "View all" button
  const hasMoreThanTwoOptions = sortedOptions.length > 2

  // Display only the first 2 options if not showing all and there are more than 2
  const displayedOptions = showAllOptions || !hasMoreThanTwoOptions ? sortedOptions : sortedOptions.slice(0, 2)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0039C6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-black">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-[#c0ff00] border-r-[#c0ff00] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg font-medium">Loading proposal details...</p>
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

        {/* Breadcrumb */}
        <div className="flex items-center mb-4 mt-4 text-white">
          <Link href="/marketplace" className="hover:underline">
            Proposals
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium">{proposal.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2/3 width on large screens */}
          <div className="lg:col-span-2">
            {/* Proposal Card */}
            <div className="bg-white rounded-3xl overflow-hidden mb-6 border-2 border-black">
              {/* Header */}
              <div className="p-4 flex justify-between items-center border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-black">
                    <Image
                      src={coin.logo || "/placeholder.svg"}
                      alt={coin.symbol}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                  <span className="font-bold">{coin.symbol} Team</span>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold border-2 border-black ${
                    proposal.status === "active"
                      ? "bg-[#c0ff00] text-black"
                      : proposal.status === "closed"
                        ? "bg-red-500 text-white"
                        : "bg-blue-200 text-blue-800"
                  }`}
                >
                  {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                </div>
              </div>

              {/* Proposal Content */}
              <div className="px-6 py-6">
                <h1 className="text-3xl font-bold mb-6">{proposal.title}</h1>

                <div className="prose max-w-none mb-6">
                  {proposal.fullDescription.split("\n\n").map((paragraph, idx) => {
                    // Handle headings
                    if (paragraph.startsWith("##")) {
                      const headingText = paragraph.replace(/^## /, "")
                      return (
                        <h2 key={idx} className="text-2xl font-bold mt-6 mb-3">
                          {headingText}
                        </h2>
                      )
                    } else if (paragraph.startsWith("###")) {
                      const headingText = paragraph.replace(/^### /, "")
                      return (
                        <h3 key={idx} className="text-xl font-bold mt-4 mb-2">
                          {headingText}
                        </h3>
                      )
                    }
                    // Handle bullet points
                    else if (paragraph.startsWith("-")) {
                      return (
                        <div key={idx} className="ml-4 mb-2">
                          <span className="inline-block w-2 h-2 bg-black rounded-full mr-2"></span>
                          {paragraph.replace(/^- /, "")}
                        </div>
                      )
                    }
                    // Regular paragraph
                    else if (paragraph.trim()) {
                      return (
                        <p key={idx} className="mb-4">
                          {paragraph}
                        </p>
                      )
                    }
                    return null
                  })}
                </div>

                <div className="mt-6">
                  <Link href="#" className="text-[#0046F4] flex items-center gap-1 font-medium">
                    <FileText size={16} />
                    <span>Read the full proposal on IPFS</span>
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>

              {/* Voting Section */}
              <div className="border-t-2 border-black p-6 bg-gray-50">
                <h3 className="text-xl font-bold mb-4">Cast your vote</h3>

                {/* No voting power message */}
                <div className="bg-[#2A2522] text-[#F0B90B] p-4 rounded-xl mb-6">
                  <div className="flex items-start gap-2">
                    <Info size={20} />
                    <div>
                      <p className="font-bold">No voting power</p>
                      <p className="text-sm">
                        Voting power is determined based on the snapshot of {coin.symbol} tokens (including those held
                        in LPs and Staking).
                      </p>
                      <Link href="#" className="text-sm underline flex items-center gap-1 mt-1">
                        More details
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Voting Options */}
                <div className="space-y-4 mb-6">
                  {displayedOptions.map((option, index) => {
                    // Find the original index of this option in the unsorted array
                    const originalIndex = proposal.options.findIndex((o) => o.label === option.label)
                    const isSelected = selectedOption === originalIndex

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-xl cursor-pointer ${
                          isSelected
                            ? "bg-[#0046F4] bg-opacity-10 border-2 border-[#0046F4]"
                            : "bg-white border-2 border-gray-200"
                        }`}
                        onClick={() => proposal.status === "active" && setSelectedOption(originalIndex)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            {proposal.status === "active" && (
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  isSelected ? "bg-[#0046F4]" : "border-2 border-gray-300"
                                }`}
                              >
                                {isSelected && <Check className="text-white" size={16} />}
                              </div>
                            )}
                            <label className={`font-medium ${isSelected ? "text-[#0046F4]" : ""}`}>
                              {option.label}
                            </label>
                          </div>
                          <span className={`font-bold ${isSelected ? "text-[#0046F4]" : ""}`}>
                            {option.percentage.toFixed(2)}%
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">{(option.votes / 1000000).toFixed(3)}M votes</div>
                      </div>
                    )
                  })}

                  {/* View All Button */}
                  {hasMoreThanTwoOptions && (
                    <button
                      className="w-full py-3 text-center text-[#0046F4] font-medium flex items-center justify-center gap-1 border-2 border-gray-200 rounded-xl hover:bg-gray-50"
                      onClick={() => setShowAllOptions(!showAllOptions)}
                    >
                      {showAllOptions ? "Show less" : "View all"}
                      <ChevronDown className={`transition-transform ${showAllOptions ? "rotate-180" : ""}`} size={16} />
                    </button>
                  )}
                </div>

                {proposal.status === "active" && (
                  <div className="flex justify-end">
                    <button
                      className="bg-[#c0ff00] text-black px-6 py-2 rounded-full font-bold border-2 border-black hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={selectedOption === null || isVoting}
                      onClick={handleVote}
                    >
                      {isVoting ? "Voting..." : "Vote"}
                    </button>
                  </div>
                )}
              </div>

              {/* Results Section */}
              <div className="border-t-2 border-black p-6">
                <h3 className="text-xl font-bold mb-4">Results</h3>
                <div className="space-y-4 mb-6">
                  {sortedOptions.map((option, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl border-2 border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{option.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600">{(option.votes / 1000000).toFixed(3)}M votes</span>
                          <span className="font-bold">{option.percentage.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discussion Section */}
              <div className="border-t-2 border-black p-6 bg-gray-50">
                <h3 className="text-xl font-bold mb-4">
                  Discussion <span className="text-gray-500">({comments.length})</span>
                </h3>

                {/* Comments */}
                <div className="space-y-6 mb-8">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 bg-white p-4 rounded-2xl border-2 border-gray-200">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-black">
                        <Image
                          src={comment.user.avatar || "/placeholder.svg"}
                          alt={comment.user.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold">{comment.user.name}</span>
                          <span className="text-gray-500 text-sm">@{comment.user.handle}</span>
                          <span className="text-gray-400 text-xs">{comment.timestamp}</span>
                        </div>
                        <p className="text-gray-800 mb-2">{comment.content}</p>
                        <div className="flex items-center gap-4">
                          <button className="text-gray-700 text-sm flex items-center gap-1 hover:text-[#0039C6] font-medium">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m19 14-7-7-7 7" />
                            </svg>
                            <span>Upvote ({comment.votes})</span>
                          </button>
                          <button className="text-gray-700 text-sm hover:text-[#0039C6] font-medium">Reply</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment Input */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-black">
                    <Image
                      src="/pixel-cool-cat.png"
                      alt="Your avatar"
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <textarea
                      className="w-full border-2 border-black rounded-xl p-3 mb-2 focus:outline-none focus:ring-2 focus:ring-[#0046F4] min-h-[100px]"
                      placeholder="Share your thoughts on this proposal..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end">
                      <button
                        className="bg-[#c0ff00] text-black px-4 py-2 rounded-full flex items-center gap-2 disabled:opacity-50 font-bold border-2 border-black"
                        disabled={!comment.trim()}
                        onClick={handleSubmitComment}
                      >
                        <span>Comment</span>
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t-2 border-black p-4 flex justify-between bg-white">
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-black text-sm font-medium border-2 border-black">
                    <FileText size={16} />
                    <span>IPFS</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - 1/3 width on large screens */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl overflow-hidden border-2 border-black sticky top-4">
              <div className="p-4 border-b-2 border-black">
                <h3 className="text-xl font-bold">Information</h3>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Proposer</span>
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full overflow-hidden">
                        <Image
                          src={coin.logo || "/placeholder.svg"}
                          alt={coin.symbol}
                          width={20}
                          height={20}
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium">{coin.symbol} Team</span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">IPFS</span>
                    <Link href="#" className="text-[#0046F4] flex items-center gap-1">
                      #QmP7uVa
                      <ExternalLink size={14} />
                    </Link>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Voting system</span>
                    <span className="font-medium">{proposal.votingSystem}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Start at</span>
                    <span className="font-medium">{proposal.startDate}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">End at</span>
                    <span className="font-medium">{proposal.endDate}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Snapshot</span>
                    <span className="font-medium">{proposal.snapshot}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Your voting power</span>
                    <span className="font-medium">0</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Quorum</span>
                    <span className="font-medium">
                      {(proposal.quorum / 1000000).toFixed(3)}M / {(proposal.totalVotes / 1000000).toFixed(3)}M
                    </span>
                  </div>
                </div>
              </div>

              {/* Votes Section */}
              <div className="p-4 border-t-2 border-black">
                <h3 className="text-xl font-bold mb-4">
                  Votes <span className="text-gray-500">({proposal.votes.length})</span>
                </h3>
                <div className="space-y-3">
                  {(showAllVotes ? proposal.votes : proposal.votes.slice(0, 5)).map((vote, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          <Image
                            src={`/placeholder.svg?height=32&width=32&query=avatar`}
                            alt="Voter"
                            width={32}
                            height={32}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{vote.address}</p>
                          <p className="text-xs text-gray-500">{vote.vote}</p>
                        </div>
                      </div>
                      <div className="font-medium">{(vote.power / 1000).toFixed(3)}K</div>
                    </div>
                  ))}

                  {proposal.votes.length > 5 && (
                    <button
                      className="w-full py-3 text-center text-[#0046F4] font-medium flex items-center justify-center gap-1 border-2 border-gray-200 rounded-xl hover:bg-gray-50 bg-white"
                      onClick={() => setShowAllVotes(!showAllVotes)}
                    >
                      {showAllVotes ? "Show less" : "View more"}
                      <ChevronDown className={`transition-transform ${showAllVotes ? "rotate-180" : ""}`} size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
