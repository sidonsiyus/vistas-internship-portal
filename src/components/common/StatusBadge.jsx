import React from 'react';

export default function StatusBadge({ status, size = 'normal' }) {
  const getBadgeConfig = () => {
    switch (status) {
      case 'AVAILABLE':
        return { label: 'AVAILABLE', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' };
      case 'ON_BREAK':
        return { label: 'ON BREAK', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' };
      case 'UNAVAILABLE':
        return { label: 'UNAVAILABLE', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30', dot: 'bg-rose-400' };
      case 'BOOKED':
      case 'WAITING':
        return { label: 'WAITING', bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' };
      case 'CALLED':
        return { label: 'CALLED', bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30 animate-pulse', dot: 'bg-orange-400' };
      case 'IN_PROGRESS':
        return { label: 'CURRENTLY MEETING', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30', dot: 'bg-blue-400' };
      case 'COMPLETED':
        return { label: 'COMPLETED', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' };
      case 'NO_SHOW':
        return { label: 'NO SHOW', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30', dot: 'bg-rose-400' };
      case 'CANCELLED':
        return { label: 'CANCELLED', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30', dot: 'bg-slate-400' };
      default:
        return { label: status, bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30', dot: 'bg-slate-400' };
    }
  };

  const config = getBadgeConfig();
  const sizeClasses = size === 'large' ? 'px-3.5 py-1.5 text-sm font-semibold' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses}`}>
      <span className={`h-2 w-2 rounded-full ${config.dot} live-pulse`} />
      {config.label}
    </span>
  );
}
