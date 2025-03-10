"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ChatbotWindow from "./ChatbotWindow";
import { usePathname } from "next/navigation";

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Don't show the button on the chatbot page
  if (pathname === "/chatbot") {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[400px] h-[600px] shadow-xl rounded-xl overflow-hidden"
          >
            <ChatbotWindow onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
