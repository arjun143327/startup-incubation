import React from 'react';

const Loading = ({ label = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-slate-400">
      <div className="h-4 w-4 rounded-full border-2 border-white/10 border-t-sky-400 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
};

export default Loading;
