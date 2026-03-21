'use client';

import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  variant = 'danger',
  loading,
}: ConfirmDialogProps) {
  const btnClass =
    variant === 'danger'
      ? 'bg-danger text-white hover:bg-danger/90'
      : 'bg-primary text-white hover:bg-primary-hover';

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-sm">
      <p className="text-sm text-surface-500 mb-5">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-surface-200 text-surface-600 hover:bg-surface-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${btnClass}`}
        >
          {loading ? 'Deleting...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
