'use client';

import { cn, formatCredits } from '@/lib/utils';

interface CreditMeterProps {
  credits: number;
  plan: string;
  maxCredits?: number;
  compact?: boolean;
}

export default function CreditMeter({ credits, plan, maxCredits, compact }: CreditMeterProps) {
  const max = maxCredits ?? (plan === 'pro' ? 1000 : 100);
  const pct = Math.min((credits / max) * 100, 100);
  const isLow = credits < 20;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-surface-300/50 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', isLow ? 'bg-danger' : 'bg-gradient-to-r from-primary to-accent')}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={cn('text-xs font-medium tabular-nums', isLow ? 'text-danger' : 'text-surface-500')}>
          {formatCredits(credits)}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-surface-500">Credits</span>
        <span className={cn('text-sm font-bold tabular-nums', isLow ? 'text-danger' : 'text-surface-700')}>
          {formatCredits(credits)}
        </span>
      </div>
      <div className="h-2 bg-surface-300/50 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', isLow ? 'bg-danger' : 'bg-gradient-to-r from-primary to-accent')}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isLow && (
        <p className="text-[10px] text-danger font-medium animate-pulse">
          ⚠ Low credits — buy more or add your API key
        </p>
      )}
    </div>
  );
}
