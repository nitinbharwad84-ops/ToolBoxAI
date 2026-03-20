import { cn, formatCredits } from '@/lib/utils';

interface TransactionRowProps {
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  balanceAfter?: number;
}

const typeLabels: Record<string, string> = {
  purchase: '💳 Purchase',
  subscription_grant: '🔄 Subscription',
  tool_use: '🔧 Tool Use',
  bonus: '🎁 Bonus',
  refund: '↩ Refund',
  initial_grant: '🎉 Welcome',
};

export default function TransactionRow({ type, amount, description, createdAt, balanceAfter }: TransactionRowProps) {
  const isPositive = amount > 0;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-surface-300/20 last:border-0">
      <span className="text-xs whitespace-nowrap">{typeLabels[type] || type}</span>
      <p className="flex-1 text-sm text-surface-600 truncate">{description}</p>
      <span className={cn('text-sm font-medium tabular-nums', isPositive ? 'text-success' : 'text-danger')}>
        {isPositive ? '+' : ''}{formatCredits(amount)}
      </span>
      {balanceAfter !== undefined && (
        <span className="text-xs text-surface-400 tabular-nums w-16 text-right">{formatCredits(balanceAfter)}</span>
      )}
      <span className="text-xs text-surface-400 w-20 text-right">{new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
    </div>
  );
}
