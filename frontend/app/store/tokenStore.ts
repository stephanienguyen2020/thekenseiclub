import { create } from "zustand";

export interface Token {
  id: string;
  name: string;
  symbol: string;
  imageUrl: string;
  description: string;
  price: string;
  priceChange: number;
  marketCap: string;
  holders: string;
  volume24h: string;
  launchDate: string;
  chain: string;
  status: "active" | "paused";
  fundingRaised: string;
}

interface TokenStore {
  tokens: Token[];
  addToken: (token: Token) => void;
  updateToken: (id: string, token: Partial<Token>) => void;
  removeToken: (id: string) => void;
}

export const useTokenStore = create<TokenStore>((set) => ({
  tokens: [],
  addToken: (token) => set((state) => ({ tokens: [...state.tokens, token] })),
  updateToken: (id, updatedToken) =>
    set((state) => ({
      tokens: state.tokens.map((token) =>
        token.id === id ? { ...token, ...updatedToken } : token
      ),
    })),
  removeToken: (id) =>
    set((state) => ({
      tokens: state.tokens.filter((token) => token.id !== id),
    })),
}));
