"use client";

import { useState } from "react";
import {
  Check,
  FileText,
  MessageSquare,
  ExternalLink,
  ChevronDown,
  Crown,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { VoteNotification } from "./ui/vote-notification";

interface VoteOption {
  label: string;
  votes: number;
  percentage: number;
  isSelected?: boolean;
  isWinning?: boolean;
}

interface ProposalCardProps {
  id: string;
  title: string;
  description: string;
  status: "active" | "closed" | "upcoming";
  endDate: string;
  tokenSymbol: string;
  tokenLogo: string;
  options: VoteOption[];
  tokenId: string;
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
}: ProposalCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(
    options.findIndex((option) => option.isSelected) !== -1
      ? options.findIndex((option) => option.isSelected)
      : null
  );
  const [showAllOptions, setShowAllOptions] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const isVotable = status === "active";
  const truncatedDescription =
    description.length > 200
      ? `${description.substring(0, 200)}...`
      : description;
  const hasMoreThanTwoOptions = options.length > 2;

  // Find winning option for closed proposals
  const winningOptionIndex =
    status === "closed"
      ? options.reduce(
          (maxIndex, option, index, array) =>
            option.percentage > array[maxIndex].percentage ? index : maxIndex,
          0
        )
      : -1;

  // Sort options by percentage (highest first)
  const sortedOptions = [...options].sort(
    (a, b) => b.percentage - a.percentage
  );

  // Display only the first 2 options if not showing all and there are more than 2
  const displayedOptions = showAllOptions
    ? sortedOptions
    : hasMoreThanTwoOptions
    ? sortedOptions.slice(0, 2)
    : sortedOptions;

  const handleVoteSelect = (index: number) => {
    if (status !== "active") {
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

    setSelectedOption(index);
  };

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
            status === "active"
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

      {/* Voting Information */}
      {status === "active" && selectedOption === null && (
        <div className="px-4 mb-3">
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <AlertCircle size={18} className="text-blue-500" />
            <p className="text-sm text-blue-700">
              You can only vote once on this proposal.
            </p>
          </div>
        </div>
      )}

      {/* Voting Options */}
      <div className="px-4 pb-4 space-y-3">
        {displayedOptions.map((option, index) => {
          // Find the original index of this option in the unsorted array
          const originalIndex = options.findIndex(
            (o) => o.label === option.label
          );
          const isSelected = selectedOption === originalIndex;
          const isWinning =
            status === "closed" && originalIndex === winningOptionIndex;

          return (
            <div
              key={index}
              className={`p-4 rounded-xl cursor-pointer ${
                isWinning
                  ? "bg-[#c0ff00] bg-opacity-10 border-2 border-[#c0ff00]"
                  : isSelected
                  ? "bg-[#0046F4] bg-opacity-10 border-2 border-[#0046F4]"
                  : "bg-gray-50 border-2 border-gray-200"
              }`}
              onClick={() => handleVoteSelect(originalIndex)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {isSelected && status === "active" && (
                    <div className="w-5 h-5 rounded-full bg-[#0046F4] flex items-center justify-center">
                      <Check className="text-white" size={14} />
                    </div>
                  )}
                  {isWinning && (
                    <div className="w-5 h-5 rounded-full bg-[#c0ff00] flex items-center justify-center">
                      <Crown className="text-black" size={14} />
                    </div>
                  )}
                  <span
                    className={`font-medium ${
                      isWinning
                        ? "text-black"
                        : isSelected
                        ? "text-[#0046F4]"
                        : ""
                    }`}
                  >
                    {option.label}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-lg font-bold ${
                      isWinning
                        ? "text-black"
                        : isSelected
                        ? "text-[#0046F4]"
                        : ""
                    }`}
                  >
                    {option.percentage.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="mt-1 text-sm text-gray-600">
                {(option.votes / 1000000).toFixed(3)}M votes
              </div>
            </div>
          );
        })}

        {/* View All Button */}
        {hasMoreThanTwoOptions && (
          <button
            className="w-full py-3 text-center text-[#0046F4] font-medium flex items-center justify-center gap-1 border-2 border-gray-200 rounded-xl hover:bg-gray-50"
            onClick={() => setShowAllOptions(!showAllOptions)}
          >
            {showAllOptions ? "Show less" : "View all"}
            <ChevronDown
              className={`transition-transform ${
                showAllOptions ? "rotate-180" : ""
              }`}
              size={16}
            />
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
  );
}
