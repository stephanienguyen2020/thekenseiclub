"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRightLeft, TrendingUp, TrendingDown } from "lucide-react"
import type { Asset } from "./types" // You'll need to move the Asset interface to a types.ts file

interface TradeModalProps {
  isOpen: boolean
  onClose: () => void
  asset: Asset
}

export function TradeModal({ isOpen, onClose, asset }: TradeModalProps) {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [slippage, setSlippage] = useState("0.5")

  const handleTrade = async (type: "buy" | "sell") => {
    setIsLoading(true)
    // Add your trade logic here
    setTimeout(() => {
      setIsLoading(false)
      onClose()
    }, 2000)
  }

  const calculateTotal = (amount: string) => {
    const qty = Number.parseFloat(amount) || 0
    return (qty * asset.price).toFixed(2)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Trade {asset.symbol}
          </DialogTitle>
          <DialogDescription>
            Current price: ${asset.price.toFixed(2)} • 24h:{" "}
            <span className={asset.priceChangePercent >= 0 ? "text-green-500" : "text-red-500"}>
              {asset.priceChangePercent >= 0 ? "+" : ""}
              {asset.priceChangePercent}%
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className="gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4">
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Amount to Buy</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className="text-sm text-muted-foreground">Total: ${calculateTotal(amount)}</div>
              </div>

              <div className="space-y-2">
                <Label>Slippage Tolerance</Label>
                <div className="flex gap-2">
                  {["0.5", "1.0", "2.0"].map((value) => (
                    <Button
                      key={value}
                      variant={slippage === value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSlippage(value)}
                    >
                      {value}%
                    </Button>
                  ))}
                </div>
              </div>

              <Button className="w-full" onClick={() => handleTrade("buy")} disabled={isLoading || !amount}>
                {isLoading ? "Processing..." : `Buy ${asset.symbol}`}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="sell" className="space-y-4">
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Amount to Sell</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className="text-sm text-muted-foreground">Total: ${calculateTotal(amount)}</div>
                <div className="text-sm text-muted-foreground">
                  Available: {asset.holdings.toLocaleString()} {asset.symbol}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Slippage Tolerance</Label>
                <div className="flex gap-2">
                  {["0.5", "1.0", "2.0"].map((value) => (
                    <Button
                      key={value}
                      variant={slippage === value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSlippage(value)}
                    >
                      {value}%
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full bg-red-500 hover:bg-red-600"
                onClick={() => handleTrade("sell")}
                disabled={isLoading || !amount}
              >
                {isLoading ? "Processing..." : `Sell ${asset.symbol}`}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

