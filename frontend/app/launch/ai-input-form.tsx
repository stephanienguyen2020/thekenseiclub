"use client";

import type React from "react";

import { useState } from "react";
import { Bot, RefreshCcw, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import type { InputMethod } from "./input-method-selector";

interface AIInputFormProps {
  inputMethod: InputMethod;
  onGenerate: (input: string) => Promise<void>;
  isGenerating: boolean;
}

export function AIInputForm({
  inputMethod,
  onGenerate,
  isGenerating,
}: AIInputFormProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!input.trim()) {
      setError("Please enter some text");
      return;
    }

    try {
      await onGenerate(input);
    } catch (err) {
      setError("Failed to generate token details. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {inputMethod === "ai-joke" ? (
              <Bot className="w-5 h-5 text-primary" />
            ) : (
              <Wand2 className="w-5 h-5 text-primary" />
            )}
            <h3 className="font-medium">
              {inputMethod === "ai-joke"
                ? "Enter your meme idea or joke"
                : "Enter a tweet URL"}
            </h3>
          </div>

          {inputMethod === "ai-joke" ? (
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g., Trump got so mad he turned into a meme coin that only goes up when he tweets"
              className="min-h-[100px]"
            />
          ) : (
            <Input
              type="url"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://twitter.com/username/status/123456789"
            />
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isGenerating || !input.trim()}
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <RefreshCcw className="w-4 h-4 animate-spin" />
                Generating...
              </div>
            ) : (
              "Generate Token Details"
            )}
          </Button>
        </div>
      </Card>
    </form>
  );
}
