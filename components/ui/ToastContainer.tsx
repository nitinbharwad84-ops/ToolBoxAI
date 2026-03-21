'use client';

import { useToast } from '@/hooks/useToast';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: 'border-green-500/30 bg-green-500/10',
  error: 'border-danger/30 bg-danger/10',
  warning: 'border-warning/30 bg-warning/10',
  info: 'border-primary/30 bg-primary/10',
};

const ICON_COLORS = {
  success: 'text-green-400',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-primary',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              'flex items-start gap-3 px-4 py-3 rounded-lg border backdrop-blur-xl shadow-lg animate-slide-in',
              STYLES[toast.type]
            )}
            role="alert"
          >
            <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', ICON_COLORS[toast.type])} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-800">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-surface-500 mt-0.5">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-0.5 rounded hover:bg-surface-200/50 flex-shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5 text-surface-500" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
