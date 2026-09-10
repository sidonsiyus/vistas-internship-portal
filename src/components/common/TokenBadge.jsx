import React from 'react';

export default function TokenBadge({ tokenNumber, size = 'normal', variant = 'blue' }) {
  const getSizeStyle = () => {
    switch (size) {
      case 'giant':
        return 'text-5xl md:text-6xl tracking-widest px-6 py-4 rounded-2xl font-extrabold font-mono';
      case 'large':
        return 'text-2xl md:text-3xl tracking-wider px-4 py-2 rounded-xl font-bold font-mono';
      case 'small':
        return 'text-xs tracking-wide px-2 py-0.5 rounded-md font-bold font-mono';
      default:
        return 'text-lg tracking-wider px-3 py-1 rounded-lg font-bold font-mono';
    }
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'emerald':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-sm';
      case 'amber':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-sm';
      case 'orange':
        return 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 shadow-sm animate-pulse';
      case 'slate':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
      default:
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm';
    }
  };

  const displayToken = tokenNumber || 'INT-...';

  return (
    <span className={`inline-block text-center ${getSizeStyle()} ${getVariantStyle()}`}>
      {displayToken}
    </span>
  );
}
