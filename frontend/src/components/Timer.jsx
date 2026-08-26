import React, { useState, useEffect } from 'react';
import { Timer as TimerIcon, AlertCircle } from 'lucide-react';

export default function Timer({ initialSeconds, onExpire, isPaused = false }) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    setTimeLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isPaused, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLowTime = timeLeft <= 60;
  const isCritical = timeLeft <= 20;

  return (
    <div
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm tracking-wider transition-colors duration-200 ${
        isCritical
          ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
          : isLowTime
          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
          : 'bg-slate-800/80 text-emerald-400 border-emerald-500/30'
      }`}
    >
      {isCritical ? (
        <AlertCircle className="w-4 h-4 text-red-400 animate-bounce" />
      ) : (
        <TimerIcon className="w-4 h-4 text-brand-400" />
      )}
      <span>{formattedTime}</span>
    </div>
  );
}
