"use client";

import { ArrowLeft, Lock, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@mysten/dapp-kit";

export function AuthRequired() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#0039C6]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="space-y-6">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-[#c0ff00] p-3 border-2 border-black">
                <Lock className="h-6 w-6 text-black" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-black">
                Authentication Required
              </h2>
              <p className="text-gray-600">
                Please connect your wallet to access this page
              </p>
            </div>

            <div className="flex justify-center">
              <ConnectButton />
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>
                Connect your wallet to access all features including dashboard,
                portfolio, and trading.
              </p>
            </div>

            <button
              onClick={() => router.push("/")}
              className="w-full bg-white text-black px-6 py-3 rounded-full font-medium border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Return to Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
