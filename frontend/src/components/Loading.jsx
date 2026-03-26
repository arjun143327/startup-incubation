import React from 'react';

const Loading = ({ label = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-neutral-400">
      <div className="w-4 h-4 rounded-full border-2 border-neutral-700 border-t-blue-400 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
};

export default Loading;

