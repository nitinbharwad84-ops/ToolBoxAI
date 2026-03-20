import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  compact?: boolean;
}

export default function LoadingState({ message = 'Loading...', compact }: LoadingStateProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-surface-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        {message}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-3">
      <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
      <p className="text-sm text-surface-500">{message}</p>
    </div>
  );
}
