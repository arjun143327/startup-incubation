import React from 'react';

const Badge = ({ tone = 'neutral', className = '', children }) => {
  const tones = {
    neutral: 'bg-neutral-700/50 text-neutral-200',
    info: 'bg-blue-500/20 text-blue-300',
    success: 'bg-green-500/20 text-green-300',
    warning: 'bg-yellow-500/20 text-yellow-200',
    danger: 'bg-red-500/20 text-red-300',
    purple: 'bg-purple-500/20 text-purple-300',
  };

  return (
    <span
      className={[
        'px-3 py-1 text-xs font-semibold rounded-full',
        tones[tone] ?? tones.neutral,
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
};

export default Badge;

