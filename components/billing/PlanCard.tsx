import { cn, formatCurrency } from '@/lib/utils';
import { Check } from 'lucide-react';

interface PlanCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  current?: boolean;
  highlighted?: boolean;
  ctaLabel?: string;
  onSelect?: () => void;
}

export default function PlanCard({ name, price, period, features, current, highlighted, ctaLabel, onSelect }: PlanCardProps) {
  return (
    <div className={cn('glass-card p-6 space-y-4 relative overflow-hidden', highlighted && 'border-primary/30')}>
      {highlighted && <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />}
      <div className="relative space-y-4">
        <div>
          <h3 className="font-bold text-surface-800 text-lg">{name}</h3>
          <p className="text-2xl font-bold text-surface-800">
            {price} <span className="text-sm font-normal text-surface-500">/{period}</span>
          </p>
        </div>
        <ul className="space-y-2">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-surface-600">
              <Check className={cn('w-4 h-4 flex-shrink-0', highlighted ? 'text-accent' : 'text-primary')} />
              {f}
            </li>
          ))}
        </ul>
        {current ? (
          <div className="text-center py-2.5 rounded-lg bg-surface-200/50 text-sm font-medium text-surface-500">
            Current Plan
          </div>
        ) : (
          <button
            onClick={onSelect}
            className={cn(
              'w-full py-2.5 rounded-lg text-sm font-medium transition-all',
              highlighted
                ? 'bg-gradient-to-r from-primary to-accent text-white hover:opacity-90'
                : 'border border-surface-300 text-surface-700 hover:bg-surface-200/50'
            )}
          >
            {ctaLabel || 'Select'}
          </button>
        )}
      </div>
    </div>
  );
}
