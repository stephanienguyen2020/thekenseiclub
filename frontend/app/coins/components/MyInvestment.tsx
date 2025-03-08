"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight,
  Settings2,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

interface MyInvestmentProps {
  symbol: string;
}

// Mock investment data
const mockInvestment = {
  totalInvested: 12500,
  coinAmount: 0.25,
  profitLoss: 1250,
  profitLossPercentage: 10,
  averagePrice: 48750,
  positions: [
    { date: "2023-12-01", amount: 0.1, price: 47500 },
    { date: "2023-12-15", amount: 0.1, price: 49000 },
    { date: "2024-01-05", amount: 0.05, price: 51000 },
  ],
};

// Mock performance data
const mockPerformanceData = [
  { date: "Mon", value: 12000 },
  { date: "Tue", value: 11800 },
  { date: "Wed", value: 12200 },
  { date: "Thu", value: 12500 },
  { date: "Fri", value: 12800 },
  { date: "Sat", value: 13100 },
  { date: "Sun", value: 13750 },
];

const MyInvestment = ({ symbol }: MyInvestmentProps) => {
  const [investment] = useState(mockInvestment);
  const [performanceData] = useState(mockPerformanceData);

  return (
    <Card className="bg-[#1A1B1E] border-none w-full overflow-visible shadow-xl">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-[#2A2B2E] text-gray-400 hover:text-green-400"
          >
            <Settings2 className="h-5 w-5" />
          </Button>

          <h2 className="text-xl font-bold text-white">My Investment</h2>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-[#2A2B2E] text-gray-400 hover:text-green-400"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Investment Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#2A2B2E] p-4 rounded-xl">
            <div className="text-gray-400 text-sm">Total Invested</div>
            <div className="text-xl font-bold text-white">
              ${investment.totalInvested.toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm mt-1">
              {investment.coinAmount} {symbol}
            </div>
          </div>
          <div className="bg-[#2A2B2E] p-4 rounded-xl">
            <div className="text-gray-400 text-sm">Profit/Loss</div>
            <div
              className={`text-xl font-bold ${
                investment.profitLoss >= 0 ? "text-green-400" : "text-red-500"
              }`}
            >
              ${investment.profitLoss.toLocaleString()}
            </div>
            <div
              className={`text-sm flex items-center gap-1 ${
                investment.profitLoss >= 0 ? "text-green-400" : "text-red-500"
              }`}
            >
              {investment.profitLoss >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {investment.profitLossPercentage}%
            </div>
          </div>
        </div>

        {/* 7-Day Performance Chart */}
        <div className="bg-[#2A2B2E] p-4 rounded-xl mb-6">
          <div className="text-gray-400 mb-3">7-Day Performance</div>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#1A1B1E] border border-[#353538] p-2 rounded-lg shadow-lg">
                          <div className="text-gray-300">
                            {payload[0].payload.date}
                          </div>
                          <div className="text-white font-bold">
                            ${payload[0].value?.toLocaleString()}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Position History */}
        <div className="bg-[#2A2B2E] p-4 rounded-xl mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-gray-400">Position History</div>
            <div className="text-gray-400 text-sm flex items-center gap-1">
              <Clock className="h-4 w-4" /> Average Price: $
              {investment.averagePrice.toLocaleString()}
            </div>
          </div>
          <div className="space-y-3">
            {investment.positions.map((position, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm bg-[#353538] p-3 rounded-lg"
              >
                <div className="text-gray-300">{position.date}</div>
                <div className="text-gray-300">
                  {position.amount} {symbol}
                </div>
                <div className="text-white font-medium">
                  ${position.price.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Sentiment */}
        <div className="bg-[#2A2B2E] p-4 rounded-xl">
          <div className="text-gray-400 mb-3">Market Sentiment</div>
          <div className="flex items-center mb-2">
            <div className="w-full bg-[#353538] h-2 rounded-full overflow-hidden">
              <div
                className="bg-green-400 h-full"
                style={{ width: "65%" }}
              ></div>
            </div>
            <div className="ml-2 text-green-400 font-medium">65%</div>
          </div>
          <div className="flex justify-between text-xs">
            <div className="text-red-500">Bearish</div>
            <div className="text-green-400">Bullish</div>
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full h-12 text-base font-medium mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
          View All Transactions
        </Button>
      </CardContent>
    </Card>
  );
};

export default MyInvestment;
