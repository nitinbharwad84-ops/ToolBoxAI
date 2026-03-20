'use client';

import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { type ReactNode, useState } from 'react';

interface TweakPanelProps {
  creditCost: number;
  onReset: () => void;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function TweakPanel({ creditCost, onReset, children, defaultOpen = false }: TweakPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`Customize settings, ${creditCost} credits`}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-surface-200/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-surface-600">⚙ Customize</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary">
            {creditCost} credits
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-surface-500" /> : <ChevronDown className="w-4 h-4 text-surface-500" />}
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-surface-300/30 pt-4">
          {children}
          <div className="flex items-center justify-between pt-2 border-t border-surface-300/30">
            <span className="text-xs text-surface-500">
              Credits: <span className="font-bold text-primary">{creditCost}</span>
            </span>
            <button
              onClick={onReset}
              className="text-xs text-surface-500 hover:text-surface-700 transition-colors flex items-center gap-1"
              aria-label="Reset to defaults"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
