import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeAgo(timestamp: string): string {
  return dayjs(timestamp).fromNow()
}

// Define the available tribes
export const TRIBES = {
  CANINE_CLANS: "canine_clans",
  FELINE_SYNDICATES: "feline_syndicates",
  AQUATIC_ORDERS: "aquatic_orders",
  WILDCARDS: "wildcards",
} as const;

export type TribeType = (typeof TRIBES)[keyof typeof TRIBES];

// Tribe metadata for UI display
export const TRIBE_METADATA = {
  [TRIBES.CANINE_CLANS]: {
    name: "Canine Clans",
    description: "Dog coins coordinate from the Kennel Council",
    emoji: "🐕",
    council: "Kennel Council",
  },
  [TRIBES.FELINE_SYNDICATES]: {
    name: "Feline Syndicates",
    description: "Cat tokens organize in the Litterbox Syndicate",
    emoji: "🐱",
    council: "Litterbox Syndicate",
  },
  [TRIBES.AQUATIC_ORDERS]: {
    name: "Aquatic Orders",
    description: "Degen fish make waves from The Reef",
    emoji: "🐠",
    council: "The Reef",
  },
  [TRIBES.WILDCARDS]: {
    name: "Wildcards",
    description: "Unique tokens that march to their own beat",
    emoji: "🃏",
    council: "Wild Assembly",
  },
};