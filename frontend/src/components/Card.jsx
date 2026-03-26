import React from 'react';

const Card = ({ className = '', children, style }) => {
  return (
    <div
      className={[
        'surface-card',
        className,
      ].join(' ')}
      style={style}
    >
      {children}
    </div>
  );
};

export default Card;
