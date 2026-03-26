import React from 'react';

const Button = ({ variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary:
      'bg-[linear-gradient(135deg,#0ea5e9,#6366f1)] text-white shadow-[0_12px_36px_rgba(14,165,233,0.28)] hover:shadow-[0_18px_44px_rgba(14,165,233,0.38)]',
    secondary: 'surface-soft text-slate-100 hover:bg-white/8',
    danger: 'bg-[linear-gradient(135deg,#ef4444,#f97316)] text-white shadow-[0_12px_36px_rgba(239,68,68,0.24)] hover:shadow-[0_18px_44px_rgba(239,68,68,0.32)]',
    ghost: 'bg-transparent hover:bg-white/5 text-slate-200 border border-white/10',
  };

  return (
    <button
      className={[
        'px-5 py-2.5 rounded-2xl font-medium transition-all duration-200 hover:-translate-y-0.5',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant] ?? variants.primary,
        className,
      ].join(' ')}
      {...props}
    />
  );
};

export default Button;
