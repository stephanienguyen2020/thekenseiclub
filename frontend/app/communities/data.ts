import type { FeedItem } from "./types"

export const mockFeedItems: FeedItem[] = [
  {
    id: "1",
    type: "bets",
    author: {
      name: "Alex Thompson",
      avatar: "/placeholder.svg",
    },
    content: "Just created a new prediction market! What do you think about the odds?",
    timestamp: "2025-02-22T15:30:00Z",
    likes: 24,
    comments: 8,
    linkedItem: {
      title: "Will Bitcoin reach $100,000 by end of Q2 2025?",
      description: "Total Pool: $250,000 • Yes: 60% • No: 40%",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-22%20at%2023.21.20-mKXeebWUsUBtmoISgvglG97u44D3uK.png",
    },
  },
  {
    id: "2",
    type: "discussions",
    author: {
      name: "Sarah Chen",
      avatar: "/placeholder.svg",
    },
    content: "The correlation between meme coin pumps and Elon's tweets is insane! Check out this chart I made 📈",
    timestamp: "2025-02-22T14:45:00Z",
    likes: 156,
    comments: 32,
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/meme-correlation-qwerI5QhgBXpTWEhvI7I5qXXtfIUE.webp",
  },
  {
    id: "3",
    type: "coins",
    author: {
      name: "Mike Rodriguez",
      avatar: "/placeholder.svg",
    },
    content: "Excited to announce the launch of $PEPE2! The next generation of meme coins is here 🚀",
    timestamp: "2025-02-22T13:15:00Z",
    likes: 89,
    comments: 15,
    linkedItem: {
      title: "$PEPE2",
      description: "Initial Supply: 1T • Liquidity: 80% locked • Launch Price: $0.0000001",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pepe-coin-K0rIxgwI4Ib7qPEfGvI5kzxcRJmwxn.webp",
    },
  },
  {
    id: "4",
    type: "discussions",
    author: {
      name: "Emma Wilson",
      avatar: "/placeholder.svg",
    },
    content:
      "Anyone else noticing the pattern in AI-related token launches? Seems like every other day there's a new one claiming to revolutionize the space 🤔",
    timestamp: "2025-02-22T12:30:00Z",
    likes: 45,
    comments: 23,
  },
  {
    id: "5",
    type: "bets",
    author: {
      name: "David Kim",
      avatar: "/placeholder.svg",
    },
    content: "Created a prediction market for the upcoming Ethereum upgrade. Big implications if it goes through!",
    timestamp: "2025-02-22T11:45:00Z",
    likes: 67,
    comments: 12,
    linkedItem: {
      title: "Will ETH 2.0 Phase 2 launch before July 2025?",
      description: "Total Pool: $500,000 • Yes: 75% • No: 25%",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/eth-upgrade-4K3e6I5QhgBXpTWEhvI7I5qXXtfIUE.webp",
    },
  },
  {
    id: "6",
    type: "coins",
    author: {
      name: "Lisa Anderson",
      avatar: "/placeholder.svg",
    },
    content: "Introducing $DEGEN - The first token that automatically buys the dip! 📈",
    timestamp: "2025-02-22T10:00:00Z",
    likes: 134,
    comments: 28,
    linkedItem: {
      title: "$DEGEN",
      description: "Auto-buy mechanism • 5% rewards • 2% burn",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/degen-token-9CtIVDwF31CgvHZCL8GwzySvDqZBkk.webp",
    },
  },
]

