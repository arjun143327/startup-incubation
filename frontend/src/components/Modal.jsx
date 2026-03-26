import React from 'react';

const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 min-h-full flex items-center justify-center p-4">
        <div className="surface-card w-full max-w-xl bg-[rgba(15,23,42,0.92)]">
          <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3 py-1 text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
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
