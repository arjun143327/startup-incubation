import React from 'react';

const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 min-h-full flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
          <div className="px-6 py-4 border-b border-neutral-700/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-300 hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-neutral-800"
            >
              Close
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

