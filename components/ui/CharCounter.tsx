import { cn } from '@/lib/utils';

interface CharCounterProps {
  current: number;
  max?: number;
  className?: string;
}

export default function CharCounter({ current, max, className }: CharCounterProps) {
  const ratio = max ? current / max : 0;
  const isWarning = ratio > 0.85;
  const isOver = max ? current > max : false;

  return (
    <span className={cn(
      'text-xs tabular-nums transition-colors',
      isOver ? 'text-danger font-medium' : isWarning ? 'text-amber-500' : 'text-surface-400',
      className,
    )}>
      {current.toLocaleString()}{max ? ` / ${max.toLocaleString()}` : ' chars'}
    </span>
  );
}
