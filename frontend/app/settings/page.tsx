"use client";

import { motion } from "framer-motion";
import { AppLayout } from "../components/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "./components/profile-settings";
import { SocialSettings } from "./components/social-settings";
import { NotificationSettings } from "./components/notification-settings";
import { SecuritySettings } from "./components/security-settings";
import { AISettings } from "./components/ai-settings";
import { PreferenceSettings } from "./components/preference-settings";
import { WalletSettings } from "./components/wallet-settings";
import {
  User,
  Share2,
  Bell,
  Shield,
  Bot,
  Settings2,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAccount } from "wagmi";
import { useWallet } from "../providers/WalletProvider";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const { isAuthenticated } = useWallet();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Update wallet address when connection status changes
  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
    } else {
      // Try to get from localStorage as fallback
      const savedAddress = localStorage.getItem("userAddress");
      setWalletAddress(savedAddress);
    }
  }, [isConnected, address]);

  return (
    <AppLayout showFooter={false}>
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
        <div className="container max-w-7xl mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 pb-6 border-b border-white/10"
          >
            <div className="flex flex-col gap-4">
              <Badge
                variant="outline"
                className="w-fit bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1"
              >
                Settings & Preferences
              </Badge>
              <h1 className="text-4xl font-bold">
                Account{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500">
                  Settings
                </span>
              </h1>
            </div>
          </motion.div>

          {/* Settings Tabs */}
          <Tabs defaultValue="profile" className="space-y-8">
            <div className="overflow-x-auto pb-2">
              <TabsList className="bg-white/5 p-1 rounded-lg inline-flex min-w-full lg:grid lg:grid-cols-7 gap-4">
                <TabsTrigger
                  value="profile"
                  className="data-[state=active]:bg-blue-500 gap-2 whitespace-nowrap"
                >
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="wallet"
                  className="data-[state=active]:bg-blue-500 gap-2 whitespace-nowrap"
                >
                  <Wallet className="h-4 w-4" />
                  Wallet
                </TabsTrigger>
                <TabsTrigger
                  value="social"
                  className="data-[state=active]:bg-blue-500 gap-2 whitespace-nowrap"
                >
                  <Share2 className="h-4 w-4" />
                  Social
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="data-[state=active]:bg-blue-500 gap-2 whitespace-nowrap"
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="data-[state=active]:bg-blue-500 gap-2 whitespace-nowrap"
                >
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger
                  value="ai"
                  className="data-[state=active]:bg-blue-500 gap-2 whitespace-nowrap"
                >
                  <Bot className="h-4 w-4" />
                  AI Settings
                </TabsTrigger>
                <TabsTrigger
                  value="preferences"
                  className="data-[state=active]:bg-blue-500 gap-2 whitespace-nowrap"
                >
                  <Settings2 className="h-4 w-4" />
                  Preferences
                </TabsTrigger>
              </TabsList>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 rounded-xl border border-white/10 p-6 overflow-hidden"
            >
              <TabsContent value="profile" className="mt-0">
                <ProfileSettings />
              </TabsContent>

              <TabsContent value="wallet" className="mt-0">
                <WalletSettings />
              </TabsContent>

              <TabsContent value="social" className="mt-0">
                <SocialSettings />
              </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <NotificationSettings />
              </TabsContent>

              <TabsContent value="security" className="mt-0">
                <SecuritySettings />
              </TabsContent>

              <TabsContent value="ai" className="mt-0">
                <AISettings />
              </TabsContent>

              <TabsContent value="preferences" className="mt-0">
                <PreferenceSettings />
              </TabsContent>
            </motion.div>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
