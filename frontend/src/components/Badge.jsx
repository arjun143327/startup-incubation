import React from 'react';

const Badge = ({ tone = 'neutral', className = '', children }) => {
  const tones = {
    neutral: 'bg-white/6 text-slate-200 border border-white/8',
    info: 'bg-sky-400/12 text-sky-300 border border-sky-400/20',
    success: 'bg-emerald-400/12 text-emerald-300 border border-emerald-400/20',
    warning: 'bg-amber-400/12 text-amber-200 border border-amber-400/20',
    danger: 'bg-rose-400/12 text-rose-300 border border-rose-400/20',
    purple: 'bg-indigo-400/12 text-indigo-300 border border-indigo-400/20',
  };

  return (
    <span
      className={[
        'px-3 py-1 text-[11px] font-semibold rounded-none',
        tones[tone] ?? tones.neutral,
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
};

export default Badge;
