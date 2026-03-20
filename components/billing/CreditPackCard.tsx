'use client';

import { cn, formatCurrency } from '@/lib/utils';

interface CreditPackCardProps {
  name: string;
  credits: number;
  pricePaise: number;
  popular?: boolean;
  description?: string;
  onBuy: () => void;
  loading?: boolean;
}

export default function CreditPackCard({ name, credits, pricePaise, popular, description, onBuy, loading }: CreditPackCardProps) {
  return (
    <div className={cn('glass-card p-5 space-y-3 relative', popular && 'border-primary/30')}>
      {popular && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-0.5 rounded-full bg-gradient-to-r from-primary to-accent text-white">
          POPULAR
        </span>
      )}
      <h3 className="font-bold text-surface-800">{name}</h3>
      <p className="text-2xl font-bold text-surface-800">
        {formatCurrency(pricePaise)}
        <span className="text-xs font-normal text-surface-500 ml-1">{credits} credits</span>
      </p>
      {description && <p className="text-xs text-surface-500">{description}</p>}
      <button
        onClick={onBuy}
        disabled={loading}
        className={cn(
          'w-full py-2 rounded-lg text-sm font-medium transition-all',
          popular
            ? 'bg-gradient-to-r from-primary to-accent text-white hover:opacity-90'
            : 'bg-surface-200 text-surface-700 hover:bg-surface-300'
        )}
      >
        {loading ? 'Processing...' : 'Buy Now'}
      </button>
    </div>
  );
}
