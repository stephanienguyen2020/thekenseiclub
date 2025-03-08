"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bot, MessageSquare, Shield, Target } from "lucide-react"

export function AISettings() {
  return (
    <div className="grid gap-6">
      {/* Response Style */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>AI Response Style</CardTitle>
              <CardDescription>Customize how the AI interacts with your community</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Default Response Style</Label>
              <Select defaultValue="neutral">
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aggressive">Aggressive & Confident</SelectItem>
                  <SelectItem value="neutral">Neutral & Balanced</SelectItem>
                  <SelectItem value="educational">Educational & Informative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Response Length</Label>
              <Select defaultValue="medium">
                <SelectTrigger>
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short & Concise</SelectItem>
                  <SelectItem value="medium">Medium & Balanced</SelectItem>
                  <SelectItem value="long">Long & Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Custom Tone Adjustments</Label>
              <Textarea placeholder="Add custom phrases or expressions for the AI to use" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Filters */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>Content Filters</CardTitle>
              <CardDescription>Manage AI response restrictions and preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Blacklisted Words</Label>
              <Textarea placeholder="Enter words to avoid (comma-separated)" />
              <p className="text-sm text-muted-foreground">AI will avoid using or responding to these terms</p>
            </div>

            <div className="space-y-2">
              <Label>Sensitive Topics</Label>
              <div className="space-y-2">
                {["Politics", "Religion", "NSFW Content", "Financial Advice"].map((topic) => (
                  <div key={topic} className="flex items-center justify-between">
                    <Label className="text-sm">{topic}</Label>
                    <Switch />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Prioritization */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>Project Prioritization</CardTitle>
              <CardDescription>Configure AI focus for specific projects</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Whitelisted Projects</Label>
              <Input placeholder="Enter token symbols (comma-separated)" />
              <p className="text-sm text-muted-foreground">AI will prioritize engagement for these projects</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Detect New Projects</Label>
                <p className="text-sm text-muted-foreground">Automatically track trending projects</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Rules */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>Engagement Rules</CardTitle>
              <CardDescription>Set rules for AI interactions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reply to Mentions</Label>
                <p className="text-sm text-muted-foreground">Automatically respond when mentioned</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Proactive Engagement</Label>
                <p className="text-sm text-muted-foreground">Initiate conversations based on keywords</p>
              </div>
              <Switch />
            </div>

            <div className="space-y-2">
              <Label>Response Delay (seconds)</Label>
              <Select defaultValue="30">
                <SelectTrigger>
                  <SelectValue placeholder="Select delay" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Instant</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

