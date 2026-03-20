import Link from 'next/link';
import { FileSearch } from 'lucide-react';

interface EmptyStateProps {
  icon?: typeof FileSearch;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon = FileSearch,
  title = 'Nothing here yet',
  description = 'Get started by using one of the tools.',
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center">
      <div className="w-12 h-12 rounded-xl bg-surface-200/50 flex items-center justify-center">
        <Icon className="w-6 h-6 text-surface-400" />
      </div>
      <h3 className="font-semibold text-surface-700">{title}</h3>
      <p className="text-sm text-surface-500 max-w-sm">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="text-sm font-medium text-primary hover:underline">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button onClick={onAction} className="text-sm font-medium text-primary hover:underline">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
