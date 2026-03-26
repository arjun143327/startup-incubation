import React from 'react';

const EmptyState = ({ title = 'Nothing here yet', description = '' }) => {
  return (
    <div className="glass rounded-2xl p-10 text-center">
      <h3 className="text-neutral-200 font-semibold mb-1">{title}</h3>
      {description ? <p className="text-neutral-400 text-sm">{description}</p> : null}
    </div>
  );
};

export default EmptyState;

