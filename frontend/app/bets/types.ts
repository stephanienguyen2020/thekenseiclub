export interface Bet {
  id: string
  title: string
  image: string
  category: string
  endDate: string
  totalPool: number
  yesPool: number
  noPool: number
  yesProbability: number
  noProbability: number
  isResolved?: boolean
  result?: "yes" | "no"
}

