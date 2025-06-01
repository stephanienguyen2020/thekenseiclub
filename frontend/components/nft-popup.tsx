"use client";

import { Check, ExternalLink, X } from "lucide-react";
import Image from "next/image";
import {formatAddress} from "@mysten/sui/utils";

interface NFTData {
  id: string;
  name: string;
  description: string;
  url: string;
}

interface NFTPopupProps {
  nft: NFTData | null;
  isVisible: boolean;
  onClose: () => void;
  transactionHash?: string;
}

export default function NFTPopup({
  nft,
  isVisible,
  onClose,
  transactionHash,
}: NFTPopupProps) {
  if (!isVisible || !nft) {
    return null;
  }

  const handleViewOnExplorer = () => {
    if (transactionHash) {
      // Sui explorer URL - adjust based on network
      const network = process.env.NEXT_PUBLIC_NETWORK || "devnet";
      const explorerUrl = `https://suiscan.xyz/${network}/tx/${transactionHash}`;
      window.open(explorerUrl, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative bg-white rounded-3xl p-8 max-w-lg w-full mx-4 border-4 border-black shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-xl border-4 border-black hover:bg-red-600 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#c0ff00] p-4 rounded-full border-4 border-black">
            <Check size={48} className="text-black" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-black text-center mb-2 text-black">
          🎉 NFT MINTED!
        </h2>
        <p className="text-center text-lg font-bold mb-6 text-gray-700">
          You've received a governance NFT for your vote!
        </p>

        {/* NFT Card */}
        <div className="bg-[#0039C6] p-6 rounded-xl border-4 border-black mb-6">
          {/* NFT Image */}
          <div className="flex justify-center mb-4">
            <div className="w-48 h-48 rounded-xl overflow-hidden border-4 border-white">
              <Image
                src={nft.url || "/placeholder.svg"}
                alt={nft.name}
                width={192}
                height={192}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* NFT Details */}
          <div className="text-center">
            <h3 className="text-xl font-black text-white mb-2">{nft.name}</h3>
            <p className="text-white font-bold text-sm">{nft.description}</p>
          </div>
        </div>

        {/* NFT ID */}
        <div className="bg-gray-100 p-4 rounded-xl border-2 border-black mb-6">
          <p className="text-sm font-bold text-gray-600 mb-1">NFT Object ID:</p>
          <p className="text-xs font-mono text-black break-all bg-white p-2 rounded border">
            {formatAddress(nft.id)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {transactionHash && (
            <button
              onClick={handleViewOnExplorer}
              className="flex-1 bg-[#c0ff00] text-black px-4 py-3 rounded-xl font-black border-4 border-black hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink size={20} />
              VIEW ON EXPLORER
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white px-4 py-3 rounded-xl font-black border-4 border-black hover:bg-gray-600 transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
