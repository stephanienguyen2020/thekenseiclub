"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

const predictionData = [
  { name: "Successful", value: 65, color: "#22c55e" },
  { name: "Pending", value: 25, color: "#eab308" },
  { name: "Failed", value: 10, color: "#ef4444" },
]

const performanceMetrics = [
  { metric: "Average Success Rate", value: "76.4%" },
  { metric: "Total Predictions", value: "1,234" },
  { metric: "Active Users", value: "12,345" },
  { metric: "Total Volume", value: "$1.2M" },
]

export function DashboardAnalytics() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Prediction Status</CardTitle>
          <CardDescription>Distribution of prediction outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={predictionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {predictionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Key platform indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {performanceMetrics.map((metric) => (
              <div key={metric.metric} className="flex items-center justify-between p-4 rounded-lg bg-black/40">
                <span className="text-muted-foreground">{metric.metric}</span>
                <span className="font-mono font-bold">{metric.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

