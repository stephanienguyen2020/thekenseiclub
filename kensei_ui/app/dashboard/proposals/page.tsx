"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Filter,
  FileText,
  MessageSquare,
  ExternalLink,
  Plus,
} from "lucide-react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { getObject } from "@/lib/utils";

interface Proposal {
  _id: string;
  title: string;
  description: string;
  status: string;
  endDate: string;
  tokenAddress: string;
  voteCount: number;
  votePoint: number;
  createdAt: string;
  winningOption: string;
  tokenName: string;
}

export default function ProposalsPage() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [proposals, setProposals] = useState<{
    active: Proposal[];
    closed: Proposal[];
  }>({ active: [], closed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentAccount = useCurrentAccount();

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        if (!currentAccount?.address) {
          setError("Please connect your wallet");
          setLoading(false);
          return;
        }
        const response = await fetch(
          `/api/daos?wallet=${currentAccount.address}`
        );
        console.log("backendapi response", response);
        if (!response.ok) {
          throw new Error("Failed to fetch proposals");
        }
        const data = await response.json();
        const proposalsData = data.data;
        proposalsData.active = await Promise.all(
          proposalsData.active.map(async (proposal: Proposal) => {
            const coinMetadata = (await getObject(
              proposal.tokenAddress
            )) as any;
            return {
              ...proposal,
              tokenName:
                coinMetadata?.data?.content?.fields?.name ||
                proposal.tokenAddress,
            };
          })
        );
        proposalsData.closed = await Promise.all(
          proposalsData.closed.map(async (proposal: Proposal) => {
            const coinMetadata = (await getObject(
              proposal.tokenAddress
            )) as any;
            return {
              ...proposal,
              tokenName:
                coinMetadata?.data?.content?.fields?.name ||
                proposal.tokenAddress,
            };
          })
        );
        setProposals(proposalsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [currentAccount?.address]);

  // Combine active and closed proposals for filtering
  const allProposals = [...proposals.active, ...proposals.closed];

  // Filter proposals
  const filteredProposals = allProposals.filter(
    (proposal) =>
      (filter === "all" || proposal.status === filter) &&
      (proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.tokenName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Stats
  const stats = {
    total: allProposals.length,
    active: proposals.active.length,
    closed: proposals.closed.length,
    upcoming: 0, // TODO: Add upcoming status to API
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading proposals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black text-white">My Proposals</h1>
        <div className="flex gap-2">
          <Link
            href="/dashboard/proposals/create"
            className="bg-[#c0ff00] text-black px-5 py-2 rounded-xl font-bold border-4 border-black hover:bg-yellow-300 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Create Proposal
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border-4 border-black">
          <div className="flex items-center gap-3">
            <div className="bg-[#c0ff00] p-3 rounded-xl border-2 border-black">
              <FileText size={24} className="text-black" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">Total Proposals</div>
              <div className="text-2xl font-black">{stats.total}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border-4 border-black">
          <div className="flex items-center gap-3">
            <div className="bg-[#c0ff00] p-3 rounded-xl border-2 border-black">
              <FileText size={24} className="text-black" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">Active</div>
              <div className="text-2xl font-black">{stats.active}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border-4 border-black">
          <div className="flex items-center gap-3">
            <div className="bg-red-500 p-3 rounded-xl border-2 border-black">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">Closed</div>
              <div className="text-2xl font-black">{stats.closed}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border-4 border-black">
          <div className="flex items-center gap-3">
            <div className="bg-blue-200 p-3 rounded-xl border-2 border-black">
              <FileText size={24} className="text-blue-800" />
            </div>
            <div>
              <div className="text-gray-500 text-sm">Upcoming</div>
              <div className="text-2xl font-black">{stats.upcoming}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-3xl p-6 mb-6 border-4 border-black">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search proposals..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#0039C6]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-xl flex items-center gap-1 border-2 border-black ${
                filter === "all" ? "bg-[#0039C6] text-white" : "bg-gray-100"
              }`}
              onClick={() => setFilter("all")}
            >
              <Filter size={16} />
              <span>All</span>
            </button>
            <button
              className={`px-4 py-2 rounded-xl flex items-center gap-1 border-2 border-black ${
                filter === "active" ? "bg-[#c0ff00] text-black" : "bg-gray-100"
              }`}
              onClick={() => setFilter("active")}
            >
              <span>Active</span>
            </button>
            <button
              className={`px-4 py-2 rounded-xl flex items-center gap-1 border-2 border-black ${
                filter === "closed" ? "bg-red-500 text-white" : "bg-gray-100"
              }`}
              onClick={() => setFilter("closed")}
            >
              <span>Closed</span>
            </button>
            <button
              className={`px-4 py-2 rounded-xl flex items-center gap-1 border-2 border-black ${
                filter === "upcoming"
                  ? "bg-blue-200 text-blue-800"
                  : "bg-gray-100"
              }`}
              onClick={() => setFilter("upcoming")}
            >
              <span>Upcoming</span>
            </button>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-6">
        {filteredProposals.length > 0 ? (
          filteredProposals.map((proposal) => (
            <div
              key={proposal._id}
              className="bg-white rounded-3xl overflow-hidden border-4 border-black"
            >
              {/* Header */}
              <div className="p-4 flex justify-between items-center border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-black">
                    <Image
                      src="/placeholder.svg"
                      alt={proposal.tokenName}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                  <span className="font-bold">{proposal.tokenName}</span>
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
                  {proposal.status.charAt(0).toUpperCase() +
                    proposal.status.slice(1)}
                </div>
              </div>

              {/* Proposal Content */}
              <div className="px-6 py-6">
                <h2 className="text-xl font-bold mb-2">{proposal.title}</h2>
                <p className="text-gray-600 mb-4">{proposal.description}</p>
                <div className="text-sm text-gray-500 mb-4">
                  Ends at {new Date(proposal.endDate).toLocaleString()}
                </div>

                {/* Voting Progress */}
                {proposal.status !== "upcoming" && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">
                        Voting Progress
                      </span>
                      <span className="text-sm font-bold">
                        {proposal.voteCount > 0
                          ? (
                              (proposal.votePoint / proposal.voteCount) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 border-2 border-black overflow-hidden">
                      <div
                        className="bg-[#c0ff00] h-full rounded-full"
                        style={{
                          width: `${
                            proposal.voteCount > 0
                              ? (proposal.votePoint / proposal.voteCount) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{proposal.votePoint} votes</span>
                      <span>{proposal.voteCount} total</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="border-t-2 border-black p-4 flex justify-between bg-gray-50">
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-black text-sm font-medium border-2 border-black">
                    <FileText size={16} />
                    <span>IPFS</span>
                  </button>
                  <Link
                    href={`/marketplace/${proposal.tokenAddress}/proposal/${proposal._id}/discussion`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-black text-sm font-medium border-2 border-black"
                  >
                    <MessageSquare size={16} />
                    <span>Discussion</span>
                  </Link>
                </div>
                <Link
                  href={`/marketplace/${proposal.tokenAddress}/proposal/${proposal._id}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#c0ff00] text-black text-sm font-bold border-2 border-black"
                >
                  <span>View details</span>
                  <ExternalLink size={16} />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-8 border-4 border-black text-center">
            <div className="text-gray-400 mb-4">
              <FileText size={48} className="mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-bold mb-2">No proposals found</h3>
            <p className="text-gray-500 mb-6">
              {filter !== "all"
                ? `You don't have any ${filter} proposals.`
                : "You haven't created any proposals yet."}
            </p>
            <Link
              href="/dashboard/proposals/create"
              className="bg-[#c0ff00] text-black px-6 py-2 rounded-xl font-bold border-2 border-black inline-block hover:bg-yellow-300 transition-colors flex items-center gap-2 justify-center"
            >
              <Plus size={18} />
              Create your first proposal
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
