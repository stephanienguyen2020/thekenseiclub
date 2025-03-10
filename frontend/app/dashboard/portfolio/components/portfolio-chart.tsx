"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import { useState } from "react";

// Enhanced data with multiple metrics
const data = [
  { date: "Jan", value: 100000, profit: 0, volume: 25000 },
  { date: "Feb", value: 120000, profit: 20000, volume: 35000 },
  { date: "Mar", value: 115000, profit: -5000, volume: 28000 },
  { date: "Apr", value: 130000, profit: 15000, volume: 42000 },
  { date: "May", value: 145000, profit: 15000, volume: 38000 },
  { date: "Jun", value: 140000, profit: -5000, volume: 30000 },
  { date: "Jul", value: 160000, profit: 20000, volume: 45000 },
  { date: "Aug", value: 155000, profit: -5000, volume: 32000 },
  { date: "Sep", value: 170000, profit: 15000, volume: 48000 },
  { date: "Oct", value: 180000, profit: 10000, volume: 52000 },
  { date: "Nov", value: 175000, profit: -5000, volume: 40000 },
  { date: "Dec", value: 190000, profit: 15000, volume: 58000 },
];

export function PortfolioChart() {
  const [chartType, setChartType] = useState("value");
  const [timeframe, setTimeframe] = useState("1M");

  // Custom tooltip formatter
  const formatTooltip = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <Card className="border-white/10 bg-black/60 backdrop-blur-xl h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Portfolio Performance</CardTitle>
            <CardDescription>
              Track your portfolio value over time
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Tabs
              defaultValue="value"
              className="w-[180px]"
              onValueChange={setChartType}
            >
              <TabsList>
                <TabsTrigger value="value">Value</TabsTrigger>
                <TabsTrigger value="pl">P/L</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select defaultValue="1M" onValueChange={setTimeframe}>
              <SelectTrigger className="w-[80px]">
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
      <CardContent className="flex-1 p-0 pb-4 px-4">
        <div className="h-full min-h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "value" ? (
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ff00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#333"
                  vertical={false}
                />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" tickFormatter={formatTooltip} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(0,255,0,0.2)",
                    borderRadius: "6px",
                  }}
                  formatter={formatTooltip}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#00ff00"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  activeDot={{ r: 8, strokeWidth: 0, fill: "#fff" }}
                />
              </AreaChart>
            ) : (
              <LineChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#333"
                  vertical={false}
                />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" tickFormatter={formatTooltip} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(0,255,0,0.2)",
                    borderRadius: "6px",
                  }}
                  formatter={formatTooltip}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#00ff00"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 8, strokeWidth: 0, fill: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#3b82f6" }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
