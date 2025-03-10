"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings2, Moon, Globe, Clock } from "lucide-react"

export function PreferenceSettings() {
  return (
    <div className="grid gap-6">
      {/* Appearance */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize your viewing experience</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Toggle dark mode theme</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label>Color Theme</Label>
              <Select defaultValue="blue">
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Localization */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>Localization</CardTitle>
              <CardDescription>Set your language and region preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select defaultValue="en">
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Select defaultValue="usd">
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="gbp">GBP (£)</SelectItem>
                  <SelectItem value="jpy">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time & Date */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>Time & Date</CardTitle>
              <CardDescription>Configure time zone and format preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Time Zone</Label>
              <Select defaultValue="utc">
                <SelectTrigger>
                  <SelectValue placeholder="Select time zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                  <SelectItem value="est">EST (GMT-5)</SelectItem>
                  <SelectItem value="pst">PST (GMT-8)</SelectItem>
                  <SelectItem value="jst">JST (GMT+9)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select defaultValue="mdy">
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>24-Hour Time</Label>
                <p className="text-sm text-muted-foreground">Use 24-hour time format</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Additional configuration options</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-refresh Data</Label>
                <p className="text-sm text-muted-foreground">Automatically update market data</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Beta Features</Label>
                <p className="text-sm text-muted-foreground">Access experimental features</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analytics</Label>
                <p className="text-sm text-muted-foreground">Share anonymous usage data</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

