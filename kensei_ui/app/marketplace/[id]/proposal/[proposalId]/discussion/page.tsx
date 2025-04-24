"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Send, FileText, ExternalLink } from "lucide-react"
import Navbar from "@/components/navbar"

export default function ProposalDiscussionPage({
  params,
}: {
  params: { id: string; proposalId: string }
}) {
  const [loading, setLoading] = useState(true)
  const [proposal, setProposal] = useState<any>(null)
  const [coin, setCoin] = useState<any>(null)
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
      })

      // Find the proposal by ID
      const proposalId = params.proposalId
      const mockProposals = [
        {
          id: "prop-1",
          title: `${params.id.toUpperCase()}01: Increase Marketing Budget for Community Growth`,
          description:
            "The community should allocate 10% of treasury for marketing initiatives to increase visibility and attract new holders. This proposal aims to establish a dedicated marketing fund that will be used for social media campaigns, influencer partnerships, and community events.",
          status: "active",
          endDate: "2025-05-01 05:00 GMT-4",
          options: [
            { label: "Yes, pass this Proposal", votes: 1250000, percentage: 78.5, isSelected: true },
            { label: "No, do not pass this Proposal", votes: 342000, percentage: 21.5 },
          ],
        },
        {
          id: "prop-2",
          title: `${params.id.toUpperCase()}02: Add Liquidity to SUI DEX`,
          description:
            "Add 5% of treasury to liquidity pools on major SUI DEXes to improve trading depth and reduce slippage for traders. This will help stabilize the token price and make it more attractive for new investors.",
          status: "closed",
          endDate: "2025-04-01 05:00 GMT-4",
          options: [
            { label: "Yes, pass this Proposal", votes: 1850000, percentage: 92.3, isSelected: true },
            { label: "No, do not pass this Proposal", votes: 154000, percentage: 7.7 },
          ],
        },
      ]

      const foundProposal = mockProposals.find((p) => p.id === proposalId) || mockProposals[0]
      setProposal(foundProposal)

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
            "I strongly support this proposal. The marketing budget will help us reach new audiences and grow our community.",
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
            "While I agree with the intent, I think 10% is too high. We should start with 5% and evaluate the results before committing more funds.",
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
            "Has anyone considered which marketing channels we'll focus on? I think we should prioritize Twitter and Discord since that's where most of our community is already active.",
          timestamp: "12 hours ago",
          votes: 9,
        },
      ])

      setLoading(false)
    }, 800)
  }, [params.id, params.proposalId])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0039C6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-black">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-[#c0ff00] border-r-[#c0ff00] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg font-medium">Loading discussion...</p>
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
          <Link href={`/marketplace/${params.id}`} className="flex items-center gap-2">
            <ArrowLeft className="text-white" />
            <div className="bg-white text-black px-3 py-1 rounded-full text-sm font-bold border-2 border-black">
              Back to {coin.symbol}
            </div>
          </Link>
        </div>

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
          <div className="px-4 py-4">
            <h2 className="text-xl font-bold mb-1">{proposal.title}</h2>
            <p className="text-gray-600 text-sm mb-2">Ended at {proposal.endDate}</p>
            <p className="text-gray-800 mb-4">{proposal.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="border-t-2 border-black p-4 flex justify-between bg-gray-50">
            <div className="flex gap-2">
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-black text-sm font-medium border-2 border-black">
                <FileText size={16} />
                <span>IPFS</span>
              </button>
            </div>
            <Link
              href={`/marketplace/${params.id}/proposal/${params.proposalId}`}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#c0ff00] text-black text-sm font-bold border-2 border-black"
            >
              <span>View details</span>
              <ExternalLink size={16} />
            </Link>
          </div>
        </div>

        {/* Discussion Section */}
        <div className="bg-white rounded-3xl p-6 border-2 border-black">
          <h3 className="text-2xl font-bold mb-6">Discussion</h3>

          {/* Comments */}
          <div className="space-y-6 mb-8">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 bg-gray-50 p-4 rounded-2xl border-2 border-gray-200">
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
              <Image src="/pixel-cool-cat.png" alt="Your avatar" width={48} height={48} className="object-cover" />
            </div>
            <div className="flex-1">
              <textarea
                className="w-full border-2 border-black rounded-xl p-3 mb-2 focus:outline-none focus:ring-2 focus:ring-[#0039C6] min-h-[100px]"
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
      </div>
    </div>
  )
}
