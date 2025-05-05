"use client"

import { useState } from "react"
import { Check, FileText, MessageSquare, ExternalLink, ChevronDown } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import {VoteNotification} from "@/components/ui/vote-notification";

interface VoteOption {
  label: string
  votes: number
  percentage: number
  isSelected?: boolean
}

interface ProposalCardProps {
  id: string
  title: string
  description: string
  status: "open" | "closed" | "upcoming"
  endDate: string
  tokenSymbol: string
  tokenLogo: string
  options: VoteOption[]
  tokenId: string
  onVote?: (choice: string) => Promise<void>
  userVote?: string
  winningOption?: string
  isVoting?: boolean
}

export default function ProposalCard({
                                       id,
                                       title,
                                       description,
                                       status,
                                       endDate,
                                       tokenSymbol,
                                       tokenLogo,
                                       options,
                                       tokenId,
                                       onVote,
                                       userVote,
                                       winningOption,
                                       isVoting
                                     }: ProposalCardProps) {
  const [showAllOptions, setShowAllOptions] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(
    userVote ? options.findIndex(opt => opt.label === userVote) : null
  )
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const isVotable = status === "open"
  const truncatedDescription = description.length > 200 ? `${description.substring(0, 200)}...` : description
  const hasMoreThanTwoOptions = options.length > 2

  // Sort options by percentage (highest first)
  const sortedOptions = [...options].sort((a, b) => b.percentage - a.percentage)

  // Display only the first 2 options if not showing all and there are more than 2
  const displayedOptions = showAllOptions
    ? sortedOptions
    : hasMoreThanTwoOptions
      ? sortedOptions.slice(0, 2)
      : sortedOptions

  const handleVoteSelect = async (index: number) => {
    if (status !== "open") {
      setNotificationMessage(
        "This proposal is no longer active. Voting has ended."
      );
      setShowNotification(true);
      return;
    }

    const alreadyVoted = selectedOption !== null;
    if (alreadyVoted) {
      setNotificationMessage(
        "You have already voted on this proposal. Each user can only vote once."
      );
      setShowNotification(true);
      return;
    }
    if (status !== "open" || userVote || isVoting) return;
    setSelectedOption(index);
    if (onVote) {
      await onVote(options[index].label);
    }
  }

  const getOptionStyle = (option: VoteOption, isSelected: boolean) => {
    if (winningOption === option.label) {
      return "bg-green-500 bg-opacity-10 border-2 border-green-500 text-green-500"
    }
    if (userVote === option.label) {
      return "bg-[#0046F4] bg-opacity-10 border-2 border-[#0046F4] text-[#0046F4]"
    }
    if (isSelected) {
      return "bg-[#0046F4] bg-opacity-10 border-2 border-[#0046F4] text-[#0046F4]"
    }
    if (status === "open" && !userVote) {
      return "bg-gray-50 border-2 border-gray-200 hover:bg-gray-100 hover:border-[#0046F4] hover:text-[#0046F4] transition-all duration-200"
    }
    return "bg-gray-50 border-2 border-gray-200"
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden mb-6 border-2 border-black">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b-2 border-black">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-black">
            <Image
              src={tokenLogo || "/placeholder.svg"}
              alt={tokenSymbol}
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
          <span className="font-bold">{tokenSymbol} Team</span>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold border-2 border-black ${
            status === "open"
              ? "bg-[#c0ff00] text-black"
              : status === "closed"
                ? "bg-red-500 text-white"
                : "bg-blue-200 text-blue-800"
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>

      {/* Proposal Content */}
      <div className="px-4 py-4">
        <h2 className="text-xl font-bold mb-1">{title}</h2>
        <p className="text-gray-600 text-sm mb-2">Ended at {endDate}</p>
        <p className="text-gray-800 mb-4">{truncatedDescription}</p>
      </div>

      {/* Voting Options */}
      <div className="px-4 pb-4 space-y-3">
        {displayedOptions.map((option, index) => {
          const isSelected = selectedOption === index
          const isUserVote = userVote === option.label
          const isWinning = winningOption === option.label
          const optionStyle = getOptionStyle(option, isSelected)
          const isInteractive = status === "open" && !userVote && !isWinning

          return (
            <div
              key={index}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${optionStyle} ${
                isInteractive ? 'hover:scale-[1.02] hover:shadow-md' : ''
              } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleVoteSelect(index)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {(isSelected || isUserVote || isWinning) && (
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      isWinning ? 'bg-green-500' : 'bg-[#0046F4]'
                    }`}>
                      <Check className="text-white" size={14} />
                    </div>
                  )}
                  {isInteractive && !isSelected && !isUserVote && !isWinning && (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-[#0046F4] transition-colors duration-200" />
                  )}
                  <span className="font-medium">{option.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">
                    {option.percentage.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="mt-1 text-sm text-gray-600">{option.votes.toLocaleString()} votes</div>
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

      {/* Action Buttons */}
      <div className="border-t-2 border-black p-4 flex justify-between bg-gray-50">
        <div className="flex gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-black text-sm font-medium border-2 border-black">
            <FileText size={16} />
            <span>IPFS</span>
          </button>
          <Link
            href={`/marketplace/${tokenId}/proposal/${id}/discussion`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-black text-sm font-medium border-2 border-black"
          >
            <MessageSquare size={16} />
            <span>Discussion</span>
          </Link>
        </div>
        <Link
          href={`/marketplace/${tokenId}/proposal/${id}`}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#c0ff00] text-black text-sm font-bold border-2 border-black"
        >
          <span>View details</span>
          <ExternalLink size={16} />
        </Link>
      </div>

      {/* Vote Notification */}
      <VoteNotification
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        message={notificationMessage}
      />
    </div>
  )
}
