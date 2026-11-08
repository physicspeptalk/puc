/**
 * CountdownTimer.tsx
 *
 * Examination countdown timer with visual status indicators:
 *   - Normal (blue/slate)
 *   - Warning under 5 minutes (amber)
 *   - Critical under 60 seconds (red pulsing)
 *   - Auto-triggers onExpire when reaching 00:00
 */

import React, { useEffect, useState, useRef } from "react";
import { formatTime } from "../../utils/testUtils";

interface CountdownTimerProps {
  initialSeconds: number;
  onExpire: () => void;
  onTick?: (remaining: number) => void;
  paused?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialSeconds,
  onExpire,
  onTick,
  paused = false,
}) => {
  const [remaining, setRemaining] = useState(initialSeconds);
  const onExpireRef = useRef(onExpire);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (onTickRef.current) {
          onTickRef.current(Math.max(0, next));
        }

        if (next <= 0) {
          clearInterval(interval);
          onExpireRef.current();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [paused]);

  const isCritical = remaining > 0 && remaining <= 60;
  const isWarning = remaining > 60 && remaining <= 300; // < 5 mins

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-sm font-bold border transition-colors ${
        isCritical
          ? "bg-rose-50 text-rose-700 border-rose-300 animate-pulse"
          : isWarning
          ? "bg-amber-50 text-amber-800 border-amber-300"
          : "bg-blue-50 text-[#0056D2] border-blue-200"
      }`}
      role="timer"
      aria-live="polite"
      aria-label={`Time remaining: ${formatTime(remaining)}`}
    >
      <svg
        className={`w-4 h-4 ${isCritical ? "text-rose-600 animate-spin" : isWarning ? "text-amber-600" : "text-[#0056D2]"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
      </svg>
      <span>{formatTime(remaining)}</span>
    </div>
  );
};

export default CountdownTimer;
