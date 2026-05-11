"use client";

import { useEffect, useState } from "react";

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calcRemaining(endDate: Date | string): CountdownResult {
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  const diff = end.getTime() - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isExpired: false,
  };
}

export function useCountdown(endDate: Date | string): CountdownResult {
  const [remaining, setRemaining] = useState(() => calcRemaining(endDate));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemaining(calcRemaining(endDate));
    const id = setInterval(() => {
      const r = calcRemaining(endDate);
      setRemaining(r);
      if (r.isExpired) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return remaining;
}
