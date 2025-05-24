"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { ExternalLink, ImageIcon, Trophy } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { nftService } from "../../../services/nftService";

interface NFT {
  id: string;
  name: string;
  description: string;
  url: string;
  type: string;
}

export default function MyNFTsPage() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentAccount = useCurrentAccount();

  useEffect(() => {
    const fetchUserNFTs = async () => {
      if (!currentAccount?.address) {
        setError("Please connect your wallet to view your NFTs");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userNFTs = await nftService.getUserNFTs(currentAccount.address);
        setNfts(userNFTs);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch NFTs");
      } finally {
        setLoading(false);
      }
    };

    fetchUserNFTs();
  }, [currentAccount?.address]);

  const handleViewOnExplorer = (nftId: string) => {
    const network = process.env.NEXT_PUBLIC_NETWORK || "devnet";
    const explorerUrl = `https://suiscan.xyz/${network}/object/${nftId}`;
    window.open(explorerUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="bg-white p-8 rounded-3xl shadow-lg border-4 border-black">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-t-[#c0ff00] border-r-[#c0ff00] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-lg font-medium">Loading your NFTs...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-[#0039C6] p-6 rounded-3xl border-4 border-black mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-[#c0ff00] p-3 rounded-full border-4 border-black">
            <Trophy size={32} className="text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">
              My NFT Collection
            </h1>
            <p className="text-white font-bold">
              Governance participation badges and collectibles
            </p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border-4 border-red-500 p-6 rounded-xl mb-6">
          <p className="text-red-700 font-bold text-center">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!error && nfts.length === 0 && (
        <div className="bg-white p-12 rounded-3xl border-4 border-black text-center">
          <div className="text-gray-400 mb-4">
            <ImageIcon size={64} className="mx-auto opacity-50" />
          </div>
          <h3 className="text-2xl font-black mb-2 text-white">No NFTs Found</h3>
          <p className="text-gray-600 font-bold mb-6">
            You haven't minted any governance NFTs yet. Vote on proposals to
            earn your first NFT!
          </p>
          <a
            href="/marketplace"
            className="bg-[#c0ff00] text-black px-6 py-3 rounded-xl font-black border-4 border-black hover:bg-yellow-300 transition-colors inline-block"
          >
            Explore Tokens
          </a>
        </div>
      )}

      {/* NFT Grid */}
      {!error && nfts.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-white">
              {nfts.length} NFT{nfts.length !== 1 ? "s" : ""} Found
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {nfts.map((nft) => (
              <div
                key={nft.id}
                className="bg-white rounded-3xl border-4 border-black overflow-hidden hover:translate-y-[-5px] transition-transform"
              >
                {/* NFT Image */}
                <div className="relative h-64 bg-gradient-to-br from-[#0039C6] to-[#0046F4] flex items-center justify-center">
                  <div className="w-48 h-48 rounded-xl overflow-hidden border-4 border-white">
                    <Image
                      src={nft.url || "/placeholder.svg"}
                      alt={nft.name}
                      width={192}
                      height={192}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to placeholder on error
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                </div>

                {/* NFT Details */}
                <div className="p-4">
                  <h3 className="text-lg font-black text-black mb-2 truncate">
                    {nft.name}
                  </h3>
                  <p className="text-sm text-gray-600 font-bold mb-4 line-clamp-2">
                    {nft.description}
                  </p>

                  {/* NFT ID */}
                  <div className="bg-gray-100 p-2 rounded-lg border-2 border-gray-300 mb-4">
                    <p className="text-xs font-bold text-gray-500 mb-1">
                      Object ID:
                    </p>
                    <p className="text-xs font-mono text-black break-all">
                      {nft.id}
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleViewOnExplorer(nft.id)}
                    className="w-full bg-[#c0ff00] text-black px-4 py-2 rounded-xl font-black border-4 border-black hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={16} />
                    View on Explorer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
