export interface Author {
  name: string
  avatar: string
}

export interface LinkedItem {
  title: string
  description: string
  image?: string
}

export interface FeedItem {
  id: string
  type: "discussions" | "bets" | "coins"
  author: Author
  content: string
  timestamp: string
  likes: number
  comments: number
  image?: string
  linkedItem?: LinkedItem
}

