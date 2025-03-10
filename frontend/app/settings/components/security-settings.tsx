"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Laptop, Smartphone, Key, LogOut, Wallet, Check, AlertTriangle } from "lucide-react"

export function SecuritySettings() {
  return (
    <div className="grid gap-6">
      {/* 2FA Settings */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              <Check className="mr-1 h-3 w-3" />
              Enabled
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-black/40 border border-white/10">
              <div className="flex items-center gap-4">
                <Smartphone className="h-5 w-5 text-sky-400" />
                <div>
                  <p className="font-medium">Authenticator App</p>
                  <p className="text-sm text-muted-foreground">Use Google Authenticator or similar apps</p>
                </div>
              </div>
              <Button variant="outline">Configure</Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-black/40 border border-white/10">
              <div className="flex items-center gap-4">
                <Key className="h-5 w-5 text-sky-400" />
                <div>
                  <p className="font-medium">Security Key</p>
                  <p className="text-sm text-muted-foreground">Use a hardware security key</p>
                </div>
              </div>
              <Button variant="outline">Add Key</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your active login sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-black/40 border border-green-500/20">
              <div className="flex items-center gap-4">
                <Laptop className="h-5 w-5 text-green-500" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Current Device</p>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      Active
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">MacBook Pro • New York, USA</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-black/40 border border-white/10">
              <div className="flex items-center gap-4">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">iPhone 14 Pro</p>
                  <p className="text-sm text-muted-foreground">Los Angeles, USA • Last active 2 hours ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Security */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Wallet Security</CardTitle>
          <CardDescription>Manage approved wallets and withdrawal settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Withdrawal Confirmation</Label>
                <p className="text-sm text-muted-foreground">Require 2FA for all withdrawals</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label>Whitelisted Addresses</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 rounded-lg bg-black/40 border border-white/10">
                  <div className="flex items-center gap-4">
                    <Wallet className="h-5 w-5 text-sky-400" />
                    <div>
                      <p className="font-medium">Personal Wallet</p>
                      <p className="text-sm font-mono text-muted-foreground">0x1234...5678</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Remove
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Enter wallet address" />
                <Button>Add</Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <p className="text-sm text-yellow-500">
              Only withdraw to trusted addresses. Whitelisted addresses require 24h before first withdrawal.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

