"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThinkingDots } from "@/components/ui/thinking-dots";

export default function ThinkingMessage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", "items-start")}
    >
      <div className={cn("flex flex-col gap-2", "items-start")}>
        <div
          className={cn(
            "rounded-lg px-4 py-2 max-w-[80%]",
            "bg-secondary text-secondary-foreground"
          )}
        >
          <div className="flex items-center">
            <span className="text-sm">Thinking</span>
            <ThinkingDots />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
