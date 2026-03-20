import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'accent' | 'danger' | 'warning' | 'success' | 'pro';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-200 text-surface-500',
  primary: 'bg-primary/15 text-primary',
  accent: 'bg-accent/15 text-accent',
  danger: 'bg-danger/15 text-danger',
  warning: 'bg-warning/15 text-warning',
  success: 'bg-success/15 text-success',
  pro: 'bg-gradient-to-r from-primary/20 to-accent/20 text-primary',
};

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold', variantStyles[variant], className)}>
      {children}
    </span>
  );
}
