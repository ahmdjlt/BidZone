"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  endTime: string;
}

function calculateTimeLeft(endTime: string) {
  const difference = new Date(endTime).getTime() - Date.now();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, totalMs: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    expired: false,
    totalMs: difference,
  };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function CountdownTimer({ endTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  // Under 5 minutes → urgent styling
  const isUrgent = !timeLeft.expired && timeLeft.totalMs < 5 * 60 * 1000;

  if (timeLeft.expired) {
    return (
      <div className="rounded-2xl bg-surface-alt p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">
          Auction ended
        </p>
        <p className="mt-2 text-lg font-semibold text-text-muted">00 : 00 : 00</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl p-4 transition-colors duration-500 ${isUrgent
        ? "bg-red-50/70 dark:bg-red-950/30"
        : "bg-accent-soft/70"
        }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <p
          className={`text-xs font-semibold uppercase tracking-[0.14em] ${isUrgent ? "text-red-600 dark:text-red-400" : "text-text-label"
            }`}
        >
          {isUrgent ? "Ending soon!" : "Time remaining"}
        </p>
        {isUrgent && (
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-red-500" />
        )}
      </div>

      <div className="flex items-center justify-center gap-2">
        {timeLeft.days > 0 && (
          <>
            <TimeBlock value={timeLeft.days} label="days" urgent={isUrgent} />
            <Separator urgent={isUrgent} />
          </>
        )}
        <TimeBlock value={timeLeft.hours} label="hrs" urgent={isUrgent} />
        <Separator urgent={isUrgent} />
        <TimeBlock value={timeLeft.minutes} label="min" urgent={isUrgent} />
        <Separator urgent={isUrgent} />
        <TimeBlock value={timeLeft.seconds} label="sec" urgent={isUrgent} />
      </div>
    </div>
  );
}

function TimeBlock({
  value,
  label,
  urgent,
}: {
  value: number;
  label: string;
  urgent: boolean;
}) {
  return (
    <div
      className={`flex min-w-[3.2rem] flex-col items-center rounded-xl px-3 py-2 ${urgent
        ? "bg-card-bg shadow-[0_8px_24px_-12px_rgba(220,38,38,0.35)]"
        : "bg-card-bg shadow-[0_8px_24px_-12px_var(--card-shadow)]"
        }`}
    >
      <span
        className={`text-2xl font-semibold tabular-nums tracking-tight ${urgent ? "text-red-700 dark:text-red-400" : "text-text-heading"
          }`}
      >
        {pad(value)}
      </span>
      <span
        className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${urgent ? "text-red-400 dark:text-red-500" : "text-text-muted"
          }`}
      >
        {label}
      </span>
    </div>
  );
}

function Separator({ urgent }: { urgent: boolean }) {
  return (
    <span
      className={`text-lg font-bold ${urgent ? "text-red-300 dark:text-red-700" : "text-text-muted"}`}
    >
      :
    </span>
  );
}
