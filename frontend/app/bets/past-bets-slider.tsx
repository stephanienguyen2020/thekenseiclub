"use client";

import Marquee from "react-fast-marquee";
import { BetCard } from "./bet-card";
import type { Bet } from "./types";

interface PastBetsSliderProps {
  bets: Bet[];
}

export function PastBetsSlider({ bets }: PastBetsSliderProps) {
  // Double the bets array to create a seamless loop
  const duplicatedBets = [...bets, ...bets];

  return (
    <Marquee
      gradient={false}
      speed={40}
      pauseOnHover={true}
      className="overflow-hidden"
    >
      <div className="flex gap-6">
        {duplicatedBets.map((bet, index) => (
          <div
            key={`${bet.id}-${index}`}
            className="flex-none w-[400px] h-full"
          >
            <BetCard bet={bet} />
          </div>
        ))}
      </div>
    </Marquee>
  );
}
