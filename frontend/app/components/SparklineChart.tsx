"use client"

import { Area, AreaChart, ResponsiveContainer } from "recharts"

interface SparklineChartProps {
  data: number[]
  color: string
}

export function SparklineChart({ data, color }: SparklineChartProps) {
  // Convert data to format required by Recharts
  const chartData = data.map((value, index) => ({ value }))

  return (
    <ResponsiveContainer width={120} height={40}>
      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          fill={`url(#gradient-${color})`}
          strokeWidth={1.5}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

