"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Flag,
  AlertTriangle,
  Search,
  Filter,
  BarChart2,
  Clock,
} from "lucide-react"

const conversations = [
  {
    id: "1",
    user: {
      name: "Alex",
      avatar: "/placeholder.svg",
      handle: "@cryptoalex",
    },
    lastMessage: "When is the next big update coming? The roadmap looks promising! 🚀",
    timestamp: "2 min ago",
    status: "active",
    sentiment: "positive",
    replies: 3,
    priority: "medium",
  },
  {
    id: "2",
    user: {
      name: "Sarah",
      avatar: "/placeholder.svg",
      handle: "@sarahcrypto",
    },
    lastMessage: "This project seems like another rug pull. No real utility...",
    timestamp: "5 min ago",
    status: "flagged",
    sentiment: "negative",
    replies: 2,
    priority: "high",
  },
  {
    id: "3",
    user: {
      name: "Mike",
      avatar: "/placeholder.svg",
      handle: "@mikeonchain",
    },
    lastMessage: "Can someone explain the tokenomics? Looking to invest.",
    timestamp: "15 min ago",
    status: "pending",
    sentiment: "neutral",
    replies: 0,
    priority: "high",
  },
]

export function ConversationTracking() {
  return (
    <div className="grid gap-6">
      {/* Filters and Search */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search conversations..." />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Clock className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <BarChart2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Conversations */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>Active Conversations</CardTitle>
              <CardDescription>Monitor and manage ongoing discussions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="flagged">Flagged</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              {conversations.map((conversation) => (
                <Card key={conversation.id} className="border-white/10">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={conversation.user.avatar} />
                        <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{conversation.user.name}</span>
                          <span className="text-sm text-muted-foreground">{conversation.user.handle}</span>
                          <Badge
                            variant="outline"
                            className={
                              conversation.priority === "high"
                                ? "bg-red-500/10 text-red-500 border-red-500/20"
                                : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            }
                          >
                            {conversation.priority} priority
                          </Badge>
                        </div>
                        <p className="text-sm">{conversation.lastMessage}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{conversation.timestamp}</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" /> {conversation.replies} replies
                          </span>
                          {conversation.sentiment === "positive" && (
                            <span className="flex items-center gap-1 text-green-500">
                              <ThumbsUp className="h-4 w-4" /> Positive
                            </span>
                          )}
                          {conversation.sentiment === "negative" && (
                            <span className="flex items-center gap-1 text-red-500">
                              <ThumbsDown className="h-4 w-4" /> Negative
                            </span>
                          )}
                          {conversation.status === "flagged" && (
                            <span className="flex items-center gap-1 text-red-500">
                              <Flag className="h-4 w-4" /> Flagged
                            </span>
                          )}
                        </div>
                      </div>
                      <Button variant="outline">View Thread</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Alert Settings */}
      <Card className="border-white/10 bg-black/60 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-sky-400" />
            <div>
              <CardTitle>Alert Settings</CardTitle>
              <CardDescription>Configure notification preferences for conversations</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>High Priority Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified immediately for urgent conversations</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Negative Sentiment Tracking</Label>
                <p className="text-sm text-muted-foreground">Monitor and alert for negative discussions</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Keyword Alerts</Label>
                <p className="text-sm text-muted-foreground">Track specific keywords in conversations</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            title: "Active Threads",
            value: "23",
            change: "+5",
            icon: MessageSquare,
          },
          {
            title: "Response Rate",
            value: "94%",
            change: "+2.5%",
            icon: BarChart2,
          },
          {
            title: "Avg Response Time",
            value: "2.3m",
            change: "-30s",
            icon: Clock,
          },
          {
            title: "Sentiment Score",
            value: "8.4",
            change: "+0.6",
            icon: ThumbsUp,
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
                <span className={`text-sm ${stat.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

