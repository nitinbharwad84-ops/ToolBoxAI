'use client';

import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

const icons = {
  success: <CheckCircle className="w-4 h-4 text-success" />,
  error: <AlertCircle className="w-4 h-4 text-danger" />,
  info: <Info className="w-4 h-4 text-primary" />,
};

const borderColors = {
  success: 'border-success/30',
  error: 'border-danger/30',
  info: 'border-primary/30',
};

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  const dismiss = useCallback(() => {
    setVisible(false);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(dismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, dismiss]);

  if (!visible) return null;

  return (
    <div className={cn('fixed bottom-6 right-6 z-50 glass-card px-4 py-3 flex items-center gap-3 animate-slide-in', borderColors[type])}>
      {icons[type]}
      <p className="text-sm text-surface-700">{message}</p>
      <button onClick={dismiss} className="p-0.5 rounded hover:bg-surface-200/50">
        <X className="w-3 h-3 text-surface-500" />
      </button>
    </div>
  );
}
