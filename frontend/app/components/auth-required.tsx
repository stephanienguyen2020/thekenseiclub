"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Lock, ArrowLeft } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";

export function AuthRequired() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-sky-500/20 bg-background/95 backdrop-blur">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-sky-500/10 p-3">
                <Lock className="h-6 w-6 text-sky-500" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">
              Authentication Required
            </CardTitle>
            <CardDescription className="text-center">
              Please connect your wallet to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <ConnectButton />
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                Connect your wallet to access all features including dashboard,
                portfolio, and trading.
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
