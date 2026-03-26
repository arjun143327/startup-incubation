import React from 'react';

const EmptyState = ({ title = 'Nothing here yet', description = '' }) => {
  return (
    <div className="surface-card p-10 text-center">
      <h3 className="mb-1 font-semibold text-slate-100">{title}</h3>
      {description ? <p className="text-sm text-slate-400">{description}</p> : null}
    </div>
  );
};

export default EmptyState;
