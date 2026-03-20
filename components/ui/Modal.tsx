'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { type ReactNode, useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export default function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative glass-card p-6 max-w-lg w-full mx-4 animate-fade-in', className)}>
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-semibold text-surface-800">{title}</h3>}
          <button onClick={onClose} className="p-1 rounded-md hover:bg-surface-200/50 transition-colors">
            <X className="w-4 h-4 text-surface-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
