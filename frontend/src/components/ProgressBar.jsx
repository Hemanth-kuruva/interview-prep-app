import React from 'react';

export default function ProgressBar({ current, total, answeredCount = null }) {
  const percentage = Math.min(100, Math.round(((current + 1) / total) * 100));

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
        <span>
          Question <span className="text-white">{current + 1}</span> of <span className="text-white">{total}</span>
        </span>
        {answeredCount !== null && (
          <span>
            Answered: <span className="text-brand-400 font-bold">{answeredCount}/{total}</span>
          </span>
        )}
      </div>

      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
        <div
          className="bg-gradient-to-r from-brand-500 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out shadow-sm shadow-brand-500/50"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
