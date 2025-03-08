"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Twitter, MessageCircle, Check, AlertTriangle } from "lucide-react";

export function SocialSettings() {
  return (
    <div className="grid gap-6">
      {/* Twitter Integration */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Twitter Integration</CardTitle>
              <CardDescription>
                Connect your Twitter account for automated engagement
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="bg-blue-500/10 text-blue-500 border-blue-500/20"
            >
              <Check className="mr-1 h-3 w-3" />
              Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-black/40 border border-white/10">
            <Twitter className="h-8 w-8 text-blue-400" />
            <div className="flex-1">
              <p className="font-medium">@cryptoninja</p>
              <p className="text-sm text-muted-foreground">
                Connected since Feb 10, 2025
              </p>
            </div>
            <Button variant="outline">Disconnect</Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Tweet Permissions</Label>
                <p className="text-sm text-muted-foreground">
                  Allow AI to post tweets on your behalf
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Engagement Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Track likes, retweets, and replies
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Telegram Integration */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Telegram Integration</CardTitle>
          <CardDescription>
            Connect Telegram for instant notifications and updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-black/40 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <p className="font-medium">HyperSonic Bot</p>
            </div>
            <Button>Connect</Button>
          </div>

          <div className="flex items-center gap-2 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <p className="text-sm text-yellow-500">
              Start a chat with @HyperSonicBot on Telegram and use the command
              /connect to link your account.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Discord Webhook */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Discord Webhook</CardTitle>
          <CardDescription>
            Set up Discord notifications for your server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <div className="flex gap-2">
                <Input placeholder="https://discord.com/api/webhooks/..." />
                <Button>Save</Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Price Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Send price movements to Discord
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Trading Signals</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when AI detects trading opportunities
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Portfolio Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Daily portfolio performance summary
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
