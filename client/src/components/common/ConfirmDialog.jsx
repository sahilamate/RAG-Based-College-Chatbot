import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, Loader2 } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Document?',
  message = 'Are you sure you want to delete this document?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={loading ? () => {} : onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-full shrink-0 ${
            type === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-2 pt-0.5">
          <p className="text-sm font-semibold text-slate-800 leading-relaxed">{message}</p>
          <p className="text-xs font-bold text-rose-600">This action cannot be undone.</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={type === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          disabled={loading}
          icon={loading ? Loader2 : null}
        >
          {loading ? 'Deleting...' : confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

