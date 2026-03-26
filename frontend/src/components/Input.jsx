import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="space-y-1">
      {label ? (
        <label className="field-label">{label}</label>
      ) : null}
      <input
        className={[
          'field-control',
          error ? 'is-error' : '',
          className,
        ].join(' ')}
        {...props}
      />
      {error ? <div className="text-xs text-rose-300">{error}</div> : null}
    </div>
  );
};

export default Input;
