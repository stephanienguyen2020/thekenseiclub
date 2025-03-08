"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { date: "Jan", users: 1200, predictions: 150, volume: 50000 },
  { date: "Feb", users: 1500, predictions: 180, volume: 75000 },
  { date: "Mar", users: 2000, predictions: 220, volume: 100000 },
  { date: "Apr", users: 2400, predictions: 280, volume: 150000 },
  { date: "May", users: 3000, predictions: 350, volume: 200000 },
  { date: "Jun", users: 3600, predictions: 400, volume: 250000 },
  { date: "Jul", users: 4200, predictions: 450, volume: 300000 },
]

export function DashboardChart() {
  return (
    <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Platform Growth</CardTitle>
            <CardDescription>Track key platform metrics over time</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Tabs defaultValue="users" className="w-[200px]">
              <TabsList>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="volume">Volume</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select defaultValue="1Y">
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1D">1D</SelectItem>
                <SelectItem value="1W">1W</SelectItem>
                <SelectItem value="1M">1M</SelectItem>
                <SelectItem value="3M">3M</SelectItem>
                <SelectItem value="1Y">1Y</SelectItem>
                <SelectItem value="ALL">ALL</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px",
                }}
              />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 8 }} />
              <Line
                type="monotone"
                dataKey="predictions"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

