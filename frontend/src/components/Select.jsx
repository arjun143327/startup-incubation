import React from 'react';

const Select = ({ label, error, className = '', options = [], ...props }) => {
  return (
    <div className="space-y-1">
      {label ? <label className="block text-sm font-medium text-neutral-300">{label}</label> : null}
      <select
        className={[
          'w-full px-4 py-3 bg-neutral-950/50 border border-neutral-800 rounded-xl text-white',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all',
          className,
        ].join(' ')}
        {...props}
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <div className="text-xs text-red-400">{error}</div> : null}
    </div>
  );
};

export default Select;

