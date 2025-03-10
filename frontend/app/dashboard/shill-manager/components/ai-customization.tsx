"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Brain,
  Target,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Users,
  Save,
  Sparkles,
  LineChart,
  Lock,
} from "lucide-react"

export function AICustomization() {
  return (
    <div className="grid gap-6">
      {/* Keyword Focus */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>Keyword Focus</CardTitle>
              <CardDescription>Train the AI on project-specific terminology</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Primary Keywords</Label>
              <Input
                placeholder="Enter keywords (comma separated)"
                defaultValue="utility, community, innovation, security"
              />
              <p className="text-sm text-muted-foreground">These keywords will be emphasized in AI responses</p>
            </div>
            <div className="space-y-2">
              <Label>Keyword Categories</Label>
              <div className="flex flex-wrap gap-2">
                {["Technology", "Community", "Tokenomics", "Security", "Development", "Roadmap"].map((category) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 transition-colors"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Control */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>Sentiment Control</CardTitle>
              <CardDescription>Configure AI response sentiment and tone</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Base Sentiment</Label>
              <Select defaultValue="positive">
                <SelectTrigger>
                  <SelectValue placeholder="Select sentiment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive & Optimistic</SelectItem>
                  <SelectItem value="neutral">Neutral & Balanced</SelectItem>
                  <SelectItem value="professional">Professional & Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sentiment Adaptability</Label>
              <div className="flex items-center gap-4">
                <Slider defaultValue={[60]} max={100} step={10} className="flex-1" />
                <span className="w-12 text-center font-mono">60%</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Sentiment Triggers</Label>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-500" />
                  <span>Positive Community Feedback</span>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                  Amplify Enthusiasm
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThumbsDown className="h-4 w-4 text-red-500" />
                  <span>Market Uncertainty</span>
                </div>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                  Reassuring Tone
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fact-Based Responses */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>Fact-Based Responses</CardTitle>
              <CardDescription>Configure factual information for AI responses</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Project Facts</Label>
              <Textarea
                placeholder="Enter key project facts and statistics"
                className="min-h-[100px]"
                defaultValue="- Launched in 2025
- 1M+ holders
- $10M locked liquidity
- Audited by CertiK
- Listed on 5 major exchanges"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Fact Verification</Label>
                <p className="text-sm text-muted-foreground">Only use verified information in responses</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Input */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>Community Input</CardTitle>
              <CardDescription>Incorporate community feedback into AI responses</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Community Sentiment Analysis</Label>
                <p className="text-sm text-muted-foreground">Adapt responses based on community mood</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Trending Topics Integration</Label>
                <p className="text-sm text-muted-foreground">Include popular community discussions</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Community Metrics</Label>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-sky-400" />
                    <span className="text-sm font-medium">Engagement Rate</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">24.3%</p>
                </CardContent>
              </Card>
              <Card className="border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-sky-400" />
                    <span className="text-sm font-medium">Sentiment Score</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">8.4/10</p>
                </CardContent>
              </Card>
              <Card className="border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <LineChart className="h-4 w-4 text-sky-400" />
                    <span className="text-sm font-medium">Growth Trend</span>
                  </div>
                  <p className="text-2xl font-bold mt-2">+15.2%</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Save Configuration
        </Button>
      </div>
    </div>
  )
}

