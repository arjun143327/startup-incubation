import React from 'react';

const Card = ({ className = '', children }) => {
  return (
    <div
      className={[
        'bg-neutral-800/50 border border-neutral-700/50 rounded-2xl shadow-2xl',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
};

export default Card;

