"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { BarChart2, Download, Filter, Calendar, MessageSquare, Users, TrendingUp, Activity, Search } from "lucide-react"

// Sample data for charts
const engagementData = [
  { date: "Mon", tweets: 45, replies: 28, impressions: 1200 },
  { date: "Tue", tweets: 52, replies: 34, impressions: 1500 },
  { date: "Wed", tweets: 38, replies: 25, impressions: 1100 },
  { date: "Thu", tweets: 65, replies: 45, impressions: 1800 },
  { date: "Fri", tweets: 48, replies: 36, impressions: 1400 },
  { date: "Sat", tweets: 42, replies: 28, impressions: 1300 },
  { date: "Sun", tweets: 58, replies: 42, impressions: 1600 },
]

const sentimentData = [
  { date: "Mon", positive: 75, neutral: 20, negative: 5 },
  { date: "Tue", positive: 68, neutral: 25, negative: 7 },
  { date: "Wed", positive: 72, neutral: 18, negative: 10 },
  { date: "Thu", positive: 80, neutral: 15, negative: 5 },
  { date: "Fri", positive: 65, neutral: 28, negative: 7 },
  { date: "Sat", positive: 70, neutral: 22, negative: 8 },
  { date: "Sun", positive: 78, neutral: 17, negative: 5 },
]

const activityLogs = [
  {
    id: "1",
    type: "tweet",
    content: "Automated tweet about market analysis sent",
    timestamp: "2 min ago",
    status: "success",
  },
  {
    id: "2",
    type: "reply",
    content: "AI response to FUD comment generated",
    timestamp: "5 min ago",
    status: "success",
  },
  {
    id: "3",
    type: "alert",
    content: "High negative sentiment detected in thread",
    timestamp: "10 min ago",
    status: "warning",
  },
  {
    id: "4",
    type: "system",
    content: "Rate limit threshold reached - cooldown initiated",
    timestamp: "15 min ago",
    status: "error",
  },
  {
    id: "5",
    type: "tweet",
    content: "Scheduled meme post published",
    timestamp: "20 min ago",
    status: "success",
  },
]

export function LogsAnalytics() {
  return (
    <div className="grid gap-6">
      {/* Filters and Export */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search logs..." />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Calendar className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            title: "Total Tweets",
            value: "348",
            change: "+12%",
            icon: MessageSquare,
          },
          {
            title: "Engagement Rate",
            value: "24.3%",
            change: "+4.2%",
            icon: Users,
          },
          {
            title: "Sentiment Score",
            value: "8.4/10",
            change: "+0.6",
            icon: TrendingUp,
          },
          {
            title: "Response Rate",
            value: "94%",
            change: "+2.5%",
            icon: Activity,
          },
        ].map((stat) => (
          <Card key={stat.title} className="border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <stat.icon className="h-4 w-4 text-sky-400" />
                <span className="text-sm font-medium">{stat.title}</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{stat.value}</span>
                <span className="text-sm text-green-500">{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Engagement Chart */}
        <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>Tweet performance and interactions</CardDescription>
              </div>
              <Select defaultValue="7d">
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementData}>
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
                  <Line type="monotone" dataKey="tweets" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="replies" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Chart */}
        <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sentiment Analysis</CardTitle>
                <CardDescription>Community sentiment distribution</CardDescription>
              </div>
              <Select defaultValue="7d">
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentData}>
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
                  <Bar dataKey="positive" fill="#22c55e" stackId="a" />
                  <Bar dataKey="neutral" fill="#3b82f6" stackId="a" />
                  <Bar dataKey="negative" fill="#ef4444" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Logs */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>Recent system activity and events</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  className={
                    log.status === "success"
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : log.status === "warning"
                        ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                  }
                >
                  {log.type}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm">{log.content}</p>
                  <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                </div>
                <Button variant="outline" size="sm">
                  Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

