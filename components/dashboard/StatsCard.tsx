import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  className?: string;
}

export default function StatsCard({ icon, label, value, trend, className }: StatsCardProps) {
  return (
    <div className={cn('glass-card p-4 space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-success/15 text-success">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-xl font-bold text-surface-800 tabular-nums">{value}</p>
        <p className="text-xs text-surface-500">{label}</p>
      </div>
    </div>
  );
}
