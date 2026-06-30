'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type DateRange = 'today' | 'yesterday' | '7d' | '30d' | '90d' | 'this_month' | 'last_month';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
}

const RANGES: Array<{ label: string; value: DateRange }> = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const current = RANGES.find(r => r.value === value);

  return (
    <div className="relative">
      <button
        className="btn btn-ghost text-sm font-medium flex items-center gap-2"
        onClick={() => setOpen(!open)}
        style={{ padding: '8px 14px' }}
      >
        <span style={{ color: 'var(--text-muted)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </span>
        <span style={{ color: 'var(--text-primary)' }}>{current?.label}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 z-20 rounded-xl border overflow-hidden shadow-xl"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              minWidth: '180px',
            }}
          >
            {RANGES.map(range => (
              <button
                key={range.value}
                className={cn(
                  'w-full px-4 py-2.5 text-left text-sm transition-colors',
                  value === range.value
                    ? 'font-medium'
                    : ''
                )}
                style={{
                  color: value === range.value ? 'var(--accent)' : 'var(--text-secondary)',
                  background: value === range.value ? 'var(--accent-muted)' : 'transparent',
                }}
                onMouseEnter={e => {
                  if (value !== range.value) (e.target as HTMLButtonElement).style.background = 'var(--bg-tertiary)';
                }}
                onMouseLeave={e => {
                  if (value !== range.value) (e.target as HTMLButtonElement).style.background = 'transparent';
                }}
                onClick={() => {
                  onChange(range.value);
                  setOpen(false);
                }}
              >
                {range.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export type { DateRange };
