import React from 'react';

const Table = ({ children, className = '' }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-left border-collapse">{children}</table>
    </div>
  );
};

export default Table;

