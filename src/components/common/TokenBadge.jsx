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
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm';
      case 'orange':
        return 'bg-orange-50 text-orange-700 border border-orange-200 shadow-sm animate-pulse';
      case 'slate':
        return 'bg-slate-100 text-slate-700 border border-slate-200';
      default:
        return 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm';
    }
  };

  const displayToken = tokenNumber || 'INT-...';

  return (
    <span className={`inline-block text-center ${getSizeStyle()} ${getVariantStyle()}`}>
      {displayToken}
    </span>
  );
}
