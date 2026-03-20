'use client';

import { cn } from '@/lib/utils';
import ProviderBadge from '@/components/dashboard/ProviderBadge';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface ResumeRoasterResultProps {
  result: Record<string, unknown>;
  provider?: string;
  showProvider?: boolean;
  onReset: () => void;
}

export default function ResumeRoasterResult({ result, provider, showProvider, onReset }: ResumeRoasterResultProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-5 space-y-4 animate-slide-in">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-surface-800">🔥 Roast Complete</h2>
        <div className="flex items-center gap-2">
          <ProviderBadge provider={provider ?? ''} show={showProvider} />
          <button onClick={copy} className="p-1.5 rounded-md hover:bg-surface-200/50 transition-colors">
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-surface-500" />}
          </button>
        </div>
      </div>

      {result.overall_score !== undefined && (
        <div className="flex items-center gap-4">
          <div className={cn('text-3xl font-bold',
            (result.overall_score as number) >= 70 ? 'text-success' :
            (result.overall_score as number) >= 40 ? 'text-warning' : 'text-danger')}>
            {String(result.overall_score)}/100
          </div>
          {result.verdict ? (
            <p className="text-sm text-surface-600 italic">&ldquo;{String(result.verdict)}&rdquo;</p>
          ) : null}
        </div>
      )}

      {Array.isArray(result.top_fixes) && (
        <div>
          <h4 className="text-sm font-medium text-danger mb-2">🚨 Top Fixes</h4>
          <ol className="space-y-1 list-decimal list-inside">
            {(result.top_fixes as string[]).map((f, i) => (
              <li key={i} className="text-sm text-surface-600">{f}</li>
            ))}
          </ol>
        </div>
      )}

      <button onClick={onReset} className="text-sm text-surface-500 hover:text-primary transition-colors flex items-center gap-1">
        <RotateCcw className="w-3 h-3" /> Run again
      </button>
    </div>
  );
}
