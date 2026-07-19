'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskTitle?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444' }}>
            <AlertTriangle size={24} />
            <h2 style={{ fontSize: '1.1rem' }}>Delete Task</h2>
          </div>
          <button className="btn-icon-only" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ paddingTop: '0.75rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Are you sure you want to delete <strong>&quot;{taskTitle || 'this task'}&quot;</strong>? This action cannot be undone.
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
};
