import { create } from "zustand";
import type { Message } from "@/types/chat";

interface ChatState {
  messages: Message[];
  isThinking: boolean;
  addMessage: (message: Message) => void;
  addMessages: (messages: Message[]) => void;
  clearMessages: () => void;
  setIsThinking: (isThinking: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isThinking: false,
  addMessage: (message: Message) =>
    set((state: ChatState) => ({
      messages: [...state.messages, message],
    })),
  addMessages: (newMessages: Message[]) =>
    set((state: ChatState) => ({
      messages: [...state.messages, ...newMessages],
    })),
  clearMessages: () => set({ messages: [] }),
  setIsThinking: (isThinking: boolean) => set({ isThinking }),
}));
