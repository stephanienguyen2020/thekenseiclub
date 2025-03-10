"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqItems = [
  {
    question: "What are meme coins?",
    answer:
      "Meme coins are cryptocurrencies inspired by internet memes, often created as jokes but some gaining serious value. They're part of the altcoin family, alternatives to Bitcoin.",
  },
  {
    question: "How to find new meme coins?",
    answer:
      "Explore our comprehensive table of meme coins, updated regularly with the latest additions. Remember to DYOR (Do Your Own Research) before investing.",
  },
  {
    question: "How to buy meme coins",
    answer:
      "Get a digital wallet, find an exchange that lists your chosen meme coin, create an account, deposit funds, and make your purchase. Always verify the contract address.",
  },
  {
    question: "Are meme coins really gambling?",
    answer:
      "Meme coins are highly volatile investments. While some have generated significant returns, they carry substantial risk. Never invest more than you can afford to lose.",
  },
];

export function AboutMemes() {
  const [openItem, setOpenItem] = useState<number | null>(null);

  return (
    <Card className="border-green-500/20 bg-black/60 backdrop-blur-xl">
      <CardContent className="p-6">
        <h1 className="text-4xl font-bold pb-4">
          About
          <span className="text-blue-400"> Memes</span>
        </h1>
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="border-b border-green-500/10 last:border-0 pb-4 last:pb-0"
            >
              <button
                className="flex items-center justify-between w-full text-left"
                onClick={() => setOpenItem(openItem === index ? null : index)}
              >
                <span className="text-sm font-medium">{item.question}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    openItem === index ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              {openItem === index && (
                <p className="mt-2 text-sm text-gray-400">{item.answer}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
