import React from 'react';

const Button = ({ variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary:
      'bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/25',
    secondary: 'bg-neutral-700 hover:bg-neutral-600 text-neutral-100',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg hover:shadow-red-500/25',
    ghost: 'bg-transparent hover:bg-neutral-800 text-neutral-200',
  };

  return (
    <button
      className={[
        'px-5 py-2.5 rounded-xl font-medium transition-all',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant] ?? variants.primary,
        className,
      ].join(' ')}
      {...props}
    />
  );
};

export default Button;

