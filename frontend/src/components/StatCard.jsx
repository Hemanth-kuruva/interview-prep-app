import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'emerald' }) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      gradient: 'from-emerald-500/20 to-transparent',
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      gradient: 'from-blue-500/20 to-transparent',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
      gradient: 'from-purple-500/20 to-transparent',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      gradient: 'from-amber-500/20 to-transparent',
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      gradient: 'from-rose-500/20 to-transparent',
    },
  };

  const currentTheme = colorMap[color] || colorMap.emerald;

  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 bg-slate-900/80 border ${currentTheme.border} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${currentTheme.gradient} rounded-bl-full pointer-events-none opacity-50`} />
      
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${currentTheme.bg} ${currentTheme.text} border ${currentTheme.border}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-3xl font-extrabold text-white tracking-tight">{value}</div>
        {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}
