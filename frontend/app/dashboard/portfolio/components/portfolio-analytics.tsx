"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const assetAllocation = [
  { name: "Layer 1", value: 45, color: "#3b82f6" },
  { name: "Meme Coins", value: 25, color: "#22c55e" },
  { name: "DeFi", value: 15, color: "#eab308" },
  { name: "NFTs", value: 10, color: "#ec4899" },
  { name: "Stablecoins", value: 5, color: "#64748b" },
];

const riskMetrics = [
  { metric: "Portfolio Beta", value: "1.2" },
  { metric: "Sharpe Ratio", value: "2.1" },
  { metric: "Volatility", value: "32.5%" },
  { metric: "Max Drawdown", value: "-25.3%" },
];

export function PortfolioAnalytics() {
  return (
    <div className="space-y-4">
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg">Asset Allocation</CardTitle>
          <CardDescription className="text-xs">
            Distribution by category
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2">
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {assetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconSize={8}
                  fontSize={10}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg">Risk Metrics</CardTitle>
          <CardDescription className="text-xs">
            Key risk indicators
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid gap-2">
            {riskMetrics.map((metric) => (
              <div
                key={metric.metric}
                className="flex items-center justify-between p-2 rounded-lg bg-black/40"
              >
                <span className="text-sm text-muted-foreground">
                  {metric.metric}
                </span>
                <span className="font-mono font-bold">{metric.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
