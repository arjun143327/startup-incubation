import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="space-y-1">
      {label ? (
        <label className="block text-sm font-medium text-neutral-300">{label}</label>
      ) : null}
      <input
        className={[
          'w-full px-4 py-3 bg-neutral-950/50 border border-neutral-800 rounded-xl text-white placeholder-neutral-600',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all',
          className,
        ].join(' ')}
        {...props}
      />
      {error ? <div className="text-xs text-red-400">{error}</div> : null}
    </div>
  );
};

export default Input;

