'use client';

import { useState, useCallback } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
  label?: string;
  iconOnly?: boolean;
}

export default function CopyButton({ text, className, label = 'Copy', iconOnly }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md text-xs font-medium transition-all',
        iconOnly ? 'p-1.5' : 'px-2.5 py-1.5',
        copied
          ? iconOnly ? 'text-success' : 'bg-green-500/15 text-green-400'
          : iconOnly ? 'text-surface-500 hover:bg-surface-200/50' : 'bg-surface-200/50 text-surface-500 hover:bg-surface-300/50 hover:text-surface-700',
        className
      )}
      aria-label={copied ? 'Copied' : label}
    >
      {copied ? (
        <>{iconOnly ? <Check className="w-4 h-4" /> : <><Check className="w-3.5 h-3.5" /> Copied</>}</>
      ) : (
        <>{iconOnly ? <Copy className="w-4 h-4" /> : <><Copy className="w-3.5 h-3.5" /> {label}</>}</>
      )}
    </button>
  );
}
