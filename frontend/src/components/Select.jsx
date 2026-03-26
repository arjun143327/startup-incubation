import React from 'react';

const Select = ({ label, error, className = '', options = [], ...props }) => {
  return (
    <div className="space-y-1">
      {label ? <label className="field-label">{label}</label> : null}
      <select
        className={[
          'field-control',
          error ? 'is-error' : '',
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
      {error ? <div className="text-xs text-rose-300">{error}</div> : null}
    </div>
  );
};

export default Select;
