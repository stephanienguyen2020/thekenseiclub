export type UUID = string;

export interface Content {
  id: string;
  type: string;
  text: string;
  content: string;
  timestamp: number;
  attachments?: Attachment[];
}

export interface Attachment {
  url: string;
  contentType: string;
  title: string;
}

export type News = {
  author: string;
  content: string;
  description: string;
  publishedAt: string;
  source: { id: null; name: string };
  title: string;
  url: string;
  urlToImage: string;
  category?: string;
  summary?: string;
};

export interface SwapMessageContent {
  type: "swap";
  fromToken?: string;
  toToken?: string;
}

export interface Message {
  id: string;
  content: string | SwapMessageContent;
  isBot: boolean;
  timestamp: string;
  file?: {
    name: string;
    url: string;
    type: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}
