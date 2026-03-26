import React from 'react';

const variantStyles = {
  primary: {
    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 12px 36px rgba(14,165,233,0.28)',
  },
  secondary: {
    background: 'rgba(255,255,255,0.04)',
    color: '#e2e8f0',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: 'none',
  },
  danger: {
    background: 'linear-gradient(135deg, #ef4444, #f97316)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 12px 36px rgba(239,68,68,0.24)',
  },
  ghost: {
    background: 'rgba(255,255,255,0.06)',
    color: '#cbd5e1',
    border: '1px solid rgba(255,255,255,0.12)',
    boxShadow: 'none',
  },
  green: {
    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 12px 36px rgba(22,163,74,0.28)',
  },
};

const Button = ({ variant = 'primary', className = '', style = {}, ...props }) => {
  const vStyles = variantStyles[variant] ?? variantStyles.primary;

  return (
    <button
      style={{
        padding: '0.625rem 1.25rem',
        borderRadius: '0.75rem',
        fontWeight: 600,
        fontSize: '0.875rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        letterSpacing: '0.01em',
        ...vStyles,
        ...style,
        ...(props.disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
      }}
      className={className}
      onMouseEnter={(e) => {
        if (!props.disabled) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.filter = 'brightness(1.1)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.filter = 'brightness(1)';
      }}
      {...props}
    />
  );
};

export default Button;
