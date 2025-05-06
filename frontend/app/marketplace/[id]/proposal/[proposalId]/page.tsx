"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { FileText, Check, ChevronDown, ExternalLink, Info, Send } from "lucide-react"
import Navbar from "@/components/navbar"
import React from "react"
import { getObject } from "@/lib/utils"

interface Option {
  option: string;
  votes: number;
  points: number;
  _id: string;
}

interface ProposalResponse {
  _id: string;
  title: string;
  description: string;
  options: Option[];
  createdBy: string;
  tokenAddress: string;
  startDate: string;
  endDate: string;
  ipfsHash: string;
  contentHash: string;
  voteCount: number;
  votePoint: number;
  status: string;
  createdAt: string;
  winningOption: string;
}

export default function ProposalDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string; proposalId: string }>
}) {
  const params = React.use(paramsPromise);
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
    const fetchProposal = async () => {
      try {
        const response = await fetch(`/api/daos/${params.proposalId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch proposal');
        }
        const { data } = await response.json() as { data: ProposalResponse };

        // Fetch token metadata
        const coinMetadata = (await getObject(data.tokenAddress)) as any;
        const tokenName = coinMetadata?.data?.content?.fields?.name || data.tokenAddress;

        // Map API data to match the expected structure
        const mappedProposal = {
          id: data._id,
          title: data.title,
          description: data.description,
          fullDescription: data.description, // Using description as fullDescription since it's not provided
          status: data.status,
          endDate: new Date(data.endDate).toLocaleString(),
          startDate: new Date(data.startDate).toLocaleString(),
          proposer: data.createdBy,
          options: data.options.map((opt: Option) => ({
            label: opt.option,
            votes: opt.votes,
            percentage: (opt.points / data.votePoint) * 100 || 0,
            isSelected: opt.option === data.winningOption
          })),
          quorum: 0, // Not provided in API
          totalVotes: data.voteCount,
          votingSystem: "Single choice", // Not provided in API
          snapshot: new Date(data.startDate).toLocaleString(),
          commentCount: 0, // Not provided in API
          votes: [], // Not provided in API
        };

        setProposal(mappedProposal);

        // Set coin data (using token address as ID)
        setCoin({
          id: params.id,
          name: params.id.charAt(0).toUpperCase() + params.id.slice(1),
          symbol: params.id.toUpperCase(),
          logo: `/placeholder.svg?height=64&width=64&query=${params.id} logo`,
          treasury: 0, // Not provided in API
          holders: 0, // Not provided in API
        });

        // Set the selected option based on the proposal data
        const selectedIndex = mappedProposal.options.findIndex((option) => option.isSelected);
        setSelectedOption(selectedIndex !== -1 ? selectedIndex : null);

        // Mock comments (keeping this for now since it's not provided by API)
        setComments([
          {
            id: "comment-1",
            user: {
              name: "TokenWhale",
              handle: "whale.sui",
              avatar: "/pixel-cool-cat.png",
            },
            content: "I strongly support this proposal. The legal structure will help us reach new audiences and grow our community.",
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
            content: "While I agree with the intent, I think we should clarify the governance process more. How will voting power be calculated?",
            timestamp: "1 day ago",
            votes: 18,
          },
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching proposal:', error);
        setLoading(false);
      }
    };

    fetchProposal();
  }, [params.id, params.proposalId]);

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
                    proposal.status === "open"
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
                  {proposal.fullDescription.split("\n\n").map((paragraph: string, idx: number) => {
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
              {proposal.status !== "closed" && (
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
                          onClick={() => proposal.status === "open" && setSelectedOption(originalIndex)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              {proposal.status === "open" && (
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
                          <div className="mt-2 text-sm text-gray-600">{option.votes} votes</div>
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

                  {proposal.status === "open" && (
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
              )}

              {/* Results Section */}
              <div className="border-t-2 border-black p-6">
                <h3 className="text-xl font-bold mb-4">Results</h3>
                <div className="space-y-4 mb-6">
                  {sortedOptions.map((option, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl border-2 border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{option.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600">{option.votes} votes</span>
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
