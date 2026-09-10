import React from 'react';

export default function StatusBadge({ status, size = 'normal' }) {
  const getBadgeConfig = () => {
    switch (status) {
      case 'AVAILABLE':
        return { label: 'AVAILABLE', bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' };
      case 'ON_BREAK':
        return { label: 'ON BREAK', bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' };
      case 'UNAVAILABLE':
        return { label: 'UNAVAILABLE', bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800', dot: 'bg-rose-500' };
      case 'BOOKED':
      case 'WAITING':
        return { label: 'WAITING', bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' };
      case 'CALLED':
        return { label: 'CALLED', bg: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 animate-pulse', dot: 'bg-orange-500' };
      case 'IN_PROGRESS':
        return { label: 'CURRENTLY MEETING', bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800', dot: 'bg-blue-600 dark:bg-blue-400' };
      case 'COMPLETED':
        return { label: 'COMPLETED', bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' };
      case 'NO_SHOW':
        return { label: 'NO SHOW', bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800', dot: 'bg-rose-500' };
      case 'CANCELLED':
        return { label: 'CANCELLED', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700', dot: 'bg-slate-400' };
      default:
        return { label: status, bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700', dot: 'bg-slate-400' };
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
