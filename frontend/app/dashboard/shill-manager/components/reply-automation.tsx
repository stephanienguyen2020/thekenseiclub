"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  MessageSquare,
  AlertTriangle,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  Save,
  Bot,
  ThumbsUp,
  Zap,
} from "lucide-react"

export function ReplyAutomation() {
  return (
    <div className="grid gap-6">
      {/* Trigger Conditions */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>Trigger Conditions</CardTitle>
              <CardDescription>Configure when the AI should automatically reply</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {[
              {
                title: "Questions",
                description: "Reply to questions about the token",
                examples: ["Is this legit?", "When moon?", "What's the utility?"],
              },
              {
                title: "FUD",
                description: "Counter negative comments and misinformation",
                examples: ["This is a scam", "Rug incoming", "No utility"],
              },
              {
                title: "Positive Engagement",
                description: "Respond to supportive community members",
                examples: ["Great project!", "To the moon! 🚀", "Bullish!"],
              },
            ].map((condition) => (
              <div key={condition.title} className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <Label>{condition.title}</Label>
                  <p className="text-sm text-muted-foreground">{condition.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {condition.examples.map((example) => (
                      <Badge key={example} variant="outline" className="bg-primary/5">
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reply Logic Settings */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>Reply Logic</CardTitle>
              <CardDescription>Customize how the AI crafts responses</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Default Reply Style</Label>
              <Select defaultValue="supportive">
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supportive">Supportive & Educational</SelectItem>
                  <SelectItem value="hype">Hype & Engaging</SelectItem>
                  <SelectItem value="professional">Professional & Factual</SelectItem>
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
                  <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                  <SelectItem value="medium">Medium (2-3 sentences)</SelectItem>
                  <SelectItem value="long">Long (3+ sentences)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Response Templates</Label>
            <div className="grid gap-4">
              {[
                {
                  type: "Supportive",
                  icon: ThumbsUp,
                  template:
                    "Thanks for your interest! [project] is backed by [features]. Check out our whitepaper for more details! 📚",
                },
                {
                  type: "FUD Defense",
                  icon: Shield,
                  template:
                    "Actually, [project] has [security_features] and [audit_status]. We prioritize holder security! 🛡️",
                },
                {
                  type: "Hype",
                  icon: Zap,
                  template: "WAGMI! 🚀 [project] is just getting started! Next stop: [target_price] 📈",
                },
              ].map((template) => (
                <div key={template.type} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <template.icon className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">{template.type}</Label>
                  </div>
                  <Textarea defaultValue={template.template} className="min-h-[80px]" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limiting */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>Rate Limiting</CardTitle>
              <CardDescription>Control reply frequency and limits</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Reply Cooldown</Label>
              <div className="flex items-center gap-4">
                <Slider defaultValue={[5]} max={30} step={1} className="flex-1" />
                <span className="w-16 text-center font-mono">5 min</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Max Replies Per Tweet</Label>
              <div className="flex items-center gap-4">
                <Slider defaultValue={[3]} max={10} step={1} className="flex-1" />
                <span className="w-16 text-center font-mono">3</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Approval */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>Manual Approval</CardTitle>
              <CardDescription>Set up approval workflow for AI responses</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Manual Approval</Label>
              <p className="text-sm text-muted-foreground">Review AI replies before posting</p>
            </div>
            <Switch />
          </div>
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Auto-approve supportive replies</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm">Always review FUD responses</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}

