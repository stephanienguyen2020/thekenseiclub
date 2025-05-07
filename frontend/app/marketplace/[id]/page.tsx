"use client";

import Navbar from "@/components/navbar";
import ProposalCard from "@/components/proposal-card";
import TokenFeed from "@/components/token-feed";
import TradingView from "@/components/trading-view";
import { ArrowLeft, Building, LineChart, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Coin } from "@/app/marketplace/types";
import { AxiosResponse } from "axios";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useParams } from "next/navigation";
type ProposalStatus = "open" | "closed" | "upcoming";

interface OptionObject {
  option: string;
  votes: number;
  points: number;
  _id?: string;
}

interface Proposal {
  _id: string;
  title: string;
  description: string;
  status: ProposalStatus;
  endDate: string;
  tokenAddress: string;
  voteCount: number;
  votePoint: number;
  createdAt: string;
  winningOption: string;
  options: {
    option: string;
    votes: number;
    points: number;
    _id: string;
  }[];
}

export default function TokenDetailPage() {
  const [activeTab, setActiveTab] = useState("feed");
  const [governanceFilter, setGovernanceFilter] = useState<
    "all" | ProposalStatus
  >("all");
  const { id } = useParams();
  const [coin, setCoin] = useState<Coin>({
    id: "",
    name: "",
    symbol: "",
    logo: "/placeholder.svg",
    price: 0,
    change24h: 0,
    marketCap: 0,
    holders: 0,
    description: "",
    website: "",
    twitter: "",
    telegram: "",
    proposals: 0,
    bondingCurveId: "",
    suiPrice: 0,
  });
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [votingProposals, setVotingProposals] = useState<Set<string>>(new Set());
  const currentAccount = useCurrentAccount();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchUserVotes = async (proposalId: string) => {
    if (!currentAccount?.address) return null;
    try {
      const response = await fetch(`http://localhost:3000/api/daos/votes/user/${proposalId}/${currentAccount.address}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch user vote');
      }
      const data = await response.json();
      return data.choice;
    } catch (error) {
      console.error('Error fetching user vote:', error);
      return null;
    }
  };

  const handleVote = async (proposalId: string, choice: string) => {
    if (!currentAccount?.address) {
      setError('Please connect your wallet to vote');
      return;
    }

    try {
      setVotingProposals(prev => new Set(prev).add(proposalId));
      const signature = "0x" + Math.random().toString(16).substring(2, 66); // Mock signature for now

      const response = await fetch('http://localhost:3000/api/daos/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: currentAccount.address,
          proposalId,
          choice,
          signature
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }

      setUserVotes(prev => ({
        ...prev,
        [proposalId]: choice
      }));

      // Refresh proposals to get updated vote counts
      const proposalsResponse = await fetch(`http://localhost:3000/api/daos/token/${id}`);
      if (!proposalsResponse.ok) {
        throw new Error('Failed to fetch proposals');
      }
      const proposalsData = await proposalsResponse.json();
      setProposals(proposalsData.data || []);
    } catch (error) {
      console.error('Error submitting vote:', error);
      setError('Failed to submit vote. Please try again.');
    } finally {
      setVotingProposals(prev => {
        const newSet = new Set(prev);
        newSet.delete(proposalId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch coin data
        const coinResponse: AxiosResponse<Coin> = await api.get(`/coin/${id}`);
        setCoin({
          ...coinResponse.data,
          website: "https://example.com",
          twitter: "https://twitter.com/example",
          telegram: "https://t.me/example",
        });

        console.log("coin: ", coinResponse.data);

        // Fetch proposals
        const proposalsResponse = await fetch(
          `http://localhost:3000/api/daos/token/${id}`
        );
        if (!proposalsResponse.ok) {
          throw new Error("Failed to fetch proposals");
        }
        const proposalsData = await proposalsResponse.json();
        setProposals(proposalsData.data || []);

        // Fetch user votes for each proposal
        if (currentAccount?.address) {
          const votes: Record<string, string> = {};
          for (const proposal of proposalsData.data) {
            const vote = await fetchUserVotes(proposal._id);
            if (vote) {
              votes[proposal._id] = vote;
            }
          }
          setUserVotes(votes);
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentAccount?.address]);

  // Filter proposals based on selected filter
  const filteredProposals = proposals.filter(
    (proposal) =>
      governanceFilter === "all" || proposal.status === governanceFilter
  );

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
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0039C6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-lg">
          <div className="flex flex-col items-center">
            <p className="text-red-500 text-lg font-medium">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0039C6]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <Navbar isAuthenticated={true} />

        <div className="flex items-center mb-8 mt-4">
          <Link href="/marketplace" className="flex items-center gap-2">
            <ArrowLeft className="text-white" />
            <div className="bg-white text-black px-3 py-1 rounded-full text-sm font-bold">
              SUI
            </div>
            <div className="bg-[#c0ff00] text-black px-3 py-1 rounded-full text-sm font-bold">
              KENSEI
            </div>
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
                <span className="bg-gray-100 px-2 py-1 rounded-full text-sm">
                  {coin.symbol}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{coin.description}</p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2">
                  <LineChart size={16} />
                  <span>${coin.price?.toFixed(15)}</span>
                  <span
                    className={
                      coin.change24h >= 0 ? "text-green-500" : "text-red-500"
                    }
                  >
                    {coin.change24h >= 0 ? "+" : ""}
                    {coin.change24h}%
                  </span>
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2">
                  <Building size={16} />
                  <span>Market Cap: ${coin.marketCap}M</span>
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
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
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
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
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
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
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
              activeTab === "feed" ? "bg-[#0039C6] text-white" : "bg-gray-100"
            }`}
            onClick={() => setActiveTab("feed")}
          >
            Token Feed
          </button>
          <button
            className={`px-4 py-2 rounded-full ${
              activeTab === "governance"
                ? "bg-[#0039C6] text-white"
                : "bg-gray-100"
            }`}
            onClick={() => setActiveTab("governance")}
          >
            Governance
          </button>
          <button
            className={`px-4 py-2 rounded-full ${
              activeTab === "trading"
                ? "bg-[#0039C6] text-white"
                : "bg-gray-100"
            }`}
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
                    governanceFilter === "all"
                      ? "bg-[#0039C6] text-white"
                      : "bg-gray-100"
                  }`}
                  onClick={() => setGovernanceFilter("all")}
                >
                  All
                </button>
                <button
                  className={`px-4 py-2 rounded-full ${
                    governanceFilter === "open"
                      ? "bg-[#0039C6] text-white"
                      : "bg-gray-100"
                  }`}
                  onClick={() => setGovernanceFilter("open")}
                >
                  Open
                </button>
                <button
                  className={`px-4 py-2 rounded-full ${
                    governanceFilter === "closed"
                      ? "bg-[#0039C6] text-white"
                      : "bg-gray-100"
                  }`}
                  onClick={() => setGovernanceFilter("closed")}
                >
                  Closed
                </button>
                <button
                  className={`px-4 py-2 rounded-full ${
                    governanceFilter === "upcoming"
                      ? "bg-[#0039C6] text-white"
                      : "bg-gray-100"
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
                      key={proposal._id}
                      id={proposal._id}
                      title={proposal.title}
                      description={proposal.description}
                      status={proposal.status}
                      endDate={formatDate(proposal.endDate)}
                      tokenSymbol={coin.symbol}
                      tokenLogo={coin.logo}
                      options={proposal.options.map(option => ({
                        label: option.option,
                        votes: option.points,
                        percentage: proposal.voteCount > 0 ? (option.points / proposal.votePoint) * 100 : 0,
                        isSelected: option.option === proposal.winningOption || option.option === userVotes[proposal._id]
                      }))}
                      tokenId={id}
                      onVote={(choice) => handleVote(proposal._id, choice)}
                      userVote={userVotes[proposal._id]}
                      winningOption={proposal.winningOption}
                      isVoting={votingProposals.has(proposal._id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="text-gray-400 mb-4">
                    <Building size={48} className="mx-auto opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    No {governanceFilter} proposals found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {governanceFilter === "open"
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
            <TokenFeed
              tokenId={id}
              tokenName={coin.name}
              tokenSymbol={coin.symbol}
              tokenLogo={coin.logo}
            />
          )}
          {activeTab === "trading" && (
            <TradingView
              tokenSymbol={coin.symbol}
              tokenName={coin.name}
              tokenLogo={coin.logo}
              currentPrice={coin.price}
              change24h={coin.change24h}
              bondingCurveId={coin.bondingCurveId}
              tokenId={coin.id}
              suiPrice={coin.suiPrice}
            />
          )}
        </div>
      </div>
    </div>
  );
}
