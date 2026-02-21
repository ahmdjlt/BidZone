"use client";

// CountdownTimer - shows remaining time for an auction with live countdown
import { useEffect, useState } from "react";

interface CountdownTimerProps {
  endTime: string; // ISO timestamp, e.g. "2026-02-21T18:00:00Z"
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
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          Auction ended
        </p>
        <p className="mt-2 text-lg font-semibold text-slate-400">00 : 00 : 00</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-4 transition-colors duration-500 ${isUrgent
          ? "border-red-200 bg-red-50/70"
          : "border-blue-100 bg-blue-50/70"
        }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <p
          className={`text-xs font-semibold uppercase tracking-[0.14em] ${isUrgent ? "text-red-600" : "text-blue-700"
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
      className={`flex min-w-[3.2rem] flex-col items-center rounded-xl border px-3 py-2 ${urgent
          ? "border-red-200 bg-white shadow-[0_8px_24px_-12px_rgba(220,38,38,0.35)]"
          : "border-blue-100 bg-white shadow-[0_8px_24px_-12px_rgba(27,111,242,0.3)]"
        }`}
    >
      <span
        className={`text-2xl font-semibold tabular-nums tracking-tight ${urgent ? "text-red-700" : "text-blue-950"
          }`}
      >
        {pad(value)}
      </span>
      <span
        className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${urgent ? "text-red-400" : "text-blue-400"
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
      className={`text-lg font-bold ${urgent ? "text-red-300" : "text-blue-300"}`}
    >
      :
    </span>
  );
}
