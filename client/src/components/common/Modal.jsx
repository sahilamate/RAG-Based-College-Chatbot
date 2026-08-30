import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/75 transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center relative z-10">
        <div
          className={`w-full ${maxWidth} transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-200 animate-scale-up`}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
