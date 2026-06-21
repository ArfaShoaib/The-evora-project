"use client";

import * as React from "react";

interface CountdownTimerProps {
  endDate: Date;
}

export function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0 });

  React.useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const diff = endDate.getTime() - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      });
    };

    calculate();
    const timer = setInterval(calculate, 60000);
    return () => clearInterval(timer);
  }, [endDate]);

  const blocks = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Mins" },
  ];

  return (
    <div className="flex items-center gap-4">
      {blocks.map((block, i) => (
        <React.Fragment key={block.label}>
          <div className="flex flex-col items-center">
            <span className="text-3xl md:text-4xl font-bold text-gold tabular-nums">
              {String(block.value).padStart(2, "0")}
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">
              {block.label}
            </span>
          </div>
          {i < blocks.length - 1 && (
            <span className="text-2xl font-bold text-gold/40 -mt-4">:</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}