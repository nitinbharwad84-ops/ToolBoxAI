import { cn } from '@/lib/utils';

interface LiveCreditCostProps {
  cost: number;
  className?: string;
}

export default function LiveCreditCost({ cost, className }: LiveCreditCostProps) {
  return (
    <span className={cn('text-sm font-medium px-3 py-1 rounded-full bg-primary/15 text-primary tabular-nums', className)}>
      {cost} credits
    </span>
  );
}
