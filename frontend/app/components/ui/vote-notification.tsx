"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface VoteNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  duration?: number;
}

export function VoteNotification({
  isOpen,
  onClose,
  message,
  duration = 5000,
}: VoteNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);

      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 300); // Animation duration

      return () => clearTimeout(timeout);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen && !isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div
        className={`
          bg-[#3b82f6] border-4 border-black rounded-xl p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
          transform transition-all duration-300 pointer-events-auto
          ${isOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}
        `}
      >
        <div className="flex items-start gap-3">
          <div className="bg-[#c0ff00] rounded-full p-2 border-2 border-black">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
              <path d="m15 9-6 6"></path>
              <path d="m9 9 6 6"></path>
            </svg>
          </div>
          <div className="flex-1 pr-8">
            <p className="text-white font-bold text-lg">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="absolute right-3 top-3 bg-black rounded-full p-1 text-white hover:bg-gray-800 transition-colors"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
