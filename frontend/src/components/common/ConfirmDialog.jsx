import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = true,
  loading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      maxWidth="max-w-md"
      showCloseButton={!loading}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full shrink-0 ${danger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-slate-900">{title}</h4>
          <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
