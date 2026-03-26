import React from 'react';

const Table = ({ children, className = '' }) => {
  return (
    <div className={`table-shell ${className}`}>
      <table className="w-full text-left">{children}</table>
    </div>
  );
};

export default Table;
