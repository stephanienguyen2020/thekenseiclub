"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Repeat2, Heart, Eye, TrendingUp, BarChart2 } from "lucide-react"
import { motion } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "Mon", impressions: 2400, engagement: 400 },
  { name: "Tue", impressions: 1398, engagement: 300 },
  { name: "Wed", impressions: 9800, engagement: 1000 },
  { name: "Thu", impressions: 3908, engagement: 500 },
  { name: "Fri", impressions: 4800, engagement: 600 },
  { name: "Sat", impressions: 3800, engagement: 400 },
  { name: "Sun", impressions: 4300, engagement: 450 },
]

const recentTweets = [
  {
    id: "1",
    content: "🚀 $PEPE just hit a new ATH! Our AI predicted this pump 3 days ago. WAGMI! 🐸 #PepeCoin #Crypto",
    timestamp: "2h ago",
    metrics: {
      likes: 245,
      retweets: 89,
      replies: 32,
      impressions: 12500,
    },
  },
  {
    id: "2",
    content: "Why $DOGE is still the king of meme coins 👑 \n\nThread 🧵",
    timestamp: "5h ago",
    metrics: {
      likes: 189,
      retweets: 67,
      replies: 28,
      impressions: 9800,
    },
  },
  {
    id: "3",
    content: "📊 Market Analysis: Meme coins are showing strong momentum. Here's what our AI detected:",
    timestamp: "8h ago",
    metrics: {
      likes: 156,
      retweets: 45,
      replies: 19,
      impressions: 7300,
    },
  },
]

const trendingTopics = [
  { topic: "#PepeCoin", sentiment: "bullish", volume: "+127%" },
  { topic: "#DOGE", sentiment: "neutral", volume: "+23%" },
  { topic: "#SHIB", sentiment: "bullish", volume: "+89%" },
  { topic: "#FLOKI", sentiment: "bearish", volume: "-12%" },
]

const activeConversations = [
  {
    id: "1",
    user: {
      name: "Alex",
      avatar: "/placeholder.svg",
    },
    lastMessage: "What's your price target for $PEPE?",
    responses: 3,
    sentiment: "positive",
  },
  {
    id: "2",
    user: {
      name: "Sarah",
      avatar: "/placeholder.svg",
    },
    lastMessage: "This is just another pump and dump...",
    responses: 2,
    sentiment: "negative",
  },
  {
    id: "3",
    user: {
      name: "Mike",
      avatar: "/placeholder.svg",
    },
    lastMessage: "When is the next big update?",
    responses: 1,
    sentiment: "neutral",
  },
]

export function DashboardOverview() {
  return (
    <div className="grid gap-6">
      {/* Metrics Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Impressions",
            value: "847.5K",
            change: "+12.5%",
            icon: Eye,
          },
          {
            title: "Engagement Rate",
            value: "24.3%",
            change: "+4.3%",
            icon: BarChart2,
          },
          {
            title: "Active Conversations",
            value: "23",
            change: "+2",
            icon: MessageCircle,
          },
          {
            title: "Trending Topics",
            value: "12",
            change: "+3",
            icon: TrendingUp,
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">{metric.change}</span> from last week
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Main Chart */}
        <Card className="col-span-4 border-white/10 bg-black/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Tweet impressions and engagement over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#000",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "6px",
                    }}
                  />
                  <Line type="monotone" dataKey="impressions" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="engagement" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity and Trending */}
        <Card className="col-span-3 border-white/10 bg-black/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest tweets and trending topics</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tweets" className="space-y-4">
              <TabsList>
                <TabsTrigger value="tweets">Recent Tweets</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
              </TabsList>
              <TabsContent value="tweets" className="space-y-4">
                {recentTweets.map((tweet) => (
                  <div key={tweet.id} className="space-y-2">
                    <p className="text-sm">{tweet.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" /> {tweet.metrics.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Repeat2 className="h-4 w-4" /> {tweet.metrics.retweets}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" /> {tweet.metrics.replies}
                      </span>
                      <span className="text-xs">{tweet.timestamp}</span>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="trending" className="space-y-4">
                {trendingTopics.map((topic) => (
                  <div key={topic.topic} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{topic.topic}</span>
                      <Badge
                        variant="outline"
                        className={
                          topic.sentiment === "bullish"
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : topic.sentiment === "bearish"
                              ? "bg-red-500/10 text-red-500 border-red-500/20"
                              : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                        }
                      >
                        {topic.sentiment}
                      </Badge>
                    </div>
                    <span className={topic.volume.startsWith("+") ? "text-green-500" : "text-red-500"}>
                      {topic.volume}
                    </span>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Active Conversations */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Active Conversations</CardTitle>
          <CardDescription>Ongoing discussions requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {activeConversations.map((conversation) => (
              <Card key={conversation.id} className="border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={conversation.user.avatar} />
                      <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">{conversation.user.name}</h4>
                      <p className="text-sm text-muted-foreground">{conversation.lastMessage}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            conversation.sentiment === "positive"
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : conversation.sentiment === "negative"
                                ? "bg-red-500/10 text-red-500 border-red-500/20"
                                : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          }
                        >
                          {conversation.sentiment}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{conversation.responses} responses</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button className="w-full" variant="outline">
                      View Conversation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

