// Define the available tribes (matching backend)
export const TRIBES = {
  CANINE_CLANS: "canine_clans",
  FELINE_SYNDICATES: "feline_syndicates",
  AQUATIC_ORDERS: "aquatic_orders",
  WILDCARDS: "wildcards",
} as const;

// Tribe metadata for UI display
export const TRIBE_METADATA = {
  [TRIBES.CANINE_CLANS]: {
    name: "Canine Clans",
    emoji: "🐕",
  },
  [TRIBES.FELINE_SYNDICATES]: {
    name: "Feline Syndicates",
    emoji: "🐱",
  },
  [TRIBES.AQUATIC_ORDERS]: {
    name: "Aquatic Orders",
    emoji: "🐠",
  },
  [TRIBES.WILDCARDS]: {
    name: "Wildcards",
    emoji: "🃏",
  },
};

// Tribe options for dropdown
export const TRIBE_OPTIONS = [
  { value: "all", label: "All Tribes", emoji: "🌟" },
  {
    value: TRIBES.CANINE_CLANS,
    label: TRIBE_METADATA[TRIBES.CANINE_CLANS].name,
    emoji: TRIBE_METADATA[TRIBES.CANINE_CLANS].emoji,
  },
  {
    value: TRIBES.FELINE_SYNDICATES,
    label: TRIBE_METADATA[TRIBES.FELINE_SYNDICATES].name,
    emoji: TRIBE_METADATA[TRIBES.FELINE_SYNDICATES].emoji,
  },
  {
    value: TRIBES.AQUATIC_ORDERS,
    label: TRIBE_METADATA[TRIBES.AQUATIC_ORDERS].name,
    emoji: TRIBE_METADATA[TRIBES.AQUATIC_ORDERS].emoji,
  },
  {
    value: TRIBES.WILDCARDS,
    label: TRIBE_METADATA[TRIBES.WILDCARDS].name,
    emoji: TRIBE_METADATA[TRIBES.WILDCARDS].emoji,
  },
];
