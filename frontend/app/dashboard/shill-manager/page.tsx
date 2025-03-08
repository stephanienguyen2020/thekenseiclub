"use client";

import { motion } from "framer-motion";
import { AppLayout } from "../../components/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardOverview } from "./components/dashboard-overview";
import { AutoShillSettings } from "./components/auto-shill-settings";
import { ReplyAutomation } from "./components/reply-automation";
import { AICustomization } from "./components/ai-customization";
import { ConversationTracking } from "./components/conversation-tracking";
import { LogsAnalytics } from "./components/logs-analytics";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Settings,
  MessageSquare,
  Wand2,
  Users,
  BarChart2,
} from "lucide-react";

export default function ShillManagerPage() {
  return (
    <AppLayout showFooter={false}>
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 overflow-hidden">
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
                Shill Agent
              </Badge>
              <h1 className="text-4xl font-bold">
                Meme Coin Marketing{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-[#00ff00] to-blue-500">
                  in One Click
                </span>
              </h1>
            </div>
          </motion.div>

          {/* Main Content */}
          <Tabs defaultValue="dashboard" className="space-y-8">
            <div className="overflow-x-auto pb-2">
              <TabsList className="bg-white/5 p-1 rounded-lg inline-flex min-w-full lg:grid lg:grid-cols-6 gap-4">
                <TabsTrigger
                  value="dashboard"
                  className="data-[state=active]:bg-blue-500 gap-2 whitespace-nowrap"
                >
                  <Bot className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:bg-blue-500 gap-2 whitespace-nowrap"
                >
                  <Settings className="h-4 w-4" />
                  Auto-Shill
                </TabsTrigger>
                <TabsTrigger
                  value="automation"
                  className="data-[state=active]:bg-blue-500 gap-2 whitespace-nowrap"
                >
                  <MessageSquare className="h-4 w-4" />
                  Replies
                </TabsTrigger>
                <TabsTrigger
                  value="ai"
                  className="data-[state=active]:bg-blue-500 gap-2 whitespace-nowrap"
                >
                  <Wand2 className="h-4 w-4" />
                  AI Config
                </TabsTrigger>
                <TabsTrigger
                  value="conversations"
                  className="data-[state=active]:bg-blue-500 gap-2 whitespace-nowrap"
                >
                  <Users className="h-4 w-4" />
                  Tracking
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:bg-blue-500 gap-2 whitespace-nowrap"
                >
                  <BarChart2 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 rounded-xl border border-white/10 p-6 overflow-hidden"
            >
              <TabsContent value="dashboard" className="space-y-6 mt-0">
                <DashboardOverview />
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 mt-0">
                <AutoShillSettings />
              </TabsContent>

              <TabsContent value="automation" className="space-y-6 mt-0">
                <ReplyAutomation />
              </TabsContent>

              <TabsContent value="ai" className="space-y-6 mt-0">
                <AICustomization />
              </TabsContent>

              <TabsContent value="conversations" className="space-y-6 mt-0">
                <ConversationTracking />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6 mt-0">
                <LogsAnalytics />
              </TabsContent>
            </motion.div>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
