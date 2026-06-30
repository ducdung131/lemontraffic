'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
}

export function LoadingSpinner({ size = 32, message }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: '2px solid var(--border)',
          borderTopColor: 'var(--accent)',
        }}
      />
      {message && (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{message}</p>
      )}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card">
      <div className="space-y-3">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-8 w-32" />
        <div className="skeleton h-3 w-20" />
      </div>
    </div>
  );
}

export function EmptyState({ title, description, icon }: { title: string; description?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      {icon && (
        <div style={{ color: 'var(--text-muted)', opacity: 0.5 }}>{icon}</div>
      )}
      <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>{title}</p>
      {description && (
        <p className="text-sm text-center max-w-sm" style={{ color: 'var(--text-muted)' }}>{description}</p>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div style={{ color: 'var(--danger)', opacity: 0.7 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>
        {message || 'Something went wrong'}
      </p>
      {onRetry && (
        <button className="btn btn-ghost text-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
