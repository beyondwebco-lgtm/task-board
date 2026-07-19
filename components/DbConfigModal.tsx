'use client';

import React from 'react';
import { Database, X, CheckCircle, Server, Code } from 'lucide-react';

interface DbConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbStatus: { connected: boolean; provider: string };
}

export const DbConfigModal: React.FC<DbConfigModalProps> = ({
  isOpen,
  onClose,
  dbStatus,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Database size={22} style={{ color: 'var(--primary)' }} />
            <h2>PostgreSQL Database Configuration</h2>
          </div>
          <button className="btn-icon-only" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: '1.25rem' }}>
          {/* Connection Status Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.85rem 1rem',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 'var(--radius-md)',
              color: '#166534',
            }}
          >
            <CheckCircle size={22} style={{ color: '#22c55e', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                Status: {dbStatus.provider}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                Task records are persistent across refreshes and page reopens.
              </div>
            </div>
          </div>

          {/* Setup Instructions for Neon or Supabase */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.875rem' }}>
              <Server size={16} style={{ color: 'var(--primary)' }} />
              <span>Connecting to Neon or Supabase PostgreSQL</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              To connect your own remote Neon Tech or Supabase PostgreSQL instance, simply set the following environment variable in your <code>.env.local</code> file:
            </p>
            <pre
              style={{
                backgroundColor: 'var(--bg-main)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                border: '1px solid var(--border-light)',
                overflowX: 'auto',
              }}
            >
              <code>DATABASE_URL=&quot;postgres://user:password@ep-xyz.neon.tech/neondb?sslmode=require&quot;</code>
            </pre>
          </div>

          {/* Schema info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.875rem' }}>
              <Code size={16} style={{ color: 'var(--primary)' }} />
              <span>Database Schema (`schema.sql`)</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              The database script is located at <code>schema.sql</code> in the project root. It creates tables for <code>members</code> and <code>tasks</code> with automatic team member seeding.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
