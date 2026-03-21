'use client';

import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, className }: EmptyStateProps) {
  return (
    <div className={cn('glass-card p-12 text-center space-y-3', className)}>
      <div className="w-14 h-14 rounded-xl bg-surface-200/50 flex items-center justify-center mx-auto">
        <Icon className="w-6 h-6 text-surface-400" />
      </div>
      <h3 className="text-base font-semibold text-surface-700">{title}</h3>
      <p className="text-sm text-surface-500 max-w-sm mx-auto">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}
          className="inline-flex items-center gap-1.5 px-4 py-2 mt-2 rounded-lg text-sm font-medium bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-opacity">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
