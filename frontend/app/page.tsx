"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWallet } from "./providers/WalletProvider";
import { AppLayout } from "./components/app-layout";
import StarfieldBackground from "./components/GridBackground";
import { Button } from "@/components/ui/button";

export default function Home(): JSX.Element {
  const router = useRouter();
  const { isConnected, connect } = useWallet();

  // Check authentication status
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedAuth = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(isConnected || savedAuth);

    // If authenticated, redirect to dashboard
    if (isConnected || savedAuth) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  // Function to handle the "Connect Wallet" button click
  const handleConnectWallet = async () => {
    try {
      // If not connected, try to connect wallet
      if (!isConnected) {
        await connect();
        // The WalletProvider will handle redirection to dashboard after successful connection
      } else {
        // If already connected, just navigate to dashboard
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      router.push("/dashboard");
    }
  };

  return (
    <AppLayout showFooter={false}>
      {/* Starfield Background */}
      <StarfieldBackground />

      {/* Main Content */}
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ zIndex: 10 }}
      >
        <section className="w-full flex flex-col items-center justify-center">
          <div className="container mx-auto px-4 flex items-center justify-center">
            <div className="py-16 md:py-24 max-w-3xl w-full text-center space-y-8">
              {/* New badge */}
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm">
                  <span className="bg-gradient-to-r from-sky-400 to-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    New
                  </span>
                  <span className="flex items-center gap-2 text-white">
                    Multi-AI Agent Framework for Market Prediction, Smart
                    Trading, Token Launching & On-Chain Betting
                  </span>
                </div>
              </div>

              {/* Hero content */}
              <div className="space-y-8 flex flex-col items-center">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-center text-white">
                  HYPER
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 hover:glow">
                    SONIC
                  </span>
                </h1>
                <p className="text-lg text-gray-300 text-center max-w-2xl mx-auto">
                  Built on Sonic - the high-performance EVM blockchain built for
                  DeFi and Web3 innovation
                </p>
                <div className="flex justify-center gap-4 mt-4">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-white rounded-full px-8 hover:glow"
                    onClick={handleConnectWallet}
                  >
                    Let's GOO!
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full px-8 hover:glow text-white border-white"
                  >
                    View Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Add the glow animation styles */}
        <style jsx global>{`
          @keyframes glow {
            0% {
              text-shadow: 0 0 5px rgba(56, 189, 248, 0.5);
            }
            50% {
              text-shadow: 0 0 10px rgba(56, 189, 248, 0.7),
                0 0 15px rgba(59, 130, 246, 0.5);
            }
            100% {
              text-shadow: 0 0 5px rgba(56, 189, 248, 0.5);
            }
          }

          .hover\\:glow:hover {
            animation: glow 1.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    </AppLayout>
  );
}
