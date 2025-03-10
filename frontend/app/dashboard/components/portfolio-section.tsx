"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Badge } from "@/components/ui/badge"

const performanceData = [
  { date: "2023-01", value: 8000 },
  { date: "2023-02", value: 9500 },
  { date: "2023-03", value: 11000 },
  { date: "2023-04", value: 10500 },
  { date: "2023-05", value: 12500 },
]

const portfolioStats = {
  totalValue: "$42,069.69",
  todayPL: {
    value: "+$1,337.00",
    percentage: "+3.28%",
  },
  allTimePL: {
    value: "+$12,069.69",
    percentage: "+40.23%",
  },
}

const allocation = [
  { coin: "DOGE", percentage: 40, color: "bg-green-500" },
  { coin: "PEPE", percentage: 30, color: "bg-blue-500" },
  { coin: "SHIB", percentage: 20, color: "bg-yellow-500" },
  { coin: "FLOKI", percentage: 10, color: "bg-red-500" },
]

export function PortfolioSection() {
  return (
    <div className="space-y-6">
      <Card className="border-green-500/20 bg-black/60 backdrop-blur-xl">
        <CardContent className="p-6">
          <h2 className="text-2xl font-mono text-green-500 mb-6">Portfolio Snapshot</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Total Value</p>
              <p className="text-2xl font-mono text-green-500">{portfolioStats.totalValue}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Today's P/L</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-mono text-green-500">{portfolioStats.todayPL.value}</p>
                <span className="text-sm text-green-500">{portfolioStats.todayPL.percentage}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">All-Time P/L</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-mono text-green-500">{portfolioStats.allTimePL.value}</p>
                <span className="text-sm text-green-500">{portfolioStats.allTimePL.percentage}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-2">
              {["1D", "1W", "1M", "3M", "1Y", "ALL"].map((period) => (
                <Badge
                  key={period}
                  variant="outline"
                  className="border-green-500/20 hover:border-green-500/40 cursor-pointer"
                >
                  {period}
                </Badge>
              ))}
            </div>

            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-400">Portfolio Allocation</p>
              <div className="flex gap-2">
                {allocation.map((item) => (
                  <Badge key={item.coin} variant="outline" className={`${item.color}/20`}>
                    {item.coin} {item.percentage}%
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

