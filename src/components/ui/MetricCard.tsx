'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  iconBg?: string;
  subtitle?: string;
  loading?: boolean;
  delay?: number;
}

export function MetricCard({
  title,
  value,
  change,
  icon,
  iconBg = 'var(--accent-muted)',
  subtitle,
  loading = false,
  delay = 0,
}: MetricCardProps) {
  const isPositive = (change ?? 0) > 0;
  const isNegative = (change ?? 0) < 0;
  const isNeutral = change === undefined || change === 0;

  return (
    <motion.div
      className="card group cursor-default"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ scale: 1.01 }}
    >
      {loading ? (
        <div className="space-y-3">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-8 w-32" />
          <div className="skeleton h-3 w-20" />
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-4">
            <div
              className="p-2.5 rounded-xl"
              style={{ background: iconBg }}
            >
              {icon}
            </div>
            {!isNeutral && (
              <div
                className={cn(
                  'badge text-xs',
                  isPositive ? 'badge-up' : 'badge-down'
                )}
              >
                {isPositive ? (
                  <TrendingUp size={10} />
                ) : (
                  <TrendingDown size={10} />
                )}
                {Math.abs(change!).toFixed(1)}%
              </div>
            )}
            {isNeutral && change === 0 && (
              <div className="badge badge-neutral">
                <Minus size={10} />
                0%
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
