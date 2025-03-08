import React, { useEffect, useState } from "react";

export function ThinkingDots() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 300); // Faster animation

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block ml-1 min-w-[20px] text-blue-400 font-bold">
      {dots}
    </span>
  );
}
