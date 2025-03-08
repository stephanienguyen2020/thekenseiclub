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
import { Clock, MessageCircle, Hash, ImageIcon, Save } from "lucide-react"

export function AutoShillSettings() {
  return (
    <div className="grid gap-6">
      {/* Frequency Settings */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>Tweet Frequency</CardTitle>
              <CardDescription>Configure how often the AI should post</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Posting Schedule</Label>
              <Select defaultValue="hourly">
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Every Hour</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Posts Per Day</Label>
              <div className="flex items-center gap-4">
                <Slider defaultValue={[8]} max={24} step={1} className="flex-1" />
                <span className="w-12 text-center font-mono">8</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Quiet Hours</Label>
            <div className="grid gap-4 md:grid-cols-2">
              <Input type="time" placeholder="Start time" />
              <Input type="time" placeholder="End time" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Style */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>Content Style</CardTitle>
              <CardDescription>Customize the AI's posting style and tone</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Tweet Style</Label>
            <div className="flex flex-wrap gap-2">
              {["Hype", "Informative", "Meme-Heavy", "Professional", "Casual", "Technical"].map((style) => (
                <Badge key={style} variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors">
                  {style}
                </Badge>
              ))}
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <Label>Content Mix</Label>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-sm">News & Updates</Label>
                <Slider defaultValue={[40]} max={100} step={10} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Memes & Fun</Label>
                <Slider defaultValue={[30]} max={100} step={10} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Technical Analysis</Label>
                <Slider defaultValue={[30]} max={100} step={10} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hashtags & Mentions */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>Hashtags & Mentions</CardTitle>
              <CardDescription>Manage hashtags and accounts to include in tweets</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Primary Hashtags</Label>
            <Input placeholder="Enter hashtags (comma separated)" defaultValue="#Crypto, #Memecoin, #WAGMI" />
          </div>
          <div className="space-y-2">
            <Label>Secondary Hashtags</Label>
            <Input placeholder="Enter hashtags (comma separated)" defaultValue="#DeFi, #NFTs, #Web3" />
          </div>
          <div className="space-y-2">
            <Label>Accounts to Mention</Label>
            <Input placeholder="Enter usernames (comma separated)" defaultValue="@elonmusk, @VitalikButerin" />
          </div>
          <div className="flex items-center justify-between">
            <Label className="cursor-pointer">Randomize Hashtags</Label>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Meme Integration */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>Meme Integration</CardTitle>
              <CardDescription>Configure AI meme generation settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label className="cursor-pointer">Enable Meme Generation</Label>
            <Switch defaultChecked />
          </div>
          <div className="space-y-2">
            <Label>Meme Frequency</Label>
            <Select defaultValue="medium">
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (20% of tweets)</SelectItem>
                <SelectItem value="medium">Medium (50% of tweets)</SelectItem>
                <SelectItem value="high">High (80% of tweets)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Meme Style</Label>
            <div className="flex flex-wrap gap-2">
              {["Classic", "Modern", "Dank", "Wholesome", "Edgy", "Meta"].map((style) => (
                <Badge key={style} variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors">
                  {style}
                </Badge>
              ))}
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

