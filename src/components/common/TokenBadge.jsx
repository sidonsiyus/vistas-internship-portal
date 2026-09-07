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
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10';
      case 'amber':
        return 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10';
      case 'orange':
        return 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-xl shadow-orange-500/20 animate-pulse';
      case 'slate':
        return 'bg-slate-800 text-slate-300 border border-slate-700';
      default:
        return 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-lg shadow-blue-600/20';
    }
  };

  const displayToken = tokenNumber || 'INT-...';

  return (
    <span className={`inline-block text-center ${getSizeStyle()} ${getVariantStyle()}`}>
      {displayToken}
    </span>
  );
}
