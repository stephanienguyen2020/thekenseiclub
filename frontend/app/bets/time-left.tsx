"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);
dayjs.extend(duration);

export function TimeLeft({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = dayjs();
      const end = dayjs(endDate);
      const diff = end.diff(now);

      if (diff <= 0) {
        setTimeLeft("Ended");
        setIsUrgent(false);
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        return;
      }

      const durationObj = dayjs.duration(diff);
      const daysValue = Math.floor(durationObj.asDays());
      const hoursValue = durationObj.hours();
      const minutesValue = durationObj.minutes();
      const secondsValue = durationObj.seconds();

      // Update individual time components
      setDays(daysValue);
      setHours(hoursValue);
      setMinutes(minutesValue);
      setSeconds(secondsValue);

      // Set urgent flag if less than 24 hours left
      setIsUrgent(daysValue === 0);

      // Format the time left string
      if (daysValue > 0) {
        setTimeLeft(
          `${daysValue}d ${hoursValue}h ${minutesValue}m ${secondsValue}s`
        );
      } else if (hoursValue > 0) {
        setTimeLeft(`${hoursValue}h ${minutesValue}m ${secondsValue}s`);
      } else if (minutesValue > 0) {
        setTimeLeft(`${minutesValue}m ${secondsValue}s`);
      } else {
        setTimeLeft(`${secondsValue}s`);
      }
    };

    // Calculate immediately and then update every second
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000); // Update every second

    return () => clearInterval(timer);
  }, [endDate]);

  // Format the time components with leading zeros
  const formatTimeComponent = (value: number) => {
    return value < 10 ? `0${value}` : `${value}`;
  };

  if (timeLeft === "Ended") {
    return (
      <div className="flex items-center gap-1.5">
        <Clock className="h-4 w-4 text-red-500" />
        <span className="text-sm font-medium text-red-500">Ended</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Clock
        className={cn("h-4 w-4", isUrgent ? "text-red-400" : "text-green-400")}
      />
      <div className="flex items-center">
        {days > 0 && (
          <span
            className={cn(
              "text-sm font-medium",
              isUrgent ? "text-red-400" : "text-green-400"
            )}
          >
            {days}d:
          </span>
        )}
        <span
          className={cn(
            "text-sm font-medium",
            isUrgent ? "text-red-400" : "text-green-400"
          )}
        >
          {formatTimeComponent(hours)}h:
        </span>
        <span
          className={cn(
            "text-sm font-medium",
            isUrgent ? "text-red-400" : "text-green-400"
          )}
        >
          {formatTimeComponent(minutes)}m:
        </span>
        <span
          className={cn(
            "text-sm font-medium animate-pulse",
            isUrgent ? "text-red-400" : "text-green-400"
          )}
        >
          {formatTimeComponent(seconds)}s
        </span>
      </div>
    </div>
  );
}
